// meet.jit.si is a public community service with
// no SLA. For commercial launch: migrate to a
// dedicated Jitsi server or Jitsi as a Service
// (8x8). The room_name UUID is the only access
// control on the current public tier — a
// dedicated deployment will add server-generated
// room password.

import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getConsultationForParticipant } from "@/lib/video/data"
import { VideoCallRoomShell } from "@/components/video/video-call-room-shell"

// The lookup below IS the authorization check: getConsultationForParticipant
// only ever returns a row where the session user is practitioner_id or
// patient_id, so there is no separate "is this mine" branch to get wrong —
// a mismatched id is indistinguishable from a nonexistent one, both null.
export default async function VideoCallRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) redirect("/login")

  const { id } = await params
  const sql = getSql()
  const consultation = await getConsultationForParticipant(sql, id, user.id)

  if (!consultation) {
    redirect(user.role === "practitioner" ? "/practitioner" : "/patient")
  }

  const role = consultation.practitionerId === user.id ? "practitioner" : "patient"

  const namesRows = (await sql`
    SELECT id, name FROM users WHERE id = ${consultation.practitionerId} OR id = ${consultation.patientId}
  `) as { id: number; name: string }[]
  const nameById = new Map(namesRows.map((r) => [r.id, r.name]))
  const practitionerName = nameById.get(consultation.practitionerId) ?? ""
  const patientName = nameById.get(consultation.patientId) ?? ""

  // Each side's OWN displayName is what the OTHER participant sees in Jitsi.
  // Patient sees "Dr. {name}" (skip a second "Dr." if the stored name — as in
  // this seed data — already carries one); practitioner sees the patient's
  // first name only.
  const ensureDrPrefix = (name: string) => (/^(dr\.?|docteur)\s/i.test(name.trim()) ? name.trim() : `Dr. ${name.trim()}`)
  const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name
  const displayName = role === "practitioner" ? ensureDrPrefix(practitionerName) : firstName(patientName)

  return (
    <VideoCallRoomShell
      consultationId={consultation.id}
      roomName={consultation.roomName}
      mode={consultation.mode}
      status={consultation.status}
      role={role}
      displayName={displayName}
      patientId={consultation.patientId}
    />
  )
}
