import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getServerI18n } from "@/lib/server-i18n"
import {
  getEntriesForPeriod,
  getNextSequence,
  getPractitionerLetterhead,
  getProgramSummary,
  getReportPatientInfo,
  getPatientDiagnosis,
  getPatientTreatments,
  getPreviousPeriodEntries,
  getInclusionBaselineEntries,
  getBreathingSessionCount,
  getNextAppointment,
  buildReference,
  insertReport,
  resolvePeriod,
  type ReportFormat,
} from "@/lib/reports/data"
import {
  buildConsultationReport,
  type ReportLanguage,
  type ComparisonMode,
  type RiskAssessment,
  type RiskLevel,
} from "@/lib/reports/consultationReport"
import { buildNarrativeReport } from "@/lib/reports/narrativeReport"
import { logDbError } from "@/lib/db-errors"

export async function POST(req: Request) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const patientId = Number(body?.patientId)
  if (!Number.isInteger(patientId)) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 })
  }
  const format: ReportFormat = body?.format === "narrative" ? "narrative" : "clinical"

  // Risk assessment is mandatory and NEVER auto-derived — the practitioner
  // must explicitly choose a level, and anything beyond "none" requires a
  // non-empty detail. Enforced here too, not just client-side.
  const riskLevel: RiskLevel | null = ["none", "watch", "significant"].includes(body?.riskLevel) ? body.riskLevel : null
  if (!riskLevel) {
    return NextResponse.json({ error: "bad-request", field: "riskLevel" }, { status: 400 })
  }
  const riskDetailRaw = typeof body?.riskDetail === "string" ? body.riskDetail.trim() : ""
  if (riskLevel !== "none" && !riskDetailRaw) {
    return NextResponse.json({ error: "bad-request", field: "riskDetail" }, { status: 400 })
  }
  const riskAssessment: RiskAssessment = { level: riskLevel, detail: riskLevel === "none" ? null : riskDetailRaw.slice(0, 600) }

  // Comparaison basis for the indicator table — clinical format only.
  const comparisonMode: ComparisonMode = body?.comparisonMode === "inclusion" ? "inclusion" : "previousPeriod"

  const sql = getSql()

  try {
    // Ownership: this practitioner must be linked to this patient.
    const owns = (await sql`
      SELECT 1 FROM patients WHERE user_id = ${patientId} AND practitioner_id = ${user.id}
    `) as Record<string, unknown>[]
    if (owns.length === 0) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const selection = {
      kind: (["last14", "last30", "sinceLast", "custom"].includes(body?.period?.kind)
        ? body.period.kind
        : "last14") as "last14" | "last30" | "sinceLast" | "custom",
      from: typeof body?.period?.from === "string" ? body.period.from : undefined,
      to: typeof body?.period?.to === "string" ? body.period.to : undefined,
    }

    const { locale, t } = await getServerI18n()
    const language = locale as ReportLanguage

    const period = await resolvePeriod(sql, patientId, user.id, selection)
    const entries = await getEntriesForPeriod(sql, patientId, period.from, period.to)

    // No data in the selected period: block generation, never store an empty report.
    if (entries.length === 0) {
      return NextResponse.json({ error: "no-data" }, { status: 422 })
    }

    const [{ letterhead, footerNote }, patient, programSummary, diagnosis, treatments] = await Promise.all([
      getPractitionerLetterhead(sql, user.id),
      getReportPatientInfo(sql, patientId),
      getProgramSummary(sql, patientId, t),
      getPatientDiagnosis(sql, patientId),
      getPatientTreatments(sql, patientId),
    ])
    if (!patient) {
      return NextResponse.json({ error: "not-found" }, { status: 404 })
    }

    const observationsRaw = typeof body?.observations === "string" ? body.observations.trim() : ""
    const observations = observationsRaw ? observationsRaw.slice(0, 600) : null

    const now = new Date()
    const issuedAt = now.toISOString()
    const sequence = await getNextSequence(sql, user.id)
    const reference = buildReference(letterhead.fullName, sequence, now.getFullYear())

    const snapshot =
      format === "narrative"
        ? buildNarrativeReport({
            reference,
            issuedAt,
            language,
            period,
            practitioner: letterhead,
            patient,
            diagnosis,
            treatments,
            entries,
            programSummary,
            breathingSessionCount: await getBreathingSessionCount(sql, patientId, period.from, period.to),
            nextAppointmentIso: await getNextAppointment(sql, patientId, user.id),
            riskAssessment,
            footerNote,
            t,
          })
        : buildConsultationReport({
            reference,
            issuedAt,
            language,
            period,
            practitioner: letterhead,
            patient,
            diagnosis,
            treatments,
            entries,
            comparisonMode,
            priorEntries:
              comparisonMode === "inclusion"
                ? await getInclusionBaselineEntries(sql, patientId)
                : await getPreviousPeriodEntries(sql, patientId, period.from, period.to),
            programSummary,
            observations,
            riskAssessment,
            footerNote,
            t,
          })

    const id = await insertReport(sql, {
      reference,
      practitionerId: user.id,
      patientId,
      sequence,
      periodFrom: period.from,
      periodTo: period.to,
      language,
      format,
      snapshot,
      // Top-level columns alongside the snapshot: the snapshot stays the
      // frozen source of truth for reopening, these enable direct SQL
      // queries (e.g. counting significant-risk reports) without JSON parsing.
      comparisonMode: format === "clinical" ? comparisonMode : null,
      riskLevel: riskAssessment.level,
      riskDetail: riskAssessment.detail,
    })

    return NextResponse.json({ id, reference })
  } catch (err) {
    logDbError(err, "clinical-letter:generate")
    return NextResponse.json({ error: "server-error" }, { status: 500 })
  }
}
