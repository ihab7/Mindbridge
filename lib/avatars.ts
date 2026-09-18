import type { getSql } from "@/lib/db"
import type { User } from "@/lib/auth"
import { AVATAR_MAX_DIMENSION, AVATAR_MAX_STORED_BYTES, type AvatarErrorCode } from "@/lib/avatars-shared"

// Profile photos (table: avatars, see scripts/migrate.sql). Stored in the
// database and served only through GET /api/avatars/{id}, which decides per
// OWNER role at read time:
//   - practitioner's photo → public (the directory shows it to visitors)
//   - patient's photo      → the patient themself and their linked practitioner
// Nothing the client says about the file is trusted: the format is detected
// from the bytes, and dimensions are read from the image header.

type Sql = ReturnType<typeof getSql>

export type DetectedImage = { contentType: "image/jpeg" | "image/png" | "image/webp"; width: number; height: number }

function jpegSize(b: Buffer): { width: number; height: number } | null {
  let i = 2
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null
    const marker = b[i + 1]
    if (marker === 0xff) { i += 1; continue }
    // Standalone markers carry no length.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue }
    const length = b.readUInt16BE(i + 2)
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    if (isStartOfFrame) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) }
    if (length < 2) return null
    i += 2 + length
  }
  return null
}

function webpSize(b: Buffer): { width: number; height: number } | null {
  if (b.length < 30) return null
  const chunk = b.toString("ascii", 12, 16)
  if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff }
  if (chunk === "VP8L") {
    const b1 = b[21], b2 = b[22], b3 = b[23], b4 = b[24]
    return { width: 1 + (((b2 & 0x3f) << 8) | b1), height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)) }
  }
  if (chunk === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) }
  return null
}

/** Identifies JPEG / PNG / WebP from magic bytes and reads the pixel size. Anything else → null. */
export function detectImage(b: Buffer): DetectedImage | null {
  if (b.length < 16) return null
  let size: { width: number; height: number } | null = null
  let contentType: DetectedImage["contentType"]
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    contentType = "image/jpeg"
    size = jpegSize(b)
  } else if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    contentType = "image/png"
    if (b.toString("ascii", 12, 16) === "IHDR") size = { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
  } else if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    contentType = "image/webp"
    size = webpSize(b)
  } else {
    return null
  }
  if (!size || size.width < 1 || size.height < 1) return null
  return { contentType, ...size }
}

export type ValidatedAvatar = { ok: true; bytes: Buffer; image: DetectedImage } | { ok: false; errorCode: AvatarErrorCode; status: number }

/** Server-side validation of an uploaded file. Never relies on the declared type or name. */
export async function validateAvatarFile(file: unknown): Promise<ValidatedAvatar> {
  if (!file || typeof file !== "object" || typeof (file as Blob).arrayBuffer !== "function") {
    return { ok: false, errorCode: "no_file", status: 400 }
  }
  const blob = file as Blob
  if (blob.size === 0) return { ok: false, errorCode: "no_file", status: 400 }
  if (blob.size > AVATAR_MAX_STORED_BYTES) return { ok: false, errorCode: "too_large", status: 413 }
  const bytes = Buffer.from(await blob.arrayBuffer())
  const image = detectImage(bytes)
  if (!image) return { ok: false, errorCode: "invalid_type", status: 415 }
  if (image.width > AVATAR_MAX_DIMENSION || image.height > AVATAR_MAX_DIMENSION) {
    return { ok: false, errorCode: "invalid_image", status: 422 }
  }
  return { ok: true, bytes, image }
}

/**
 * Stores a new avatar for the user and drops the previous one, in ONE
 * statement (atomic): the users row always points at an existing avatar or
 * none. A replaced avatar's id stops resolving immediately.
 */
export async function replaceAvatar(sql: Sql, userId: number, bytes: Buffer, image: DetectedImage): Promise<string> {
  const rows = (await sql`
    WITH previous AS (
      SELECT avatar_id FROM users WHERE id = ${userId}
    ),
    created AS (
      INSERT INTO avatars (owner_user_id, content_type, data, byte_size, width, height)
      VALUES (${userId}, ${image.contentType}, decode(${bytes.toString("hex")}, 'hex'), ${bytes.length}, ${image.width}, ${image.height})
      RETURNING id
    ),
    linked AS (
      UPDATE users SET avatar_id = (SELECT id FROM created) WHERE id = ${userId}
      RETURNING id
    ),
    dropped AS (
      DELETE FROM avatars
      WHERE id = (SELECT avatar_id FROM previous) AND owner_user_id = ${userId}
      RETURNING id
    )
    SELECT id::text FROM created
  `) as { id: string }[]
  return rows[0].id
}

/** Removes the user's avatar (back to initials). Returns whether one existed. */
export async function removeAvatar(sql: Sql, userId: number): Promise<boolean> {
  const rows = (await sql`
    WITH previous AS (
      SELECT avatar_id FROM users WHERE id = ${userId}
    ),
    unlinked AS (
      UPDATE users SET avatar_id = NULL WHERE id = ${userId}
      RETURNING id
    )
    DELETE FROM avatars
    WHERE id = (SELECT avatar_id FROM previous) AND owner_user_id = ${userId}
    RETURNING id
  `) as { id: string }[]
  return rows.length > 0
}

export async function getAvatarId(sql: Sql, userId: number): Promise<string | null> {
  const rows = (await sql`SELECT avatar_id::text AS avatar_id FROM users WHERE id = ${userId}`) as { avatar_id: string | null }[]
  return rows[0]?.avatar_id ?? null
}

export type StoredAvatar = { contentType: string; bytes: Buffer; ownerId: number; ownerRole: "patient" | "practitioner" }

/** Only the owner's CURRENT avatar resolves; replaced or orphaned rows do not. */
export async function loadAvatar(sql: Sql, avatarId: string): Promise<StoredAvatar | null> {
  const rows = (await sql`
    SELECT a.content_type, encode(a.data, 'base64') AS b64, u.id AS owner_id, u.role AS owner_role
    FROM avatars a
    JOIN users u ON u.id = a.owner_user_id AND u.avatar_id = a.id
    WHERE a.id = ${avatarId}
  `) as { content_type: string; b64: string; owner_id: number; owner_role: "patient" | "practitioner" }[]
  const r = rows[0]
  if (!r) return null
  return { contentType: r.content_type, bytes: Buffer.from(r.b64, "base64"), ownerId: Number(r.owner_id), ownerRole: r.owner_role }
}

/**
 * Read rule, decided by the OWNER's role (not one uniform rule):
 * practitioner photos are public, patient photos are private to the patient
 * and the practitioner they are linked to.
 */
export async function canViewAvatar(sql: Sql, viewer: User | null, avatar: StoredAvatar): Promise<boolean> {
  if (avatar.ownerRole === "practitioner") return true
  if (!viewer) return false
  if (viewer.id === avatar.ownerId) return true
  if (viewer.role !== "practitioner") return false
  const link = (await sql`
    SELECT 1 FROM patients WHERE user_id = ${avatar.ownerId} AND practitioner_id = ${viewer.id}
  `) as unknown[]
  return link.length > 0
}
