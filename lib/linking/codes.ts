import { randomInt } from "crypto"
import type { getSql } from "@/lib/db"

// Patient ↔ practitioner linking codes (table: patient_linking_codes, see
// scripts/migrate.sql). A `patients` row — the link — is created ONLY here:
// either for an existing patient account (redeemCodeForPatient) or together
// with a brand-new one (createPatientWithCode). Both go through the same
// claim-and-link statement shape, so the rules (single use, 48 h, never
// overwrite an existing link) live in one place.
//
// Atomicity: the neon HTTP driver has no interactive transactions, so each
// "claim the code + insert the link" is ONE statement built from
// data-modifying CTEs. Postgres runs it atomically: if the link insert fails
// (e.g. the patient got linked a millisecond earlier — UNIQUE(user_id)), the
// code claim rolls back with it. Row locking on the UPDATE makes a code
// single-use even under concurrent redemptions: the second one re-checks
// `used_at IS NULL`, finds it false, claims nothing and links nothing.

type Sql = ReturnType<typeof getSql>

// Timestamps leave SQL as ISO-8601 UTC ("2026-09-19T07:19:02Z") via to_char:
// Postgres' own text form ("2026-09-19 07:19:02+00") isn't parsed by every browser.

/** No 0/O, 1/I/L — easy to read aloud and to copy from an SMS. */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
export const CODE_LENGTH = 6
export const CODE_VALIDITY_HOURS = 48
const MAX_GENERATION_ATTEMPTS = 8

export function generateCode(): string {
  let code = ""
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return code
}

/** Uppercases and drops spaces/dashes, so "7k4 m9p" and "7K4-M9P" both work. */
export function normalizeCode(input: unknown): string {
  return typeof input === "string" ? input.toUpperCase().replace(/[\s-]/g, "") : ""
}

export function isWellFormedCode(code: string): boolean {
  if (code.length !== CODE_LENGTH) return false
  for (const ch of code) if (!CODE_ALPHABET.includes(ch)) return false
  return true
}

function pgCode(err: unknown): string | undefined {
  return err && typeof err === "object" && typeof (err as { code?: unknown }).code === "string"
    ? (err as { code: string }).code
    : undefined
}

export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  if (pgCode(err) !== "23505") return false
  if (!constraint) return true
  return String((err as { constraint?: unknown }).constraint ?? (err as { message?: unknown }).message ?? "").includes(constraint)
}

// ── Practitioner side ──────────────────────────────────────────────────────

export async function createLinkingCode(sql: Sql, practitionerId: number) {
  // Uniqueness is checked by the insert itself (ON CONFLICT on the UNIQUE
  // code): a collision inserts nothing and we draw again. 31^6 ≈ 887M codes,
  // so a retry is already rare.
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const rows = (await sql`
      INSERT INTO patient_linking_codes (code, practitioner_id, expires_at)
      VALUES (${generateCode()}, ${practitionerId}, NOW() + make_interval(hours => ${CODE_VALIDITY_HOURS}))
      ON CONFLICT (code) DO NOTHING
      RETURNING code, to_char(expires_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS expires_at
    `) as { code: string; expires_at: string }[]
    if (rows.length > 0) return { code: rows[0].code, expiresAt: rows[0].expires_at }
  }
  throw new Error("Could not generate a unique linking code")
}

export type LinkingCodeRow = {
  code: string
  createdAt: string
  expiresAt: string
  usedAt: string | null
  patientId: number | null
  patientName: string | null
  status: "active" | "used" | "expired"
}

export async function listRecentCodes(sql: Sql, practitionerId: number, limit = 10): Promise<LinkingCodeRow[]> {
  const rows = (await sql`
    SELECT c.code,
           to_char(c.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at,
           to_char(c.expires_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS expires_at,
           to_char(c.used_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS used_at,
           c.used_by_patient_id, u.name AS patient_name,
           CASE
             WHEN c.used_at IS NOT NULL THEN 'used'
             WHEN c.expires_at <= NOW() THEN 'expired'
             ELSE 'active'
           END AS status
    FROM patient_linking_codes c
    LEFT JOIN users u ON u.id = c.used_by_patient_id
    WHERE c.practitioner_id = ${practitionerId}
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `) as Record<string, unknown>[]
  return rows.map((r) => ({
    code: String(r.code),
    createdAt: String(r.created_at),
    expiresAt: String(r.expires_at),
    usedAt: r.used_at == null ? null : String(r.used_at),
    patientId: r.used_by_patient_id == null ? null : Number(r.used_by_patient_id),
    patientName: r.patient_name == null ? null : String(r.patient_name),
    status: r.status as LinkingCodeRow["status"],
  }))
}

/** Codes redeemed since the practitioner last acknowledged them. */
export async function listUnseenLinks(sql: Sql, practitionerId: number) {
  const rows = (await sql`
    SELECT c.used_by_patient_id AS patient_id, u.name AS patient_name
    FROM patient_linking_codes c
    JOIN users u ON u.id = c.used_by_patient_id
    WHERE c.practitioner_id = ${practitionerId}
      AND c.used_at IS NOT NULL
      AND c.practitioner_seen_at IS NULL
    ORDER BY c.used_at DESC
  `) as Record<string, unknown>[]
  return rows.map((r) => ({ patientId: Number(r.patient_id), patientName: String(r.patient_name) }))
}

