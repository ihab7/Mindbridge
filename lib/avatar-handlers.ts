import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { getAvatarId, removeAvatar, replaceAvatar, validateAvatarFile } from "@/lib/avatars"
import { AVATAR_MAX_STORED_BYTES, avatarUrl } from "@/lib/avatars-shared"

// Shared by PUT/DELETE /api/practitioner/avatar and /api/patient/avatar.
// Each route only ever acts on the SESSION user's own account and requires
// the matching role — there is no user id in the request to tamper with.

type Role = "patient" | "practitioner"

async function requireRole(role: Role) {
  const user = await getSession()
  if (!user) return { error: NextResponse.json({ errorCode: "unauthorized" }, { status: 401 }) }
  if (user.role !== role) return { error: NextResponse.json({ errorCode: "forbidden" }, { status: 403 }) }
  return { user }
}

export async function handleAvatarPut(request: Request, role: Role) {
  const auth = await requireRole(role)
  if ("error" in auth) return auth.error

  // Refuse oversized bodies before parsing them (multipart overhead allowed).
  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > AVATAR_MAX_STORED_BYTES + 16 * 1024) {
    return NextResponse.json({ errorCode: "too_large" }, { status: 413 })
  }

  let file: FormDataEntryValue | null = null
  try {
    file = (await request.formData()).get("file")
  } catch {
    return NextResponse.json({ errorCode: "no_file" }, { status: 400 })
  }

  const checked = await validateAvatarFile(file)
  if (!checked.ok) return NextResponse.json({ errorCode: checked.errorCode }, { status: checked.status })

  try {
    const id = await replaceAvatar(getSql(), auth.user.id, checked.bytes, checked.image)
    return NextResponse.json({ avatarUrl: avatarUrl(id) })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ errorCode: "server_error" }, { status: 500 })
  }
}

export async function handleAvatarDelete(role: Role) {
  const auth = await requireRole(role)
  if ("error" in auth) return auth.error
  try {
    await removeAvatar(getSql(), auth.user.id)
    return NextResponse.json({ avatarUrl: null })
  } catch (error) {
    console.error("Avatar removal error:", error)
    return NextResponse.json({ errorCode: "server_error" }, { status: 500 })
  }
}

export async function handleAvatarGetOwn(role: Role) {
  const auth = await requireRole(role)
  if ("error" in auth) return auth.error
  return NextResponse.json({ avatarUrl: avatarUrl(await getAvatarId(getSql(), auth.user.id)) })
}
