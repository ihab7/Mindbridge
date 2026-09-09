// Data model + snapshot builder for the printable clinical consultation letter.
// Indicators and notable events come ENTIRELY from lib/wellbeing/clinicalSummary
// (buildClinicalSummary) — this module formats and arranges them, it never
// recomputes a signal or a flag. Baselines that clinicalSummary reports as
// absent stay absent here (prior/delta => null, printed as "—").

import { buildClinicalSummary, type ClinicalEntry, type SignalTone } from "@/lib/wellbeing/clinicalSummary"
import type { Translator } from "@/lib/server-i18n"
// Type-only import: erased at compile time, so this does not create a runtime
// circular dependency with data.ts (which imports value exports from here).
import type { ReportDiagnosis, ReportTreatment } from "./data"

export type ReportLanguage = "fr" | "en" | "ar"

export type ReportPeriod = {
  from: string // ISO date (YYYY-MM-DD)
  to: string // ISO date (YYYY-MM-DD)
  label: string // localized, e.g. "du 12 au 25 juillet 2026"
}

export type ReportIndicator = {
  key: "anxiety" | "mood" | "sleep" | "adherence"
  label: string
  current: string // "5,9 / 10"
  prior: string | null // null when no baseline
  delta: string | null // "+1,3" — always carries its sign
  tone: SignalTone
}

// The comparison basis for the indicator table's "prior" column. Practitioner
// -selected at generation time (clinical format only — narrative has no
// indicator table) and frozen into the snapshot so a reopened report still
// shows which basis was used.
export type ComparisonMode = "previousPeriod" | "inclusion"

// Practitioner's own clinical judgment, never auto-derived from clinicalSummary's
// tone flags — the field starts unselected regardless of what those flags show,
// and detail is mandatory for anything beyond "none".
export type RiskLevel = "none" | "watch" | "significant"
export type RiskAssessment = {
  level: RiskLevel
  detail: string | null // required (non-empty) when level !== "none"
}

export type ConsultationReport = {
  format: "clinical"
  reference: string
  issuedAt: string // ISO timestamp
  language: ReportLanguage
  period: ReportPeriod
  practitioner: {
    fullName: string
    specialty: string | null
    licenseNumber: string | null
    cabinetName: string | null
    address: string | null
    phone: string | null
    email: string | null
  }
  patient: {
    fullName: string
    age: number | null
    fileNumber: string | null
    followedSince: string | null // localized date string, or null
  }
  diagnosis: ReportDiagnosis | null
  treatments: ReportTreatment[]
  indicators: ReportIndicator[]
  comparisonMode: ComparisonMode
  notableEvents: string[]
  programSummary: string | null
  observations: string | null
  riskAssessment: RiskAssessment
  footerNote: string | null // practitioner's custom note; disclaimer is separate and mandatory
  dataCompleteness: {
    daysLogged: number
    daysTotal: number
  }
  isThin: boolean
}

export type BuildReportInput = {
  reference: string
  issuedAt: string
  language: ReportLanguage
  period: { from: string; to: string }
  practitioner: ConsultationReport["practitioner"]
  patient: {
    fullName: string
    age: number | null
    fileNumber: string | null
    followedSince: string | null // ISO date or null
  }
  diagnosis: ReportDiagnosis | null
  treatments: ReportTreatment[]
  entries: ClinicalEntry[]
  comparisonMode: ComparisonMode
  priorEntries: ClinicalEntry[]
  programSummary: string | null
  observations: string | null
  riskAssessment: RiskAssessment
  footerNote: string | null
  t: Translator
}

