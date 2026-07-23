export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { mapReportRow } from "@/lib/consultation-report/data"
import type { ConsultationReportDraft } from "@/lib/consultation-report/types"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const sql = getSql()

  const rows = (await sql`
    SELECT * FROM consultation_reports
    WHERE id = ${id} AND practitioner_id = ${user.id}
    LIMIT 1
  `) as Record<string, unknown>[]

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ report: mapReportRow(rows[0]) })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const sql = getSql()

  try {
    const body = (await request.json()) as Partial<ConsultationReportDraft>
    if (!body.sections || !body.patientInfo) {
      return NextResponse.json({ error: "Invalid report payload" }, { status: 400 })
    }

    const existing = (await sql`
      SELECT id FROM consultation_reports WHERE id = ${id} AND practitioner_id = ${user.id} LIMIT 1
    `) as Record<string, unknown>[]
    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const sections = body.sections
    const recommendations = Array.isArray(body.recommendations) ? body.recommendations.map(String) : []
    const nextAppointment = body.nextAppointment ? String(body.nextAppointment) : null
    const consultationDate = body.patientInfo.consultationDate ?? new Date().toISOString()

    const result = await sql`
      UPDATE consultation_reports
      SET
        consultation_date = ${consultationDate},
        mood_summary = ${sections.moodSummary ?? ""},
        medication_summary = ${sections.medicationSummary ?? ""},
        sleep_summary = ${sections.sleepSummary ?? ""},
        mindfulness_summary = ${sections.mindfulnessSummary ?? ""},
        journal_summary = ${sections.journalSummary ?? ""},
        side_effects_summary = ${sections.sideEffectsSummary ?? ""},
        overall_progress = ${sections.overallProgress ?? ""},
        recommendations = ${recommendations},
        next_appointment = ${nextAppointment},
        full_report = ${JSON.stringify(body)},
        updated_at = NOW()
      WHERE id = ${id} AND practitioner_id = ${user.id}
      RETURNING *
    `

    return NextResponse.json({ report: mapReportRow((result as Record<string, unknown>[])[0]) })
  } catch (error) {
    console.error("Report update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const sql = getSql()

  const result = await sql`
    DELETE FROM consultation_reports
    WHERE id = ${id} AND practitioner_id = ${user.id}
    RETURNING id
  `

  if ((result as Record<string, unknown>[]).length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
