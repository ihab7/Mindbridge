import { getSql } from "@/lib/db"
import type { BreathingSessionRow, ConsultationReport, JournalEntryRow, PreviousReportSummary } from "./types"

export type PatientRecord = {
  id: number
  name: string
  age: number | null
  gender: string | null
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString()
  }
  return new Date().toISOString()
}

export async function fetchPatientReportContext(sql: ReturnType<typeof getSql>, patientId: number) {
  const patientRows = (await sql`
    SELECT id, name, age, gender FROM users WHERE id = ${patientId}
  `) as PatientRecord[]

  const entries = (await sql`
    SELECT * FROM journal_entries
    WHERE patient_id = ${patientId}
    ORDER BY created_at DESC
    LIMIT 30
  `) as JournalEntryRow[]

  const breathingSessions = (await sql`
    SELECT * FROM breathing_sessions
    WHERE patient_id = ${patientId}
    ORDER BY completed_at DESC
    LIMIT 60
  `) as BreathingSessionRow[]

  const previousReportRows = (await sql`
    SELECT id, consultation_date, overall_progress
    FROM consultation_reports
    WHERE patient_id = ${patientId}
    ORDER BY consultation_date DESC
    LIMIT 1
  `) as Record<string, unknown>[]

  const previousReport: PreviousReportSummary | undefined = previousReportRows[0]
    ? {
        id: String(previousReportRows[0].id),
        consultationDate: toIso(previousReportRows[0].consultation_date),
        overallProgress: String(previousReportRows[0].overall_progress),
      }
    : undefined

  return {
    patient: patientRows[0],
    entries,
    breathingSessions,
    previousReport,
  }
}

export function mapReportRow(row: Record<string, unknown>): ConsultationReport {
  const fullReport = (row.full_report ?? {}) as Partial<ConsultationReport>

  return {
    id: String(row.id),
    practitionerId: Number(row.practitioner_id),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    patientInfo: fullReport.patientInfo ?? {
      id: Number(row.patient_id),
      name: "",
      age: null,
      gender: null,
      consultationDate: toIso(row.consultation_date),
    },
    sections: {
      moodSummary: String(row.mood_summary ?? ""),
      medicationSummary: String(row.medication_summary ?? ""),
      sleepSummary: String(row.sleep_summary ?? ""),
      mindfulnessSummary: String(row.mindfulness_summary ?? ""),
      journalSummary: String(row.journal_summary ?? ""),
      sideEffectsSummary: String(row.side_effects_summary ?? ""),
      overallProgress: String(row.overall_progress ?? ""),
    },
    recommendations: Array.isArray(row.recommendations) ? (row.recommendations as string[]) : [],
    nextAppointment: row.next_appointment ? toIso(row.next_appointment) : null,
  }
}
