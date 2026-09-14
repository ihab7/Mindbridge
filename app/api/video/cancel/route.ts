export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getConsultationForParticipant, cancelConsultation } from "@/lib/video/data"

// Patient side: "Ce n'est pas le moment" on an incoming urgent call, or
// declining a scheduled one. Practitioner side: calling off a call they
// created before it started. Only reachable while status is still 'pending'
// (see cancelConsultation) — an active or already-finished call can't be
// cancelled out from under someone.
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

  const updated = await cancelConsultation(sql, id)
  if (!updated) {
    // Already active/completed/cancelled — nothing to do, not an error.
    return NextResponse.json({ ok: true, cancelled: false })
  }
  return NextResponse.json({ ok: true, cancelled: true })
}
