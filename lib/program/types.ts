import type { Locale } from "@/i18n/routing"

export type Localized = Record<Locale, string>
export type LocalizedList = Record<Locale, string[]>

export type BreathingPattern = "box" | "478" | "coherent"
export type ProgramSoundId = "rain" | "ocean" | "forest"

export type ProgramSession = {
  id: string
  title: Localized
  durationMin: number
  typeLabel: Localized
  learn: {
    paragraphs: LocalizedList
  }
  whyThisWorks: Localized
  triggerChips?: {
    prompt: Localized
    options: LocalizedList
  }
  breathing: {
    pattern: BreathingPattern
    durationSec: number
    defaultSound: ProgramSoundId
  }
  affirmation: Localized
  reflection: {
    question: Localized
  }
}

export type ProgramWeek = {
  weekNumber: number
  color: string
  theme: Localized
  sessions: ProgramSession[]
}

export type Program = {
  id: string
  title: Localized
  description: Localized
  totalSessions: number
  weeks: ProgramWeek[]
}

/** One row per completed session, as stored in `session_progress`. */
export type SessionProgressEntry = {
  sessionId: string
  moodBefore: number | null
  moodAfter: number | null
  reflectionAnswer: string
  selectedTriggers: string[]
  completedAt: string
}

export type ProgramAssignment = {
  id: string
  programId: string
  patientId: number
  practitionerId: number
  practitionerNote: string
  status: "active" | "completed"
  assignedAt: string
  completedAt: string | null
}

/** Combined payload returned to the patient-facing program page. */
export type ProgramAssignmentWithProgress = {
  assignment: ProgramAssignment
  progress: SessionProgressEntry[]
  practitionerName: string
}
