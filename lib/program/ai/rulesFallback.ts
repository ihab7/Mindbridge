import { DEFAULT_PROGRAM, librarySessionsByIds } from "../sessionLibrary"
import type { LibrarySession, ProgramProposal, ProposedSessionEntry } from "../types"

const MAX_SESSIONS = 14

type Candidate = { session: LibrarySession; week: number; rationale: string }

/**
 * Deterministic, non-AI proposal used whenever the AI call fails, times out,
 * or its response fails validation. Always produces a usable plan so a
 * practitioner can always assign something — never silently shown as an AI
 * proposal (`source: 'rules'` is set explicitly and must be surfaced in the UI).
 */
export function buildRulesProposal(signals: string[]): ProgramProposal {
  const has = (signal: string) => signals.includes(signal)

  const base: Candidate[] = librarySessionsByIds(DEFAULT_PROGRAM).map((session) => ({
    session,
    week: session.suggestedWeek,
    rationale: "Part of the standard 4-week anxiety program.",
  }))

  const candidates = new Map<string, Candidate>(base.map((c) => [c.session.id, c]))

  function addIfMissing(id: string, week: number, rationale: string) {
    if (candidates.has(id)) return
    const [session] = librarySessionsByIds([id])
    if (!session) return
    candidates.set(id, { session, week, rationale })
  }

  if (has("low_sleep") || has("poor_sleep_quality")) {
    addIfMissing("anx-sleep-anxiety", 1, "Recent entries show low or irregular sleep.")
    addIfMissing("anx-breath-sleep", 2, "Recent entries show low or irregular sleep.")
  }

  if (has("poor_adherence") || has("has_side_effects")) {
    addIfMissing("anx-medication-mood", 2, "Tracked data flags medication adherence or side effects.")
  }

  if (has("work_stress")) {
    addIfMissing("anx-cbt-worry-postponement", 3, "Journal and session-prep notes mention work-related stress.")
  }

  if (has("good_adherence")) {
    for (const [id, candidate] of candidates) {
      if (candidate.session.tags.includes("medication")) candidates.delete(id)
    }
  }

  let list = [...candidates.values()]

  if (list.length > MAX_SESSIONS) {
    const protectedIds = has("first_program")
      ? new Set(list.filter((c) => c.session.category === "education" && c.session.difficulty === 1).map((c) => c.session.id))
      : new Set<string>()

    while (list.length > MAX_SESSIONS) {
      const removableIndex = [...list].reverse().findIndex((c) => !protectedIds.has(c.session.id))
      if (removableIndex === -1) break
      list.splice(list.length - 1 - removableIndex, 1)
    }
  }

  list.sort((a, b) => a.week - b.week || DEFAULT_PROGRAM.indexOf(a.session.id) - DEFAULT_PROGRAM.indexOf(b.session.id))

  const sessions: ProposedSessionEntry[] = list.map((c, index) => ({
    id: c.session.id,
    week: c.week,
    order: index,
    rationale: c.rationale,
  }))

  return {
    source: "rules",
    sessions,
    skipped: [],
    pace: "2_per_week",
    summary: "Deterministic draft based on the standard program, adjusted for tracked signals — the AI drafting assistant was unavailable.",
    draftNote: "Here's a program tailored to help you build steady anxiety-management skills. Let's get started together.",
  }
}
