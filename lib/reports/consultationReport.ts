// Data model + snapshot builder for the printable clinical consultation letter.
// Indicators and notable events come ENTIRELY from lib/wellbeing/clinicalSummary
// (buildClinicalSummary) — this module formats and arranges them, it never
// recomputes a signal or a flag. Baselines that clinicalSummary reports as
// absent stay absent here (prior/delta => null, printed as "—").

import { buildClinicalSummary, type ClinicalEntry, type SignalTone } from "@/lib/wellbeing/clinicalSummary"
import type { Translator } from "@/lib/server-i18n"

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
  indicators: ReportIndicator[]
  notableEvents: string[]
  programSummary: string | null
  observations: string | null
  footerNote: string | null // practitioner override; disclaimer still enforced by the sheet
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
  entries: ClinicalEntry[]
  programSummary: string | null
  observations: string | null
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
 * The footer disclaimer text, shared by both report formats. The self-reported
 * -data phrase is mandatory and cannot be removed — only appended to — so a
 * custom footerNote that doesn't already contain it gets the mandatory
 * sentence appended.
 */
export function buildFooterText(footerNote: string | null, t: Translator): string {
  const phrase = t("report.footer.selfReportedPhrase")
  let footer = footerNote ?? t("report.footer.default")
  if (!footer.includes(phrase)) footer = `${footer} ${t("report.footer.selfReportedSentence")}`
  return footer
}

export function buildConsultationReport(input: BuildReportInput): ConsultationReport {
  const { language, period, entries, t } = input
  const windowDays = daySpan(period.from, period.to)

  // SINGLE source of truth: reuse the practitioner clinical summary. now=period.to
  // makes clinicalSummary window exactly [from..to].
  const summary = buildClinicalSummary(entries, {
    t,
    locale: language,
    now: new Date(`${period.to}T12:00:00`),
    windowDays,
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
    indicators,
    notableEvents,
    programSummary: input.programSummary,
    observations: input.observations,
    footerNote: input.footerNote,
    dataCompleteness: { daysLogged: summary.daysLogged, daysTotal: summary.daysTotal },
    isThin: summary.isThin,
  }
}
