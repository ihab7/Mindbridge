import { ANXIETY_PROGRAM } from "./content"
import { librarySessionsByIds } from "./sessionLibrary"
import type { Localized, PlanEntry, Program, ProgramWeek } from "./types"

const WEEK_COLORS: Record<number, string> = { 1: "#2a9d8f", 2: "#4a8ab5", 3: "#8b5cf6", 4: "#d97706" }

function themeForWeek(weekNumber: number): Localized {
  const curated = ANXIETY_PROGRAM.weeks.find((w) => w.weekNumber === weekNumber)
  if (curated) return curated.theme
  return { en: `Week ${weekNumber}`, fr: `Semaine ${weekNumber}`, ar: `الأسبوع ${weekNumber}` }
}

/**
 * Builds the `Program` shape the patient-facing UI already knows how to render (weeks of
 * sessions) out of a flat, practitioner-approved plan — whether that plan came from the AI,
 * the rules fallback, or a manual/default assignment. There is currently only one session
 * library (anxiety), so the wrapping title/description are always `ANXIETY_PROGRAM`'s; only
 * which sessions appear, and how they're grouped into weeks, varies per patient.
 */
export function composeProgramFromPlan(plan: PlanEntry[]): Program {
  const sorted = [...plan].sort((a, b) => a.week - b.week || a.order - b.order)

  const idsByWeek = new Map<number, string[]>()
  for (const entry of sorted) {
    const list = idsByWeek.get(entry.week)
    if (list) list.push(entry.sessionId)
    else idsByWeek.set(entry.week, [entry.sessionId])
  }

  const weeks: ProgramWeek[] = [...idsByWeek.entries()]
    .sort(([a], [b]) => a - b)
    .map(([weekNumber, ids]) => ({
      weekNumber,
      color: WEEK_COLORS[weekNumber] ?? "#2a9d8f",
      theme: themeForWeek(weekNumber),
      sessions: librarySessionsByIds(ids),
    }))

  return {
    id: ANXIETY_PROGRAM.id,
    title: ANXIETY_PROGRAM.title,
    description: ANXIETY_PROGRAM.description,
    totalSessions: plan.length,
    weeks,
  }
}