/** Acknowledge new-link notices — all of them, or only the one for `patientId`. */
export async function markLinksSeen(sql: Sql, practitionerId: number, patientId?: number) {
  if (patientId != null) {
    await sql`
      UPDATE patient_linking_codes SET practitioner_seen_at = NOW()
      WHERE practitioner_id = ${practitionerId} AND used_by_patient_id = ${patientId}
        AND used_at IS NOT NULL AND practitioner_seen_at IS NULL
    `
    return
  }
  await sql`
    UPDATE patient_linking_codes SET practitioner_seen_at = NOW()
    WHERE practitioner_id = ${practitionerId} AND used_at IS NOT NULL AND practitioner_seen_at IS NULL
  `
}

// ── Patient side ───────────────────────────────────────────────────────────

// TODO: pas de rate-limiting sur les tentatives
// de saisie de code. Acceptable tant que le
// volume d'utilisateurs reste faible ; à
// réévaluer avant un vrai lancement public
// (ajouter un compteur d'échecs par IP ou par
// compte, verrouillage temporaire après N
// tentatives).

export type RedeemResult =
  | { ok: true; practitionerName: string }
  | { ok: false; error: "code_format" | "code_invalid" }
  | { ok: false; error: "already_linked"; practitionerName: string }

async function currentPractitionerName(sql: Sql, patientId: number): Promise<string | null> {
  const rows = (await sql`
    SELECT u.name FROM patients p JOIN users u ON u.id = p.practitioner_id
    WHERE p.user_id = ${patientId}
  `) as { name: string }[]
  return rows.length > 0 ? rows[0].name : null
}

/** Existing, signed-in patient enters a code (dashboard). Never overwrites a link. */
export async function redeemCodeForPatient(sql: Sql, patientId: number, rawCode: unknown): Promise<RedeemResult> {
  const code = normalizeCode(rawCode)
  if (!isWellFormedCode(code)) return { ok: false, error: "code_format" }

  const existing = await currentPractitionerName(sql, patientId)
  if (existing) return { ok: false, error: "already_linked", practitionerName: existing }

  try {
    const rows = (await sql`
      WITH claimed AS (
        UPDATE patient_linking_codes
        SET used_at = NOW(), used_by_patient_id = ${patientId}
        WHERE code = ${code} AND used_at IS NULL AND expires_at > NOW()
        RETURNING practitioner_id
      ),
      link AS (
        INSERT INTO patients (user_id, practitioner_id)
        SELECT ${patientId}, practitioner_id FROM claimed
        RETURNING practitioner_id
      )
      SELECT u.name AS practitioner_name
      FROM link JOIN users u ON u.id = link.practitioner_id
    `) as { practitioner_name: string }[]
    if (rows.length === 0) return { ok: false, error: "code_invalid" }
    return { ok: true, practitionerName: rows[0].practitioner_name }
  } catch (err) {
    // Linked by a concurrent request between the check above and the insert:
    // the whole statement (code claim included) was rolled back.
    if (isUniqueViolation(err, "patients_user_id_key")) {
      const name = await currentPractitionerName(sql, patientId)
      if (name) return { ok: false, error: "already_linked", practitionerName: name }
    }
    throw err
  }
}

export type CreatePatientResult =
  | { ok: true; user: { id: number; role: "patient"; name: string; email: string }; practitionerName: string }
  | { ok: false; error: "code_format" | "code_invalid" }

/**
 * Sign-up with a code: the account, the code claim and the link are created
 * together or not at all — an invalid code creates NO account, so the patient
 * can fix the code and retry with the same email.
 *
 * The user id is reserved from the sequence first because the code row must
 * record `used_by_patient_id` in the same statement that inserts the user.
 * The foreign key is checked at the end of the statement, when that user row
 * exists. A duplicate email raises 23505 (users_email_key) and rolls
 * everything back; the caller maps it.
 */
export async function createPatientWithCode(
  sql: Sql,
  input: { name: string; email: string; passwordHash: string; code: unknown },
): Promise<CreatePatientResult> {
  const code = normalizeCode(input.code)
  if (!isWellFormedCode(code)) return { ok: false, error: "code_format" }

  const [{ id }] = (await sql`SELECT nextval(pg_get_serial_sequence('users', 'id'))::int AS id`) as { id: number }[]

  const rows = (await sql`
    WITH claimed AS (
      UPDATE patient_linking_codes
      SET used_at = NOW(), used_by_patient_id = ${id}
      WHERE code = ${code} AND used_at IS NULL AND expires_at > NOW()
      RETURNING practitioner_id
    ),
    new_user AS (
      INSERT INTO users (id, role, name, email, password_hash)
      SELECT ${id}, 'patient', ${input.name}, ${input.email}, ${input.passwordHash} FROM claimed
      RETURNING id, role, name, email
    ),
    link AS (
      INSERT INTO patients (user_id, practitioner_id)
      SELECT new_user.id, claimed.practitioner_id FROM new_user CROSS JOIN claimed
      RETURNING practitioner_id
    )
    SELECT new_user.id, new_user.role, new_user.name, new_user.email, pu.name AS practitioner_name
    FROM new_user
    JOIN link ON true
    JOIN users pu ON pu.id = link.practitioner_id
  `) as { id: number; role: "patient"; name: string; email: string; practitioner_name: string }[]

  if (rows.length === 0) return { ok: false, error: "code_invalid" }
  const r = rows[0]
  return { ok: true, user: { id: Number(r.id), role: "patient", name: r.name, email: r.email }, practitionerName: r.practitioner_name }
}
