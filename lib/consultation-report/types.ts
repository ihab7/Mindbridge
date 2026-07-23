export type SectionKey =
  | "moodSummary"
  | "medicationSummary"
  | "sleepSummary"
  | "mindfulnessSummary"
  | "journalSummary"
  | "sideEffectsSummary"
  | "overallProgress"

export type RegenerableKey = SectionKey | "recommendations"

export type PatientInfo = {
  id: number
  name: string
  age: number | null
  gender: string | null
  consultationDate: string
}

export type ReportSections = {
  moodSummary: string
  medicationSummary: string
  sleepSummary: string
  mindfulnessSummary: string
  journalSummary: string
  sideEffectsSummary: string
  overallProgress: string
}

export type ConsultationReportDraft = {
  patientInfo: PatientInfo
  sections: ReportSections
  recommendations: string[]
  nextAppointment: string | null
}

export type ConsultationReport = ConsultationReportDraft & {
  id: string
  practitionerId: number
  createdAt: string
  updatedAt: string
}

export type PreviousReportSummary = {
  id: string
  consultationDate: string
  overallProgress: string
}

export type JournalEntryRow = {
  id: number
  mood: number
  anxiety: number
  sleep_hours: number
  medication_taken: boolean
  side_effects: string[] | null
  side_effects_other: string | null
  side_effects_legacy: string | null
  challenges: string | null
  achievements: string | null
  created_at: string
}

export type BreathingSessionRow = {
  id: string
  exercise_type: string
  duration_seconds: number
  completed_at: string
}
