export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ patientId: string; treatmentId: string }> },
) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { patientId, treatmentId } = await params
  const pid = Number(patientId)
  const tid = Number(treatmentId)
  if (!Number.isFinite(pid) || !Number.isFinite(tid)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const sql = getSql()
  const ok = await assertPractitionerOwnsPatient(sql, user.id, pid)
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const status = body.status === "stopped" ? "stopped" : body.status === "active" ? "active" : null
    if (!status) {
      return NextResponse.json({ error: "status must be 'active' or 'stopped'" }, { status: 400 })
    }
    const endDate = status === "stopped" ? new Date().toISOString().slice(0, 10) : null

    const rows = (await sql`
      UPDATE patient_treatments
      SET status = ${status}, end_date = ${endDate}, updated_at = NOW()
      WHERE id = ${tid} AND patient_id = ${pid} AND practitioner_id = ${user.id}
      RETURNING id, medication_name, dosage, frequency, start_date, end_date, status, notes, created_at, updated_at
    `) as Record<string, unknown>[]

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ treatment: rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Treatment update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