export function daySpan(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00`)
  const to = new Date(`${toISO}T00:00:00`)
  const ms = to.getTime() - from.getTime()
  return Math.max(1, Math.round(ms / 86400000) + 1)
}

function nf(locale: string, min: number, max: number, signed = false) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
    signDisplay: signed ? "exceptZero" : "auto",
  })
}

function unitSuffix(key: ReportIndicator["key"], t: Translator): string {
  if (key === "sleep") return ` ${t("report.unit.hours")}`
  if (key === "adherence") return " %"
  return ` ${t("report.unit.outOfTen")}` // "/ 10"
}

function formatValue(key: ReportIndicator["key"], num: number, locale: string, t: Translator): string {
  if (key === "adherence") return `${nf(locale, 0, 0).format(num)} %`
  return `${nf(locale, 0, 1).format(num)}${unitSuffix(key, t)}`
}

function formatDelta(key: ReportIndicator["key"], delta: number, locale: string, t: Translator): string {
  if (key === "adherence") return `${nf(locale, 0, 0, true).format(delta)} %`
  if (key === "sleep") return `${nf(locale, 0, 1, true).format(delta)} ${t("report.unit.hours")}`
  return nf(locale, 0, 1, true).format(delta) // points, no unit
}

export function buildPeriodLabel(fromISO: string, toISO: string, language: ReportLanguage, t: Translator): string {
  const fmt = new Intl.DateTimeFormat(language, { day: "numeric", month: "long", year: "numeric" })
  return t("report.period.range", {
    from: fmt.format(new Date(`${fromISO}T00:00:00`)),
    to: fmt.format(new Date(`${toISO}T00:00:00`)),
  })
}

export function formatReportDate(iso: string, language: ReportLanguage): string {
  return new Intl.DateTimeFormat(language, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  )
}

/**
 * The mandatory disclaimer, shared by both report formats, plus the
 * practitioner's own custom note (if any) — kept SEPARATE so the sheet can
 * render the disclaimer first and the custom note as its own second line.
 * The disclaimer is never shortened, merged, or replaced by a custom note.
 */
export function buildFooterText(footerNote: string | null, t: Translator): { disclaimer: string; customNote: string | null } {
  return { disclaimer: t("report.footer.disclaimer"), customNote: footerNote }
}

export function buildConsultationReport(input: BuildReportInput): ConsultationReport {
  const { language, period, entries, comparisonMode, priorEntries, t } = input
  const windowDays = daySpan(period.from, period.to)

  // SINGLE source of truth: reuse the practitioner clinical summary. now=period.to
  // makes clinicalSummary window exactly [from..to]. Comparaison mode routes
  // "prior" through the separately fetched previous-period/inclusion entries
  // instead of clinicalSummary's internal same-window half-split.
  const summary = buildClinicalSummary(entries, {
    t,
    locale: language,
    now: new Date(`${period.to}T12:00:00`),
    windowDays,
    comparisonMode,
    priorEntries,
  })

  const indicators: ReportIndicator[] = summary.signals.map((s) => {
    const current = s.currentNum != null ? formatValue(s.key, s.currentNum, language, t) : "—"
    const prior = s.priorNum != null ? formatValue(s.key, s.priorNum, language, t) : null
    const delta =
      s.currentNum != null && s.priorNum != null
        ? formatDelta(s.key, s.currentNum - s.priorNum, language, t)
        : null
    return { key: s.key, label: s.label, current, prior, delta, tone: s.tone }
  })

  // Notable events = the fired flags, minus the "no flags" placeholder.
  const notableEvents = summary.flags.filter((f) => f.icon !== "circle-check").map((f) => f.text)

  return {
    format: "clinical",
    reference: input.reference,
    issuedAt: input.issuedAt,
    language,
    period: {
      from: period.from,
      to: period.to,
      label: buildPeriodLabel(period.from, period.to, language, t),
    },
    practitioner: input.practitioner,
    patient: {
      fullName: input.patient.fullName,
      age: input.patient.age,
      fileNumber: input.patient.fileNumber,
      followedSince: input.patient.followedSince
        ? formatReportDate(`${input.patient.followedSince}T00:00:00`, language)
        : null,
    },
    diagnosis: input.diagnosis,
    treatments: input.treatments,
    indicators,
    comparisonMode,
    notableEvents,
    programSummary: input.programSummary,
    observations: input.observations,
    riskAssessment: input.riskAssessment,
    footerNote: input.footerNote,
    dataCompleteness: { daysLogged: summary.daysLogged, daysTotal: summary.daysTotal },
    isThin: summary.isThin,
  }
}
