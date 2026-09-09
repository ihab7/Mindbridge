import { getSql } from "@/lib/db"
import type { Translator } from "@/lib/server-i18n"
import { daySpan, type ComparisonMode, type ConsultationReport, type ReportLanguage, type RiskLevel } from "./consultationReport"
import type { NarrativeReport, ReportEntry } from "./narrativeReport"

export type AnyReport = ConsultationReport | NarrativeReport
export type ReportFormat = "clinical" | "narrative"

type Sql = ReturnType<typeof getSql>

export type PractitionerLetterhead = ConsultationReport["practitioner"]

function orNull(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim()
  return s.length > 0 ? s : null
}

function toDateOnly(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Resolve the letterhead identity for a logged-in practitioner user.
 *  full_name/email fall back to the users row; everything else is null when
 *  unset so the sheet can omit the line. */
export async function getPractitionerLetterhead(
  sql: Sql,
  userId: number,
): Promise<{ letterhead: PractitionerLetterhead; footerNote: string | null; hasProfile: boolean }> {
  const userRows = (await sql`SELECT name, email FROM users WHERE id = ${userId}`) as Record<string, unknown>[]
  const user = userRows[0] ?? {}

  const rows = (await sql`
    SELECT full_name, specialty, cabinet_name, license_number, address, phone, email, report_footer_note
    FROM practitioner_profiles WHERE user_id = ${userId}
  `) as Record<string, unknown>[]
  const p = rows[0]

  const letterhead: PractitionerLetterhead = {
    fullName: orNull(p?.full_name) ?? orNull(user.name) ?? "",
    specialty: orNull(p?.specialty),
    licenseNumber: orNull(p?.license_number),
    cabinetName: orNull(p?.cabinet_name),
    address: orNull(p?.address),
    phone: orNull(p?.phone),
    email: orNull(p?.email) ?? orNull(user.email),
  }

  // "Complete profile" hint fires when the practitioner-editable letterhead
  // fields are essentially empty (only the name/email defaults are present).
  const hasProfile = Boolean(
    p && (letterhead.specialty || letterhead.cabinetName || letterhead.licenseNumber || letterhead.address || letterhead.phone),
  )

  return { letterhead, footerNote: orNull(p?.report_footer_note), hasProfile }
}

export type ReportPatientInfo = {
  fullName: string
  age: number | null
  fileNumber: string | null
  followedSince: string | null // ISO date
}

export async function getReportPatientInfo(sql: Sql, patientId: number): Promise<ReportPatientInfo | null> {
  const rows = (await sql`
    SELECT u.name, u.age, p.created_at AS followed_since
    FROM users u
    LEFT JOIN patients p ON p.user_id = u.id
    WHERE u.id = ${patientId}
  `) as Record<string, unknown>[]
  if (rows.length === 0) return null
  const r = rows[0]
  return {
    fullName: String(r.name ?? ""),
    age: r.age == null ? null : Number(r.age),
    // No patient file-number field exists in the schema; never fabricate one.
    fileNumber: null,
    followedSince: r.followed_since ? toDateOnly(new Date(String(r.followed_since))) : null,
  }
}

// Superset of ClinicalEntry (adds side_effects) so ONE fetch serves both the
// clinical letter (which only reads the ClinicalEntry fields) and the
// narrative summary (which also needs side effects) — no duplicate query.
export async function getEntriesForPeriod(
  sql: Sql,
  patientId: number,
  fromISO: string,
  toISO: string,
): Promise<ReportEntry[]> {
  const rows = (await sql`
    SELECT mood, anxiety, sleep_hours, medication_taken, challenges, achievements, side_effects, side_effects_other, created_at
    FROM journal_entries
    WHERE patient_id = ${patientId}
      AND created_at::date >= ${fromISO}::date
      AND created_at::date <= ${toISO}::date
    ORDER BY created_at ASC
  `) as Record<string, unknown>[]
  return rows.map((r) => ({
    mood: Number(r.mood),
    anxiety: Number(r.anxiety),
    sleep_hours: Number(r.sleep_hours),
    medication_taken: Boolean(r.medication_taken),
    challenges: r.challenges == null ? "" : String(r.challenges),
    achievements: r.achievements == null ? "" : String(r.achievements),
    side_effects: Array.isArray(r.side_effects) ? (r.side_effects as string[]) : [],
    side_effects_other: r.side_effects_other == null ? null : String(r.side_effects_other),
    created_at: String(r.created_at),
  }))
}

export type ReportDiagnosis = { code: string | null; label: string | null; updatedAt: string | null }

/** Current diagnosis on file for the patient, or null if never set. */
export async function getPatientDiagnosis(sql: Sql, patientId: number): Promise<ReportDiagnosis | null> {
  const rows = (await sql`
    SELECT diagnosis_code, diagnosis_label, diagnosis_updated_at
    FROM patients WHERE user_id = ${patientId}
  `) as Record<string, unknown>[]
  const r = rows[0]
  if (!r || (r.diagnosis_code == null && r.diagnosis_label == null)) return null
  return {
    code: orNull(r.diagnosis_code),
    label: orNull(r.diagnosis_label),
    updatedAt: r.diagnosis_updated_at ? new Date(String(r.diagnosis_updated_at)).toISOString() : null,
  }
}

export type ReportTreatment = {
  medicationName: string
  dosage: string | null
  frequency: string | null
  startDate: string | null // ISO date
  status: "active" | "stopped"
}

/** Treatments currently on file for the patient, frozen into the report snapshot at generation time. */
export async function getPatientTreatments(sql: Sql, patientId: number): Promise<ReportTreatment[]> {
  const rows = (await sql`
    SELECT medication_name, dosage, frequency, start_date, status
    FROM patient_treatments
    WHERE patient_id = ${patientId} AND status = 'active'
    ORDER BY start_date DESC NULLS LAST, created_at DESC
  `) as Record<string, unknown>[]
  return rows.map((r) => ({
    medicationName: String(r.medication_name),
    dosage: orNull(r.dosage),
    frequency: orNull(r.frequency),
    startDate: r.start_date ? toDateOnly(new Date(String(r.start_date))) : null,
    status: "active" as const,
  }))
}

/** Breathing/mindfulness sessions completed within the period. */
export async function getBreathingSessionCount(
  sql: Sql,
  patientId: number,
  fromISO: string,
  toISO: string,
): Promise<number> {
  const rows = (await sql`
    SELECT COUNT(*)::int AS n
    FROM breathing_sessions
    WHERE patient_id = ${patientId}
      AND completed_at::date >= ${fromISO}::date
      AND completed_at::date <= ${toISO}::date
  `) as Record<string, unknown>[]
  return Number(rows[0]?.n ?? 0)
}

/** The practitioner's pinned next-appointment date for this patient, if set. */
export async function getNextAppointment(sql: Sql, patientId: number, practitionerId: number): Promise<string | null> {
  const rows = (await sql`
    SELECT next_appointment_at
    FROM practitioner_feedback
    WHERE patient_id = ${patientId} AND practitioner_id = ${practitionerId}
  `) as Record<string, unknown>[]
  const v = rows[0]?.next_appointment_at
  return v ? new Date(String(v)).toISOString() : null
}

/** Patients linked to this practitioner, for the report-generation picker. */
export async function getPractitionerPatients(sql: Sql, practitionerId: number): Promise<{ id: number; name: string }[]> {
  const rows = (await sql`
    SELECT u.id, u.name
    FROM users u
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${practitionerId}
    ORDER BY u.name ASC
  `) as Record<string, unknown>[]
  return rows.map((r) => ({ id: Number(r.id), name: String(r.name) }))
}

/** One-line assigned-program summary, or null if the patient has none. */
export async function getProgramSummary(sql: Sql, patientId: number, t: Translator): Promise<string | null> {
  const rows = (await sql`
    SELECT id, status, jsonb_array_length(plan) AS total
    FROM program_assignments
    WHERE patient_id = ${patientId}
    ORDER BY assigned_at DESC
    LIMIT 1
  `) as Record<string, unknown>[]
  if (rows.length === 0) return null
  const a = rows[0]
  const total = Number(a.total ?? 0)
  const completedRows = (await sql`
    SELECT COUNT(*)::int AS n FROM session_progress WHERE assignment_id = ${String(a.id)}
  `) as Record<string, unknown>[]
  const completed = Number(completedRows[0]?.n ?? 0)
  const statusKey = a.status === "completed" ? "report.program.completed" : "report.program.active"
  return t("report.program.summary", {
    completed,
    total,
    status: t(statusKey),
  })
}

/** Resolve a period selection to concrete [from,to] ISO dates. */
export async function resolvePeriod(
  sql: Sql,
  patientId: number,
  practitionerId: number,
  selection: { kind: "last14" | "last30" | "sinceLast" | "custom"; from?: string; to?: string },
  now = new Date(),
): Promise<{ from: string; to: string }> {
  const today = toDateOnly(now)
  if (selection.kind === "custom" && selection.from && selection.to) {
    const from = selection.from <= selection.to ? selection.from : selection.to
    const to = selection.from <= selection.to ? selection.to : selection.from
    return { from, to }
  }
  if (selection.kind === "last30") {
    const from = new Date(now)
    from.setDate(from.getDate() - 29)
    return { from: toDateOnly(from), to: today }
  }
  if (selection.kind === "sinceLast") {
    const rows = (await sql`
      SELECT period_to FROM clinical_letter_reports
      WHERE patient_id = ${patientId} AND practitioner_id = ${practitionerId}
      ORDER BY issued_at DESC LIMIT 1
    `) as Record<string, unknown>[]
    if (rows[0]?.period_to) {
      const prev = new Date(String(rows[0].period_to))
      prev.setDate(prev.getDate() + 1)
      const from = toDateOnly(prev)
      return { from: from <= today ? from : today, to: today }
    }
    // Fall back to last 14 days when there's no prior report.
  }
  const from = new Date(now)
  from.setDate(from.getDate() - 13)
  return { from: toDateOnly(from), to: today }
}

/** Entries from the period immediately preceding [periodFrom, periodTo], same length. */
export async function getPreviousPeriodEntries(
  sql: Sql,
  patientId: number,
  periodFrom: string,
  periodTo: string,
): Promise<ReportEntry[]> {
  const days = daySpan(periodFrom, periodTo)
  const to = new Date(`${periodFrom}T00:00:00`)
  to.setDate(to.getDate() - 1)
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))
  return getEntriesForPeriod(sql, patientId, toDateOnly(from), toDateOnly(to))
}

