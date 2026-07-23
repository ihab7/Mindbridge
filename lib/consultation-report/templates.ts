import type { PatientAnalysis } from "./analysis"
import type { ReportSections } from "./types"

function moodSummary(analysis: PatientAnalysis): string {
  const { mood } = analysis

  if (mood.trend === "insufficient") {
    return mood.entryCount === 0
      ? "No mood data has been logged yet for this period."
      : "Not enough entries yet to establish a clear mood trend."
  }

  const trendSentence =
    mood.trend === "improving"
      ? "Mood has been improving over the recent tracking period."
      : mood.trend === "declining"
        ? "Mood has declined somewhat over the recent tracking period."
        : "Mood remains stable over the recent tracking period."

  const anxietySentence =
    mood.anxietyEpisodes === 0
      ? "No high-anxiety episodes were reported."
      : mood.anxietyEpisodes === 1
        ? "One high-anxiety episode was reported."
        : `${mood.anxietyEpisodes} high-anxiety episodes were reported, indicating some ongoing anxiety symptoms.`

  return `${trendSentence} ${anxietySentence}`
}

function medicationSummary(analysis: PatientAnalysis): string {
  const { medication } = analysis

  if (medication.entryCount === 0) {
    return "No medication adherence data has been logged yet."
  }

  const adherenceSentence =
    medication.adherenceRate >= 90
      ? "Excellent adherence to prescribed medication."
      : medication.adherenceRate >= 70
        ? `Good overall adherence, with medication missed ${medication.missedCount} time${medication.missedCount === 1 ? "" : "s"} during this period.`
        : `Medication compliance is a concern, with ${medication.missedCount} missed dose${medication.missedCount === 1 ? "" : "s"} out of ${medication.entryCount} logged entries.`

  const trendSentence =
    medication.trend === "improving"
      ? " Medication compliance has improved over the recent period."
      : medication.trend === "declining"
        ? " Adherence has declined recently and may warrant discussion."
        : ""

  return `${adherenceSentence}${trendSentence}`
}

function sleepSummary(analysis: PatientAnalysis): string {
  const { sleep } = analysis

  if (sleep.entryCount === 0) {
    return "No sleep data has been logged yet for this period."
  }

  const avg = sleep.avgHours.toFixed(1)
  const qualitySentence =
    sleep.trend === "improving"
      ? "Sleep quality has improved over the recent tracking period."
      : sleep.trend === "declining"
        ? "Sleep quality has slightly deteriorated over the recent tracking period."
        : "Sleep patterns remain stable."

  const durationSentence = `Average sleep duration: ${avg} hours.`
  const lowSleepNote = sleep.avgHours < 6 ? " Patient reports reduced sleep duration, which may be affecting mood and energy levels." : ""

  return `${qualitySentence} ${durationSentence}${lowSleepNote}`
}

function mindfulnessSummary(analysis: PatientAnalysis): string {
  const { mindfulness } = analysis
  const total = mindfulness.breathingCount + mindfulness.meditationCount

  if (total === 0) {
    return "No breathing or meditation sessions were recorded during this period. Introducing a mindfulness practice may support overall treatment."
  }

  const countsSentence = `Completed ${mindfulness.breathingCount} breathing session${mindfulness.breathingCount === 1 ? "" : "s"} and ${mindfulness.meditationCount} meditation session${mindfulness.meditationCount === 1 ? "" : "s"} (${mindfulness.totalMinutes} minutes total).`
  const recommendation =
    total >= 8
      ? " Recommend maintaining the current daily mindfulness practice."
      : " Recommend increasing the frequency of mindfulness practice."

  return `${countsSentence}${recommendation}`
}

