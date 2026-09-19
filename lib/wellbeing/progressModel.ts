// Practitioner "patient progress" model. Pure functions over the patient's
// daily check-ins (one per clinic day, journal_entries.entry_date) plus the
// activities logged that day. Everything here is OBSERVABLE: averages, counts,
// dates and threshold crossings. Nothing is interpolated across missing days,
// no baseline is invented, and nothing is phrased as a clinical conclusion —
// the components turn these facts into short, neutral sentences.
//
// Thresholds follow lib/wellbeing/clinicalSummary.ts (used by the printed
// reports), so the screen and the letters never disagree about what a
// "low mood" day or a "baseline" is.

export type DayEntry = {
  mood: number
  anxiety: number
  sleepHours: number | null
  medicationTaken: boolean
  sideEffects: string[]
  sideEffectsOther: string | null
  challenges: string | null
  achievements: string | null
  /** Check-in time in the clinic's zone, "HH:MM". */
  checkInTime: string | null
}

export type BreathingItem = { exerciseType: string; durationSeconds: number; rating: number | null }
export type ProgramItem = { title: string | null; moodBefore: number | null; moodAfter: number | null }

export type DayRecord = {
  date: string // YYYY-MM-DD, clinic day
  entry: DayEntry | null
  breathing: BreathingItem[]
  program: ProgramItem[]
}

export type ProgressInput = {
  today: string // clinic day, YYYY-MM-DD
  entries: (DayEntry & { date: string })[]
  breathing: (BreathingItem & { date: string })[]
  program: (ProgramItem & { date: string })[]
}

export const PERIODS = [7, 14, 30] as const
export type PeriodDays = (typeof PERIODS)[number]
/** Days loaded by the server: the longest period plus the one before it. */
export const DAYS_LOADED = 60

// Same rules as clinicalSummary.ts.
const MIN_BASELINE_CHECKINS = 3
const LOW_MOOD = 3
const HIGH_ANXIETY = 7
const SHORT_SLEEP = 6
const GAP_DAYS = 3
// Average change (points on the 1–10 scale) below which a trend reads "stable".
const STABLE_BAND = 0.5
// Change that deserves the practitioner's attention.
const NOTABLE_AVG_CHANGE = 1
// Day-to-day jump between two close check-ins that counts as "sudden".
const SUDDEN_CHANGE = 3
const ADHERENCE_STABLE_BAND = 5

// ── dates (pure string arithmetic: no timezone surprises) ──────────────────
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}
export function daysBetween(a: string, b: string): number {
  const [ya, ma, da] = a.split("-").map(Number)
  const [yb, mb, db] = b.split("-").map(Number)
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000)
}

/** Chronological list of the last `totalDays` clinic days, today last. */
export function buildDays(input: ProgressInput, totalDays = DAYS_LOADED): DayRecord[] {
  const entries = new Map(input.entries.map((e) => [e.date, e]))
  const days: DayRecord[] = []
  for (let i = totalDays - 1; i >= 0; i--) {
    const date = addDays(input.today, -i)
    const e = entries.get(date)
    days.push({
      date,
      entry: e
        ? {
            mood: e.mood,
            anxiety: e.anxiety,
            sleepHours: e.sleepHours,
            medicationTaken: e.medicationTaken,
            sideEffects: e.sideEffects,
            sideEffectsOther: e.sideEffectsOther,
            challenges: e.challenges,
            achievements: e.achievements,
            checkInTime: e.checkInTime,
          }
        : null,
      breathing: input.breathing.filter((b) => b.date === date).map(({ date: _d, ...b }) => b),
      program: input.program.filter((p) => p.date === date).map(({ date: _d, ...p }) => p),
    })
  }
  return days
}

// ── statistics ─────────────────────────────────────────────────────────────
function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
}

export type PeriodStats = {
  days: number
  checkIns: number
  moodAvg: number | null
  anxietyAvg: number | null
  sleepAvg: number | null
  /** Share of check-in days on which the medication was taken. */
  adherencePct: number | null
  missedDoses: number
  missedDoseDates: string[]
}

