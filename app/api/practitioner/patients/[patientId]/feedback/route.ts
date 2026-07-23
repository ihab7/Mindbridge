export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"

function clampText(input: unknown, maxLen: number): string {
  const value = typeof input === "string" ? input.trim() : ""
  return value.length > maxLen ? value.slice(0, maxLen) : value
}

function parseOptionalDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value !== "string") return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { patientId } = await params
  const pid = Number(patientId)
  if (!Number.isFinite(pid)) {
    return NextResponse.json({ error: "Invalid patient" }, { status: 400 })
  }

  const sql = getSql()
  const ok = await assertPractitionerOwnsPatient(sql, user.id, pid)
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const rows = (await sql`
    SELECT id, note, next_appointment_at, updated_at, created_at
    FROM practitioner_feedback
    WHERE patient_id = ${pid} AND practitioner_id = ${user.id}
    LIMIT 1
  `) as Record<string, unknown>[]

  return NextResponse.json({ feedback: rows[0] ?? null }, { status: 200 })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { patientId } = await params
  const pid = Number(patientId)
  if (!Number.isFinite(pid)) {
    return NextResponse.json({ error: "Invalid patient" }, { status: 400 })
  }

  const sql = getSql()
  const ok = await assertPractitionerOwnsPatient(sql, user.id, pid)
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await request.json()

    const note = clampText(body.note, 500)
    if (!note) {
      return NextResponse.json({ error: "Note is required" }, { status: 400 })
    }

    const nextAppointmentAtIso = parseOptionalDate(body.nextAppointmentAt)

    const result = await sql`
      INSERT INTO practitioner_feedback (patient_id, practitioner_id, note, next_appointment_at, updated_at)
      VALUES (${pid}, ${user.id}, ${note}, ${nextAppointmentAtIso}, NOW())
      ON CONFLICT (patient_id)
      DO UPDATE SET
        practitioner_id = EXCLUDED.practitioner_id,
        note = EXCLUDED.note,
        next_appointment_at = EXCLUDED.next_appointment_at,
        updated_at = NOW()
      RETURNING id, patient_id, practitioner_id, note, next_appointment_at, updated_at, created_at
    `

    return NextResponse.json({ feedback: (result as Record<string, unknown>[])[0] }, { status: 200 })
  } catch (error) {
    console.error("Feedback save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