function journalSummary(analysis: PatientAnalysis): string {
  const { journal } = analysis

  if (journal.dominantTheme === "insufficient") {
    return "No journal reflections were logged during this period."
  }

  const themeSentence =
    journal.dominantTheme === "positive"
      ? "Patient reports feeling calmer and more optimistic in recent entries."
      : journal.dominantTheme === "negative"
        ? "Patient reports ongoing stress and difficult emotions in recent entries."
        : "Patient reports a mix of positive and difficult emotions in recent entries."

  const trendSentence =
    journal.dominantTheme === "positive" ? " Negative thoughts have decreased." : ""

  const stressSentence = journal.stressCategory
    ? ` Stress triggers remain primarily ${journal.stressCategory}-related.`
    : ""

  return `${themeSentence}${trendSentence}${stressSentence}`
}

function sideEffectsSummary(analysis: PatientAnalysis): string {
  const { sideEffects } = analysis

  if (sideEffects.frequency.length === 0) {
    return "No significant side effects reported."
  }

  const listed = sideEffects.frequency
    .slice(0, 4)
    .map((f) => `${f.label} (${f.count}x)`)
    .join(", ")

  const severityNote = sideEffects.hasSevere
    ? " These occurred frequently enough to warrant clinical review."
    : " No severe adverse reactions reported."

  return `Reported side effects: ${listed}.${severityNote}`
}

function overallProgress(analysis: PatientAnalysis): string {
  const { mood, medication, sleep } = analysis

  const positiveSignals = [
    mood.trend === "improving",
    medication.adherenceRate >= 80,
    sleep.trend !== "declining",
  ].filter(Boolean).length

  if (mood.entryCount === 0) {
    return "Insufficient tracked data is available to assess overall treatment progress at this time."
  }

  if (positiveSignals >= 2) {
    return "The patient is responding positively to treatment with measurable improvement in emotional regulation and medication adherence."
  }

  if (positiveSignals === 1) {
    return "Treatment is progressing with mixed results; continued monitoring is recommended to consolidate gains."
  }

  return "Treatment progress has been limited during this period; a review of the current care plan is recommended."
}

export function generateSections(analysis: PatientAnalysis): ReportSections {
  return {
    moodSummary: moodSummary(analysis),
    medicationSummary: medicationSummary(analysis),
    sleepSummary: sleepSummary(analysis),
    mindfulnessSummary: mindfulnessSummary(analysis),
    journalSummary: journalSummary(analysis),
    sideEffectsSummary: sideEffectsSummary(analysis),
    overallProgress: overallProgress(analysis),
  }
}

const SECTION_GENERATORS: Record<keyof ReportSections, (analysis: PatientAnalysis) => string> = {
  moodSummary,
  medicationSummary,
  sleepSummary,
  mindfulnessSummary,
  journalSummary,
  sideEffectsSummary,
  overallProgress,
}

export function generateSection(section: keyof ReportSections, analysis: PatientAnalysis): string {
  return SECTION_GENERATORS[section](analysis)
}

export function generateRecommendations(analysis: PatientAnalysis): string[] {
  const { mood, medication, sleep, mindfulness, sideEffects } = analysis
  const candidates: string[] = []

  if (medication.adherenceRate >= 80) {
    candidates.push("Continue current medication regimen")
  } else if (medication.entryCount > 0) {
    candidates.push("Review medication routine to improve adherence")
  }

  if (mindfulness.breathingCount + mindfulness.meditationCount < 8) {
    candidates.push("Increase frequency of breathing and mindfulness exercises")
  } else {
    candidates.push("Continue daily mindfulness practice")
  }

  if (sleep.avgHours > 0 && sleep.avgHours < 7) {
    candidates.push("Improve sleep hygiene (consistent bedtime, reduced screen time before bed)")
  }

  if (mood.anxietyEpisodes >= 2) {
    candidates.push("Consider additional anxiety management strategies")
  }

  candidates.push("Continue daily journaling to track emotional patterns")

  if (sideEffects.frequency.length > 0) {
    candidates.push("Monitor reported side effects at the next check-in")
  }

  candidates.push("Maintain regular physical activity")

  return Array.from(new Set(candidates)).slice(0, 5)
}
