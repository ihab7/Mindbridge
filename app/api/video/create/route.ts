export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { practitionerOwnsPatient, createUrgentConsultation, createScheduledConsultation } from "@/lib/video/data"

const MAX_REASON_LEN = 300

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const patientId = Number(body?.patientId)
  const mode = body?.mode === "scheduled" ? "scheduled" : body?.mode === "urgent" ? "urgent" : null
  if (!Number.isInteger(patientId) || !mode) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 })
  }

  const sql = getSql()

  // Never trust patientId's ownership from the client — re-derive it from
  // the authenticated practitioner on every request.
  const owns = await practitionerOwnsPatient(sql, user.id, patientId)
  if (!owns) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  try {
    if (mode === "urgent") {
      const reasonRaw = typeof body?.reason === "string" ? body.reason.trim() : ""
      const reason = reasonRaw ? reasonRaw.slice(0, MAX_REASON_LEN) : null
      const consultation = await createUrgentConsultation(sql, { practitionerId: user.id, patientId, reason })
      return NextResponse.json({ id: consultation.id })
    }

    const scheduledAtIso = typeof body?.scheduledAt === "string" ? body.scheduledAt : null
    const scheduledAtMs = scheduledAtIso ? new Date(scheduledAtIso).getTime() : NaN
    if (!scheduledAtIso || Number.isNaN(scheduledAtMs) || scheduledAtMs <= Date.now()) {
      return NextResponse.json({ error: "bad-request", field: "scheduledAt" }, { status: 400 })
    }
    const consultation = await createScheduledConsultation(sql, {
      practitionerId: user.id,
      patientId,
      scheduledAtIso,
    })
    return NextResponse.json({ id: consultation.id, scheduledAt: consultation.scheduledAt })
  } catch (error) {
    console.error("Video consultation create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
