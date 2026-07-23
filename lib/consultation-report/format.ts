import type { ConsultationReportDraft } from "./types"

function formatDate(value: string | null): string {
  if (!value) return "Not scheduled"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not scheduled"
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
}

export function formatReportAsText(report: ConsultationReportDraft): string {
  const { patientInfo, sections, recommendations, nextAppointment } = report

  const lines = [
    "Consultation Report",
    "",
    `Patient: ${patientInfo.name}`,
    ...(patientInfo.age ? [`Age: ${patientInfo.age}`] : []),
    ...(patientInfo.gender ? [`Gender: ${patientInfo.gender}`] : []),
    `Date: ${formatDate(patientInfo.consultationDate)}`,
    "",
    "Current Mood",
    sections.moodSummary,
    "",
    "Medication",
    sections.medicationSummary,
    "",
    "Sleep",
    sections.sleepSummary,
    "",
    "Mindfulness",
    sections.mindfulnessSummary,
    "",
    "Journal",
    sections.journalSummary,
    "",
    "Side Effects",
    sections.sideEffectsSummary,
    "",
    "Overall Progress",
    sections.overallProgress,
    "",
    "Recommendations",
    ...recommendations.map((r) => `- ${r}`),
    "",
    "Next Appointment",
    formatDate(nextAppointment),
  ]

  return lines.join("\n")
}
