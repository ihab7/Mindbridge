export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"

function clampOrNull(input: unknown, maxLen: number): string | null {
  const value = typeof input === "string" ? input.trim() : ""
  if (!value) return null
  return value.length > maxLen ? value.slice(0, maxLen) : value
}

function parseOptionalDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value !== "string") return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export async function GET(_request: Request, { params }: { params: Promise<{ patientId: string }> }) {
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
    SELECT id, medication_name, dosage, frequency, start_date, end_date, status, notes, created_at, updated_at
    FROM patient_treatments
    WHERE patient_id = ${pid}
    ORDER BY (status = 'active') DESC, start_date DESC NULLS LAST, created_at DESC
  `) as Record<string, unknown>[]

  return NextResponse.json({ treatments: rows }, { status: 200 })
}

export async function POST(request: Request, { params }: { params: Promise<{ patientId: string }> }) {
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
    const medicationName = clampOrNull(body.medicationName, 200)
    if (!medicationName) {
      return NextResponse.json({ error: "Medication name is required" }, { status: 400 })
    }
    const dosage = clampOrNull(body.dosage, 100)
    const frequency = clampOrNull(body.frequency, 100)
    const startDate = parseOptionalDate(body.startDate)
    const notes = clampOrNull(body.notes, 500)

    const rows = (await sql`
      INSERT INTO patient_treatments
        (patient_id, practitioner_id, medication_name, dosage, frequency, start_date, notes)
      VALUES
        (${pid}, ${user.id}, ${medicationName}, ${dosage}, ${frequency}, ${startDate}, ${notes})
      RETURNING id, medication_name, dosage, frequency, start_date, end_date, status, notes, created_at, updated_at
    `) as Record<string, unknown>[]

    return NextResponse.json({ treatment: rows[0] }, { status: 200 })
  } catch (error) {
    console.error("Treatment save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
