export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"
import { mapReportRow } from "@/lib/consultation-report/data"
import type { ConsultationReportDraft } from "@/lib/consultation-report/types"

function parseDraft(body: unknown): ConsultationReportDraft | null {
  if (!body || typeof body !== "object") return null
  const draft = body as Partial<ConsultationReportDraft>

  if (!draft.patientInfo || !draft.sections) return null
  const patientId = Number(draft.patientInfo.id)
  if (!Number.isFinite(patientId)) return null

  return {
    patientInfo: {
      id: patientId,
      name: String(draft.patientInfo.name ?? ""),
      age: draft.patientInfo.age != null ? Number(draft.patientInfo.age) : null,
      gender: draft.patientInfo.gender ? String(draft.patientInfo.gender) : null,
      consultationDate: draft.patientInfo.consultationDate ?? new Date().toISOString(),
    },
    sections: {
      moodSummary: String(draft.sections.moodSummary ?? ""),
      medicationSummary: String(draft.sections.medicationSummary ?? ""),
      sleepSummary: String(draft.sections.sleepSummary ?? ""),
      mindfulnessSummary: String(draft.sections.mindfulnessSummary ?? ""),
      journalSummary: String(draft.sections.journalSummary ?? ""),
      sideEffectsSummary: String(draft.sections.sideEffectsSummary ?? ""),
      overallProgress: String(draft.sections.overallProgress ?? ""),
    },
    recommendations: Array.isArray(draft.recommendations) ? draft.recommendations.map(String) : [],
    nextAppointment: draft.nextAppointment ? String(draft.nextAppointment) : null,
  }
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const draft = parseDraft(body)
    if (!draft) {
      return NextResponse.json({ error: "Invalid report payload" }, { status: 400 })
    }

    const sql = getSql()
    const ok = await assertPractitionerOwnsPatient(sql, user.id, draft.patientInfo.id)
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { sections, recommendations, nextAppointment, patientInfo } = draft

    const result = await sql`
      INSERT INTO consultation_reports (
        patient_id, practitioner_id, consultation_date,
        mood_summary, medication_summary, sleep_summary, mindfulness_summary,
        journal_summary, side_effects_summary, overall_progress,
        recommendations, next_appointment, full_report, updated_at
      ) VALUES (
        ${patientInfo.id}, ${user.id}, ${patientInfo.consultationDate},
        ${sections.moodSummary}, ${sections.medicationSummary}, ${sections.sleepSummary}, ${sections.mindfulnessSummary},
        ${sections.journalSummary}, ${sections.sideEffectsSummary}, ${sections.overallProgress},
        ${recommendations}, ${nextAppointment}, ${JSON.stringify(draft)}, NOW()
      )
      RETURNING *
    `

    if (patientInfo.age != null || patientInfo.gender) {
      await sql`
        UPDATE users
        SET
          age = COALESCE(age, ${patientInfo.age}),
          gender = COALESCE(gender, ${patientInfo.gender})
        WHERE id = ${patientInfo.id}
      `
    }

    const saved = mapReportRow((result as Record<string, unknown>[])[0])
    return NextResponse.json({ report: saved }, { status: 201 })
  } catch (error) {
    console.error("Report save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
