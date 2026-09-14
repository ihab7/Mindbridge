export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getConsultationForParticipant, markJoined } from "@/lib/video/data"

// Called by the patient right after accepting the consent screen (before
// entering the Jitsi room), and by the practitioner when they land on
// /consultations/[id]/live. First arrival flips a pending call to 'active'.
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

  // The lookup itself IS the authorization check: a consultation this user
  // is not a participant of comes back as null, never someone else's row.
  const consultation = await getConsultationForParticipant(sql, id, user.id)
  if (!consultation) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const role = consultation.practitionerId === user.id ? "practitioner" : "patient"
  const updated = await markJoined(sql, id, role)
  if (!updated) {
    return NextResponse.json({ error: "not-found" }, { status: 404 })
  }
  // practitioner_reason is a clinical note never shared with the patient.
  const { practitionerReason: _practitionerReason, ...safeForPatient } = updated
  return NextResponse.json({ consultation: role === "patient" ? safeForPatient : updated })
}
