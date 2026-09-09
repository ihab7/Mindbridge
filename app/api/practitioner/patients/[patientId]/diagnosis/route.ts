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
    SELECT diagnosis_code, diagnosis_label, diagnosis_updated_at
    FROM patients WHERE user_id = ${pid}
  `) as Record<string, unknown>[]

  return NextResponse.json({ diagnosis: rows[0] ?? null }, { status: 200 })
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
    const code = clampOrNull(body.diagnosisCode, 50)
    const label = clampOrNull(body.diagnosisLabel, 200)

    const rows = (await sql`
      UPDATE patients
      SET diagnosis_code = ${code}, diagnosis_label = ${label}, diagnosis_updated_at = NOW()
      WHERE user_id = ${pid} AND practitioner_id = ${user.id}
      RETURNING diagnosis_code, diagnosis_label, diagnosis_updated_at
    `) as Record<string, unknown>[]

    return NextResponse.json({ diagnosis: rows[0] ?? null }, { status: 200 })
  } catch (error) {
    console.error("Diagnosis save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