/** The patient's first 7 distinct logged calendar days ever — the "at inclusion" baseline. */
export async function getInclusionBaselineEntries(sql: Sql, patientId: number): Promise<ReportEntry[]> {
  const rows = (await sql`
    SELECT mood, anxiety, sleep_hours, medication_taken, challenges, achievements, side_effects, side_effects_other, created_at
    FROM journal_entries
    WHERE patient_id = ${patientId}
    ORDER BY created_at ASC
    LIMIT 200
  `) as Record<string, unknown>[]
  const seenDays = new Set<string>()
  const result: ReportEntry[] = []
  for (const r of rows) {
    const dayKey = toDateOnly(new Date(String(r.created_at)))
    if (!seenDays.has(dayKey)) {
      if (seenDays.size >= 7) break
      seenDays.add(dayKey)
    }
    result.push({
      mood: Number(r.mood),
      anxiety: Number(r.anxiety),
      sleep_hours: Number(r.sleep_hours),
      medication_taken: Boolean(r.medication_taken),
      challenges: r.challenges == null ? "" : String(r.challenges),
      achievements: r.achievements == null ? "" : String(r.achievements),
      side_effects: Array.isArray(r.side_effects) ? (r.side_effects as string[]) : [],
      side_effects_other: r.side_effects_other == null ? null : String(r.side_effects_other),
      created_at: String(r.created_at),
    })
  }
  return result
}

