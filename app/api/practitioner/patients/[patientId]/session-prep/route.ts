export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"

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
    SELECT id, patient_id, topics_to_discuss, questions_for_therapist, recent_concerns, updated_at, reviewed_at
    FROM session_prep
    WHERE patient_id = ${pid}
    LIMIT 1
  `) as Record<string, unknown>[]

  return NextResponse.json({ sessionPrep: rows[0] ?? null })
}

export async function POST(
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

  const result = (await sql`
    UPDATE session_prep
    SET reviewed_at = NOW()
    WHERE patient_id = ${pid}
    RETURNING id, patient_id, topics_to_discuss, questions_for_therapist, recent_concerns, updated_at, reviewed_at
  `) as Record<string, unknown>[]

  if (result.length === 0) {
    return NextResponse.json({ error: "No session prep to review" }, { status: 404 })
  }

  return NextResponse.json({ sessionPrep: result[0] })
}
