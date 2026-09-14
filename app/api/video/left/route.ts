export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getConsultationForParticipant, markLeft } from "@/lib/video/data"

// Called by whichever participant's Jitsi iframe fires videoConferenceLeft
// first — a 1:1 call ends for both sides at that point.
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

  // No-op (0 rows updated) if the call was never active — safe to call
  // unconditionally from a leave/unload handler.
  await markLeft(sql, id)
  return NextResponse.json({ ok: true })
}
