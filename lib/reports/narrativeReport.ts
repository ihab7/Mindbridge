// Narrative summary format: warm prose sections for the patient or session
// notes. Every sentence is picked from a fixed template by computed values —
// nothing here is AI-written prose. It reuses buildClinicalSummary for the
// same mood/anxiety/sleep/adherence signals and flags the clinical letter
// uses (same underlying numbers, presented differently); the sections
// clinicalSummary doesn't cover (mindfulness sessions, side effects, journal
// keyword extraction, next appointment) are plain deterministic aggregates of
// raw data, not a second computation of anything clinicalSummary already does.

import { buildClinicalSummary, type ClinicalEntry, type ClinicalSummary } from "@/lib/wellbeing/clinicalSummary"
import { topKeywords } from "@/lib/text/keywords"
import type { Translator } from "@/lib/server-i18n"
import {
  daySpan,
  buildPeriodLabel,
  formatReportDate,
  type ReportLanguage,
  type ReportPeriod,
  type ConsultationReport,
  type RiskAssessment,
} from "./consultationReport"
// Type-only import: erased at compile time, no runtime circular dependency.
import type { ReportDiagnosis, ReportTreatment } from "./data"

export type ReportEntry = ClinicalEntry & {
  side_effects: string[]
  side_effects_other: string | null
}

export type NarrativeReport = {
  format: "narrative"
  reference: string
  issuedAt: string
  language: ReportLanguage
  period: ReportPeriod
  practitioner: ConsultationReport["practitioner"]
  patient: ConsultationReport["patient"]
  diagnosis: ReportDiagnosis | null
  treatments: ReportTreatment[]
  mood: string
  medication: string
  sleep: string
  mindfulness: string
  journal: string
  sideEffects: string
  overallProgress: string
  recommendations: string[]
  nextAppointment: string
  riskAssessment: RiskAssessment
  footerNote: string | null
  dataCompleteness: { daysLogged: number; daysTotal: number }
  isThin: boolean
}

export type BuildNarrativeInput = {
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
  entries: ReportEntry[]
  programSummary: string | null
  breathingSessionCount: number
  nextAppointmentIso: string | null
  riskAssessment: RiskAssessment
  footerNote: string | null
  t: Translator
}

function fmt1(n: number): string {
  return n.toFixed(1)
}

function buildMoodSection(summary: ClinicalSummary, t: Translator): string {
  const mood = summary.signals.find((s) => s.key === "mood")!
  if (summary.daysLogged < 3 || mood.currentNum == null) return t("report.narrative.mood.notEnough")
  const m = mood.currentNum
  let text: string
  if (m >= 7) text = t("report.narrative.mood.high")
  else if (m >= 5) text = t("report.narrative.mood.mid")
  else if (m >= 3) text = t("report.narrative.mood.low")
  else text = t("report.narrative.mood.veryLow")

  if (mood.priorNum != null) {
    const delta = mood.currentNum - mood.priorNum
    if (delta >= 1.0) text += ` ${t("report.narrative.mood.trendImproving")}`
    else if (delta <= -1.0) text += ` ${t("report.narrative.mood.trendDeclining")}`
  }
  return text
}

function buildMedicationSection(summary: ClinicalSummary, t: Translator): string {
  const adherence = summary.signals.find((s) => s.key === "adherence")!
  if (adherence.currentNum == null) return t("report.narrative.medication.noData")
  const pct = adherence.currentNum
  const missed = summary.series.doseMissed.filter((missed, i) => summary.series.mood[i] != null && missed).length
  if (pct >= 95) return t("report.narrative.medication.excellent")
  if (pct >= 90) return t("report.narrative.medication.good")
  if (pct >= 70) return t("report.narrative.medication.slipped", { count: missed })
  return t("report.narrative.medication.dropped", { count: missed })
}

function buildSleepSection(summary: ClinicalSummary, t: Translator): string {
  const sleep = summary.signals.find((s) => s.key === "sleep")!
  if (sleep.currentNum == null) return t("report.narrative.sleep.noData")
  const hours = sleep.currentNum
  let text: string
  if (hours >= 7) text = t("report.narrative.sleep.stable", { hours: fmt1(hours) })
  else if (hours >= 6) text = t("report.narrative.sleep.short", { hours: fmt1(hours) })
  else text = t("report.narrative.sleep.veryShort", { hours: fmt1(hours) })

  if (sleep.priorNum != null && sleep.priorNum - hours >= 1.0) {
    text += ` ${t("report.narrative.sleep.downFrom", { prior: fmt1(sleep.priorNum) })}`
  }
  return text
}

function buildMindfulnessSection(count: number, t: Translator): string {
  if (count >= 4) return t("report.narrative.mindfulness.regular", { count })
  if (count >= 1) return t("report.narrative.mindfulness.some", { count })
  return t("report.narrative.mindfulness.none")
}

