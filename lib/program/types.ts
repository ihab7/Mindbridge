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

// ── Session library (AI-assisted care planning) ──────────────────────────

export type SessionCategory = "education" | "breathing" | "grounding" | "cbt" | "reflection" | "planning" | "somatic"

export type ExerciseKind = "breathing" | "grounding_54321" | "thought_record" | "reframe" | "distortion_picker" | "none"

/**
 * A session as it lives in the flat, tagged library that programs are composed
 * from. `breathing` is kept as-is (required) so the existing session player
 * keeps working unmodified for every session, including non-breathing ones,
 * which use it as a calming interlude. `exercise` is separate, AI-facing
 * metadata describing what the session actually teaches/practices.
 */
export type LibrarySession = ProgramSession & {
  category: SessionCategory
  tags: string[]
  targets: string[]
  difficulty: 1 | 2 | 3
  /** Session ids that should come earlier in any program that includes this one. */
  prerequisites: string[]
  /** AI hint for which week this session fits best; overridable by the practitioner. */
  suggestedWeek: number
  exercise: {
    kind: ExerciseKind
    pattern?: BreathingPattern
    durationSec?: number
    defaultSound?: ProgramSoundId
  }
}

/** One entry in a practitioner-approved plan, as stored in `program_assignments.plan`. */
export type PlanEntry = {
  sessionId: string
  week: number
  order: number
}

export type ProposalSource = "ai" | "rules" | "manual"

export type ProposedSessionEntry = {
  id: string
  week: number
  order: number
  rationale: string
}

export type ProposedSkippedEntry = { id: string; reason: string }

export type ProgramPace = "2_per_week" | "3_per_week" | "daily"

/** A drafted (not-yet-approved) plan — the shared output shape of both the
 *  AI proposal (after validation) and the deterministic rules fallback. */
export type ProgramProposal = {
  source: ProposalSource
  sessions: ProposedSessionEntry[]
  skipped: ProposedSkippedEntry[]
  pace: ProgramPace
  summary: string
  draftNote: string
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

/** What the practitioner changed relative to the drafted proposal, kept for the audit trail. */
export type PractitionerEdits = {
  removed: string[]
  added: string[]
  reordered: boolean
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
  source: ProposalSource
  plan: PlanEntry[]
  aiSummary: string
}

/** Combined payload returned to the patient-facing program page. */
export type ProgramAssignmentWithProgress = {
  assignment: ProgramAssignment
  progress: SessionProgressEntry[]
  practitionerName: string
}
