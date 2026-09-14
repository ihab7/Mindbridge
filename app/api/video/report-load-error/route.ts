export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getConsultationForParticipant } from "@/lib/video/data"

// Client-side Jitsi failed to load (network error, or the 10s ceiling in
// video-call-room-shell.tsx expired with no JitsiMeetExternalAPI). Nothing
// is mutated here — meet.jit.si failing is not this app's fault to record
// against the consultation row — this exists purely so the failure shows up
// in server logs instead of only in one person's browser console.
export async function POST(request: Request) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === "string" ? body.id : null
  if (!id) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 })
  }

  const sql = getSql()
  const consultation = await getConsultationForParticipant(sql, id, user.id)
  if (!consultation) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  console.error("[video] Jitsi failed to load client-side:", {
    consultationId: id,
    userId: user.id,
    role: consultation.practitionerId === user.id ? "practitioner" : "patient",
    reason: typeof body?.reason === "string" ? body.reason : "unknown",
  })

  return NextResponse.json({ ok: true })
}
