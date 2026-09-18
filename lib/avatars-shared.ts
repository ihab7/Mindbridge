// Profile-photo constants and helpers safe to import from client components.
// Server-side storage and access rules live in lib/avatars.ts.

/** What the file picker accepts (validated again, from the bytes, on the server). */
export const AVATAR_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
/** Limit on the file the user picks, before client-side compression. */
export const AVATAR_MAX_INPUT_BYTES = 5 * 1024 * 1024
/** Limit on what is actually uploaded and stored (after compression). */
export const AVATAR_MAX_STORED_BYTES = 256 * 1024
/** The client crops to a square and scales down to at most this many pixels. */
export const AVATAR_OUTPUT_SIZE = 512
/** Upper bound the server accepts for either dimension. */
export const AVATAR_MAX_DIMENSION = 1024

/** Opaque, access-controlled URL for an avatar id (never contains a user id). */
export function avatarUrl(avatarId: string | null | undefined): string | null {
  return avatarId ? `/api/avatars/${avatarId}` : null
}

export type AvatarErrorCode = "invalid_type" | "too_large" | "invalid_image" | "no_file" | "server_error"

export const AVATAR_ERROR_KEYS: Record<AvatarErrorCode, string> = {
  invalid_type: "avatar.errors.type",
  too_large: "avatar.errors.tooLarge",
  invalid_image: "avatar.errors.unreadable",
  no_file: "avatar.errors.uploadFailed",
  server_error: "avatar.errors.uploadFailed",
}