export function periodStats(days: DayRecord[]): PeriodStats {
  const logged = days.filter((d) => d.entry)
  const sleep = logged.map((d) => d.entry!.sleepHours).filter((h): h is number => h != null)
  const missed = logged.filter((d) => !d.entry!.medicationTaken)
  return {
    days: days.length,
    checkIns: logged.length,
    moodAvg: mean(logged.map((d) => d.entry!.mood)),
    anxietyAvg: mean(logged.map((d) => d.entry!.anxiety)),
    sleepAvg: mean(sleep),
    adherencePct: logged.length ? Math.round(((logged.length - missed.length) / logged.length) * 100) : null,
    missedDoses: missed.length,
    missedDoseDates: missed.map((d) => d.date),
  }
}

export type Direction = "up" | "down" | "flat" | "none"

function direction(delta: number | null, band: number): Direction {
  if (delta == null) return "none"
  if (delta > band) return "up"
  if (delta < -band) return "down"
  return "flat"
}

// ── per-day reading ────────────────────────────────────────────────────────
export type DayFlag = "lowMood" | "highAnxiety" | "missedDose" | "moodDrop" | "anxietyRise"
export type DayTone = "good" | "steady" | "difficult" | "missing"
export type DayReading = { tone: DayTone; flags: DayFlag[] }

/** How each day reads at a glance. `days` must be chronological. */
export function readDays(days: DayRecord[]): Record<string, DayReading> {
  const out: Record<string, DayReading> = {}
  let previous: DayRecord | null = null
  for (const day of days) {
    const e = day.entry
    if (!e) {
      out[day.date] = { tone: "missing", flags: [] }
      continue
    }
    const flags: DayFlag[] = []
    if (e.mood <= LOW_MOOD) flags.push("lowMood")
    if (e.anxiety >= HIGH_ANXIETY) flags.push("highAnxiety")
    if (!e.medicationTaken) flags.push("missedDose")
    // "Sudden" only between two check-ins close enough to compare (≤ 2 days apart).
    if (previous?.entry && daysBetween(previous.date, day.date) <= 2) {
      if (previous.entry.mood - e.mood >= SUDDEN_CHANGE) flags.push("moodDrop")
      if (e.anxiety - previous.entry.anxiety >= SUDDEN_CHANGE) flags.push("anxietyRise")
    }
    const difficult = flags.includes("lowMood") || flags.includes("highAnxiety")
    const good = !difficult && e.mood >= 7 && e.anxiety <= 4 && e.medicationTaken
    out[day.date] = { tone: difficult ? "difficult" : good ? "good" : "steady", flags }
    previous = day
  }
  return out
}

// ── signals ────────────────────────────────────────────────────────────────
export type SignalKind =
  | "moodDecline"
  | "anxietyIncrease"
  | "lowMoodDays"
  | "highAnxietyDays"
  | "suddenChange"
  | "missedDoses"
  | "checkInGap"
  | "shortSleep"

export type Signal = {
  kind: SignalKind
  /** "attention" = worth looking at before the session; "info" = context. */
  severity: "attention" | "info"
  count?: number
  delta?: number
  /** The days this signal is about (chronological), for navigation. */
  dates: string[]
  /** For a check-in gap still running today. */
  ongoing?: boolean
}

export type OverallStatus = "improving" | "stable" | "watch" | "noBaseline" | "insufficient"

export type ProgressView = {
  period: PeriodDays
  days: DayRecord[] // current period, chronological
  stats: PeriodStats
  previous: PeriodStats
  hasBaseline: boolean
  deltas: { mood: number | null; anxiety: number | null; adherence: number | null; checkIns: number | null }
  directions: { mood: Direction; anxiety: Direction; adherence: Direction }
  latest: { date: string; entry: DayEntry; daysAgo: number } | null
  readings: Record<string, DayReading>
  signals: Signal[]
  overall: OverallStatus
}

function longestGap(days: DayRecord[]): { start: number; end: number } | null {
  let best: { start: number; end: number } | null = null
  let start = -1
  for (let i = 0; i <= days.length; i++) {
    const missing = i < days.length && !days[i].entry
    if (missing && start === -1) start = i
    if (!missing && start !== -1) {
      if (!best || i - 1 - start >= best.end - best.start) best = { start, end: i - 1 }
      start = -1
    }
  }
  return best && best.end - best.start + 1 >= GAP_DAYS ? best : null
}