function buildJournalSection(entries: ReportEntry[], t: Translator): string {
  if (entries.length === 0) return t("report.narrative.journal.empty")
  const texts = entries.flatMap((e) => [e.challenges, e.achievements]).filter((s): s is string => Boolean(s))
  const kws = topKeywords(texts, 3)
  if (kws.length > 0) {
    return t("report.narrative.journal.withKeywords", {
      count: entries.length,
      keywords: kws.map((k) => k.word).join(", "),
    })
  }
  return t("report.narrative.journal.countOnly", { count: entries.length })
}

function buildSideEffectsSection(entries: ReportEntry[], t: Translator): string {
  const counts = new Map<string, number>()
  for (const e of entries) {
    for (const effect of e.side_effects ?? []) {
      if (!effect || effect === "none") continue
      if (effect === "other") {
        const label = e.side_effects_other?.trim()
        if (label) counts.set(label, (counts.get(label) ?? 0) + 1)
        continue
      }
      const label = t(`report.narrative.sideEffect.${effect}`)
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
  }
  if (counts.size === 0) return t("report.narrative.sideEffects.none")
  const list = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => t("report.narrative.sideEffects.item", { name, count }))
    .join(", ")
  return t("report.narrative.sideEffects.list", { list })
}

function buildOverallProgressSection(summary: ClinicalSummary, t: Translator): string {
  const danger = summary.signals.filter((s) => s.tone === "danger")
  const warning = summary.signals.filter((s) => s.tone === "warning")
  if (danger.length > 0) {
    const areas = danger.map((s) => s.label).join(", ")
    return t("report.narrative.progress.concern", { areas })
  }
  if (warning.length > 0) return t("report.narrative.progress.someAttention")
  return t("report.narrative.progress.steady")
}

function buildRecommendations(summary: ClinicalSummary, hasProgram: boolean, t: Translator): string[] {
  const bullets: string[] = []
  const sleep = summary.signals.find((s) => s.key === "sleep")!
  const adherence = summary.signals.find((s) => s.key === "adherence")!
  const anxiety = summary.signals.find((s) => s.key === "anxiety")!
  const mood = summary.signals.find((s) => s.key === "mood")!

  const lowSleep = sleep.tone === "danger" || sleep.tone === "warning"
  const lowAdherence = adherence.tone === "danger" || adherence.tone === "warning"
  const highAnxiety = anxiety.tone === "danger"
  const decliningMood = mood.currentNum != null && mood.priorNum != null && mood.currentNum - mood.priorNum <= -1.0

  if (lowSleep) bullets.push(t("report.narrative.rec.lowSleep"))
  if (lowAdherence) bullets.push(t("report.narrative.rec.lowAdherence"))
  if (highAnxiety) bullets.push(t("report.narrative.rec.highAnxiety"))
  if (!hasProgram) bullets.push(t("report.narrative.rec.noProgram"))
  if (decliningMood) bullets.push(t("report.narrative.rec.decliningMood"))
  if (bullets.length === 0) bullets.push(t("report.narrative.rec.goodProgress"))
  bullets.push(t("report.narrative.rec.checkIns"))
  return bullets
}

function buildNextAppointmentText(iso: string | null, language: ReportLanguage, t: Translator): string {
  if (!iso) return t("report.narrative.nextAppointment.notScheduled")
  return formatReportDate(iso, language)
}

export function buildNarrativeReport(input: BuildNarrativeInput): NarrativeReport {
  const { language, period, entries, t } = input
  const windowDays = daySpan(period.from, period.to)

  // SAME single source of truth as the clinical letter — no independent
  // recomputation of mood/anxiety/sleep/adherence or the flags.
  const summary = buildClinicalSummary(entries, {
    t,
    locale: language,
    now: new Date(`${period.to}T12:00:00`),
    windowDays,
  })

  return {
    format: "narrative",
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
    mood: buildMoodSection(summary, t),
    medication: buildMedicationSection(summary, t),
    sleep: buildSleepSection(summary, t),
    mindfulness: buildMindfulnessSection(input.breathingSessionCount, t),
    journal: buildJournalSection(entries, t),
    sideEffects: buildSideEffectsSection(entries, t),
    overallProgress: buildOverallProgressSection(summary, t),
    recommendations: buildRecommendations(summary, input.programSummary != null, t),
    nextAppointment: buildNextAppointmentText(input.nextAppointmentIso, language, t),
    riskAssessment: input.riskAssessment,
    footerNote: input.footerNote,
    dataCompleteness: { daysLogged: summary.daysLogged, daysTotal: summary.daysTotal },
    isThin: summary.isThin,
  }
}