export async function getNextSequence(sql: Sql, practitionerId: number): Promise<number> {
  const rows = (await sql`
    SELECT COALESCE(MAX(sequence), 0) + 1 AS next
    FROM clinical_letter_reports WHERE practitioner_id = ${practitionerId}
  `) as Record<string, unknown>[]
  return Number(rows[0]?.next ?? 1)
}

export function buildReference(fullName: string, sequence: number, year: number): string {
  const letters = fullName
    .normalize("NFD")
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const initials = (letters.slice(0, 2).map((w) => w[0]).join("") || "XX").toUpperCase()
  return `${initials}-${year}-${String(sequence).padStart(4, "0")}`
}

export type StoredReport = {
  id: string
  reference: string
  language: ReportLanguage
  format: ReportFormat
  periodFrom: string
  periodTo: string
  issuedAt: string
  snapshot: AnyReport
}

export async function insertReport(
  sql: Sql,
  params: {
    reference: string
    practitionerId: number
    patientId: number
    sequence: number
    periodFrom: string
    periodTo: string
    language: ReportLanguage
    format: ReportFormat
    snapshot: AnyReport
    // Mirrored alongside the snapshot so plain SQL can query them directly
    // (e.g. counting significant-risk reports) without JSON parsing. The
    // snapshot remains the frozen source of truth for reopening a report.
    comparisonMode: ComparisonMode | null
    riskLevel: RiskLevel
    riskDetail: string | null
  },
): Promise<string> {
  const rows = (await sql`
    INSERT INTO clinical_letter_reports
      (reference, practitioner_id, patient_id, sequence, period_from, period_to, language, format, snapshot,
       comparison_mode, risk_level, risk_detail)
    VALUES
      (${params.reference}, ${params.practitionerId}, ${params.patientId}, ${params.sequence},
       ${params.periodFrom}::date, ${params.periodTo}::date, ${params.language}, ${params.format},
       ${JSON.stringify(params.snapshot)}::jsonb,
       ${params.comparisonMode}, ${params.riskLevel}, ${params.riskDetail})
    RETURNING id
  `) as Record<string, unknown>[]
  return String(rows[0].id)
}

