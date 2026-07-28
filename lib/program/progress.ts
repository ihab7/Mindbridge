import type { Program, ProgramSession, ProgramWeek, SessionProgressEntry } from "./types"
import { allSessionIds } from "./content"

export function completedIds(progress: SessionProgressEntry[]): Set<string> {
  return new Set(progress.map((p) => p.sessionId))
}

export function completedCount(progress: SessionProgressEntry[]): number {
  return progress.length
}

export function percentComplete(program: Program, progress: SessionProgressEntry[]): number {
  if (program.totalSessions === 0) return 0
  return Math.round((completedCount(progress) / program.totalSessions) * 100)
}

/** The week containing the next not-yet-completed session, or the last week if the program is finished. */
export function currentWeekNumber(program: Program, progress: SessionProgressEntry[]): number {
  const done = completedIds(progress)
  for (const week of program.weeks) {
    if (week.sessions.some((s) => !done.has(s.id))) return week.weekNumber
  }
  return program.weeks[program.weeks.length - 1]?.weekNumber ?? 1
}

/** Sessions unlock in order: the first session is always open, every other session
 *  unlocks once the one immediately before it (in program order) is completed. */
export function isSessionUnlocked(program: Program, progress: SessionProgressEntry[], sessionId: string): boolean {
  const order = allSessionIds(program)
  const index = order.indexOf(sessionId)
  if (index <= 0) return true
  const done = completedIds(progress)
  return done.has(order[index - 1])
}

export function nextSession(
  program: Program,
  progress: SessionProgressEntry[]
): { session: ProgramSession; week: ProgramWeek } | null {
  const done = completedIds(progress)
  for (const week of program.weeks) {
    const session = week.sessions.find((s) => !done.has(s.id))
    if (session) return { session, week }
  }
  return null
}

function toLocalDateKey(value: string): string {
  const d = new Date(value)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function hasCompletedToday(progress: SessionProgressEntry[]): boolean {
  const todayKey = toLocalDateKey(new Date().toISOString())
  return progress.some((p) => toLocalDateKey(p.completedAt) === todayKey)
}

/** Consecutive-day streak of completed sessions, counting back from today (or yesterday, so a
 *  streak isn't broken just because today's session hasn't happened yet). */
export function dayStreak(progress: SessionProgressEntry[]): number {
  if (progress.length === 0) return 0
  const days = new Set(progress.map((p) => toLocalDateKey(p.completedAt)))

  let streak = 0
  const cursor = new Date()
  if (!days.has(toLocalDateKey(cursor.toISOString()))) {
    // Today has no session yet — start counting from yesterday instead.
    cursor.setDate(cursor.getDate() - 1)
  }
  while (days.has(toLocalDateKey(cursor.toISOString()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export type MoodTrend = "up" | "down" | "flat" | null

/** Compares the average mood delta (after - before) of the earlier half of completed
 *  sessions against the later half, to give a simple directional trend. */
export function moodTrend(progress: SessionProgressEntry[]): MoodTrend {
  const withMood = [...progress]
    .filter((p) => p.moodBefore != null && p.moodAfter != null)
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())

  if (withMood.length < 2) return null

  const mid = Math.ceil(withMood.length / 2)
  const firstHalf = withMood.slice(0, mid)
  const secondHalf = withMood.slice(mid)

  const avg = (rows: SessionProgressEntry[]) =>
    rows.reduce((sum, r) => sum + ((r.moodAfter ?? 0) - (r.moodBefore ?? 0)), 0) / rows.length

  const firstAvg = avg(firstHalf)
  const secondAvg = secondHalf.length ? avg(secondHalf) : firstAvg

  const diff = secondAvg - firstAvg
  if (diff > 0.15) return "up"
  if (diff < -0.15) return "down"
  return "flat"
}

export function liftedDuringLastSession(progress: SessionProgressEntry[]): boolean {
  const last = [...progress].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )[0]
  if (!last || last.moodBefore == null || last.moodAfter == null) return false
  return last.moodAfter > last.moodBefore
}

export type TriggerFrequency = { label: string; count: number }

export function aggregateTriggers(progress: SessionProgressEntry[]): TriggerFrequency[] {
  const counts = new Map<string, number>()
  for (const entry of progress) {
    for (const trigger of entry.selectedTriggers) {
      counts.set(trigger, (counts.get(trigger) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export function recentReflections(
  progress: SessionProgressEntry[],
  limit = 3
): SessionProgressEntry[] {
  return [...progress]
    .filter((p) => p.reflectionAnswer.trim().length > 0)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, limit)
}