export function buildProgressView(allDays: DayRecord[], period: PeriodDays): ProgressView {
  const days = allDays.slice(-period)
  const before = allDays.slice(-period * 2, -period)
  // The previous-period slice includes the day just before the window so a
  // sudden change on the window's first day can still be detected.
  const readingsAll = readDays(allDays.slice(-(period + 3)))
  const readings: Record<string, DayReading> = {}
  for (const d of days) readings[d.date] = readingsAll[d.date]

  const stats = periodStats(days)
  const previous = periodStats(before)
  const hasBaseline = previous.checkIns >= MIN_BASELINE_CHECKINS && stats.checkIns > 0
  const diff = (a: number | null, b: number | null) =>
    hasBaseline && a != null && b != null ? Math.round((a - b) * 10) / 10 : null
  const deltas = {
    mood: diff(stats.moodAvg, previous.moodAvg),
    anxiety: diff(stats.anxietyAvg, previous.anxietyAvg),
    adherence: diff(stats.adherencePct, previous.adherencePct),
    checkIns: before.length ? stats.checkIns - previous.checkIns : null,
  }
  const directions = {
    mood: direction(deltas.mood, STABLE_BAND),
    anxiety: direction(deltas.anxiety, STABLE_BAND),
    adherence: direction(deltas.adherence, ADHERENCE_STABLE_BAND),
  }

  const lastLogged = [...allDays].reverse().find((d) => d.entry)
  const today = allDays[allDays.length - 1]?.date
  const latest =
    lastLogged && today ? { date: lastLogged.date, entry: lastLogged.entry!, daysAgo: daysBetween(lastLogged.date, today) } : null

  // Signals — attention first, then context.
  const signals: Signal[] = []
  const logged = days.filter((d) => d.entry)
  if (deltas.mood != null && deltas.mood <= -NOTABLE_AVG_CHANGE) {
    signals.push({ kind: "moodDecline", severity: "attention", delta: deltas.mood, dates: logged.map((d) => d.date) })
  }
  if (deltas.anxiety != null && deltas.anxiety >= NOTABLE_AVG_CHANGE) {
    signals.push({ kind: "anxietyIncrease", severity: "attention", delta: deltas.anxiety, dates: logged.map((d) => d.date) })
  }
  const lowMood = logged.filter((d) => d.entry!.mood <= LOW_MOOD).map((d) => d.date)
  if (lowMood.length >= 2) signals.push({ kind: "lowMoodDays", severity: "attention", count: lowMood.length, dates: lowMood })
  const highAnxiety = logged.filter((d) => d.entry!.anxiety >= HIGH_ANXIETY).map((d) => d.date)
  if (highAnxiety.length >= 2) {
    signals.push({ kind: "highAnxietyDays", severity: "attention", count: highAnxiety.length, dates: highAnxiety })
  }
  const sudden = days.filter((d) => readings[d.date]?.flags.some((f) => f === "moodDrop" || f === "anxietyRise")).map((d) => d.date)
  if (sudden.length > 0) signals.push({ kind: "suddenChange", severity: "attention", count: sudden.length, dates: sudden })
  if (stats.missedDoses > 0) {
    signals.push({
      kind: "missedDoses",
      severity: stats.missedDoses >= 2 ? "attention" : "info",
      count: stats.missedDoses,
      dates: stats.missedDoseDates,
    })
  }
  const gap = longestGap(days)
  if (gap) {
    const dates = days.slice(gap.start, gap.end + 1).map((d) => d.date)
    signals.push({ kind: "checkInGap", severity: "info", count: dates.length, dates, ongoing: gap.end === days.length - 1 })
  }
  const shortSleep = logged.filter((d) => d.entry!.sleepHours != null && d.entry!.sleepHours < SHORT_SLEEP).map((d) => d.date)
  if (shortSleep.length >= 3) signals.push({ kind: "shortSleep", severity: "info", count: shortSleep.length, dates: shortSleep })

  let overall: OverallStatus
  if (stats.checkIns < MIN_BASELINE_CHECKINS) overall = "insufficient"
  else if (signals.some((s) => s.severity === "attention")) overall = "watch"
  else if (!hasBaseline) overall = "noBaseline"
  else if ((directions.mood === "up" || directions.anxiety === "down") && directions.mood !== "down" && directions.anxiety !== "up") {
    overall = "improving"
  } else overall = "stable"

  return { period, days, stats, previous, hasBaseline, deltas, directions, latest, readings, signals, overall }
}