// Reports generated before the 'high' -> 'significant' rename have a frozen
// snapshot with riskAssessment.level === 'high'. Per FIX 2 (Option A), we
// normalize at read time rather than mutate the stored document — a report
// is a frozen document, and this keeps it that way while still rendering
// correctly under the new label.
function normalizeSnapshotRiskLevel(snapshot: AnyReport): AnyReport {
  const risk = (snapshot as { riskAssessment?: { level?: string } }).riskAssessment
  if (risk?.level !== "high") return snapshot
  return { ...snapshot, riskAssessment: { ...risk, level: "significant" } } as AnyReport
}

/** Fetch one stored report, scoped to the owning practitioner. */
export async function getStoredReport(
  sql: Sql,
  reportId: string,
  practitionerId: number,
): Promise<StoredReport | null> {
  const rows = (await sql`
    SELECT id, reference, language, format, period_from, period_to, issued_at, snapshot
    FROM clinical_letter_reports
    WHERE id = ${reportId}::uuid AND practitioner_id = ${practitionerId}
  `) as Record<string, unknown>[]
  if (rows.length === 0) return null
  const r = rows[0]
  return {
    id: String(r.id),
    reference: String(r.reference),
    language: String(r.language) as ReportLanguage,
    format: (String(r.format ?? "clinical") as ReportFormat),
    periodFrom: String(r.period_from),
    periodTo: String(r.period_to),
    issuedAt: new Date(String(r.issued_at)).toISOString(),
    snapshot: normalizeSnapshotRiskLevel(r.snapshot as AnyReport),
  }
}

export async function listReports(
  sql: Sql,
  patientId: number,
  practitionerId: number,
): Promise<{ id: string; reference: string; periodLabel: string; issuedAt: string; format: ReportFormat }[]> {
  const rows = (await sql`
    SELECT id, reference, snapshot, issued_at, format
    FROM clinical_letter_reports
    WHERE patient_id = ${patientId} AND practitioner_id = ${practitionerId}
    ORDER BY issued_at DESC
  `) as Record<string, unknown>[]
  return rows.map((r) => {
    const snap = (r.snapshot ?? {}) as Partial<AnyReport>
    return {
      id: String(r.id),
      reference: String(r.reference),
      periodLabel: snap.period?.label ?? "",
      issuedAt: new Date(String(r.issued_at)).toISOString(),
      format: (String(r.format ?? "clinical") as ReportFormat),
    }
  })
}

/** All reports across every patient of this practitioner — for the reports
 *  hub page, so a past report can be reopened without going through a patient. */
export async function listReportsForPractitioner(
  sql: Sql,
  practitionerId: number,
  limit = 50,
): Promise<
  { id: string; patientId: number; patientName: string; reference: string; periodLabel: string; issuedAt: string; format: ReportFormat }[]
> {
  const rows = (await sql`
    SELECT r.id, r.patient_id, u.name AS patient_name, r.reference, r.snapshot, r.issued_at, r.format
    FROM clinical_letter_reports r
    JOIN users u ON u.id = r.patient_id
    WHERE r.practitioner_id = ${practitionerId}
    ORDER BY r.issued_at DESC
    LIMIT ${limit}
  `) as Record<string, unknown>[]
  return rows.map((r) => {
    const snap = (r.snapshot ?? {}) as Partial<AnyReport>
    return {
      id: String(r.id),
      patientId: Number(r.patient_id),
      patientName: String(r.patient_name),
      reference: String(r.reference),
      periodLabel: snap.period?.label ?? "",
      issuedAt: new Date(String(r.issued_at)).toISOString(),
      format: (String(r.format ?? "clinical") as ReportFormat),
    }
  })
}
