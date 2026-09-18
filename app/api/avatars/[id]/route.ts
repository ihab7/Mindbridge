export const runtime = "nodejs"

import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { canViewAvatar, loadAvatar } from "@/lib/avatars"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// GET /api/avatars/{id}: the only way to read a profile photo.
// Access depends on the OWNER's role (lib/avatars.ts canViewAvatar):
//   practitioner → public, no session needed (shown in the directory)
//   patient      → the patient and their linked practitioner only
// Anything not allowed answers 404, exactly like a missing id, so the route
// never confirms that a patient photo exists.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } })
  if (!UUID.test(id)) return notFound()

  const sql = getSql()
  const avatar = await loadAvatar(sql, id)
  if (!avatar) return notFound()

  const isPublic = avatar.ownerRole === "practitioner"
  const viewer = isPublic ? null : await getSession()
  if (!(await canViewAvatar(sql, viewer, avatar))) return notFound()

  return new Response(new Uint8Array(avatar.bytes), {
    status: 200,
    headers: {
      "Content-Type": avatar.contentType,
      "Content-Length": String(avatar.bytes.length),
      // An id is never reused (a new upload gets a new id), so the bytes behind
      // a URL never change. Patient photos may only sit in the viewer's own
      // browser cache, never in a shared/CDN cache.
      "Cache-Control": isPublic ? "public, max-age=31536000, immutable" : "private, max-age=3600",
      ...(isPublic ? {} : { Vary: "Cookie" }),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox",
      "Content-Disposition": "inline",
    },
  })
}
