// Warm, patient-facing weekly summary computation.
// Turns raw journal entries into a "week of weather" narrative.
// No numeric mood value is ever placed into the returned strings.

export type Weather = "sun" | "cloud-sun" | "cloud" | "cloud-rain" | "none"

export type DayWeather = {
  date: string // ISO date (YYYY-MM-DD)
  dayLabel: string // localized single letter
  dayFull: string // localized full weekday
  mood: number | null // null = no entry that day (never rendered as a number)
  weather: Weather
  reflection: string // localized one-line text
}

export type WeeklySummary = {
  days: DayWeather[] // exactly 7
  headline: string // localized
  subline: string // localized
  sleepAvgHours: number | null
  routineKeptDays: number
  routineTotalDays: number
  hasEnoughData: boolean // >= 3 mood entries in the last 7 days
  hasAnyData: boolean // at least one entry exists in the window
  hasSleepData: boolean
}

export type SummaryEntry = {
  mood: number
  anxiety: number
  sleep_hours: number
  medication_taken: boolean
  created_at: string
}

type Translate = (key: string, values?: Record<string, string | number>) => string

type BuildOptions = {
  t: Translate
  locale: string
  now?: Date
}

// Number of localized reflection variants per weather band (keys are
// wellbeing.reflection.<band>.<index>, defined in every locale file).
const REFLECTION_VARIANTS: Record<Weather, number> = {
  sun: 2,
  "cloud-sun": 2,
  cloud: 2,
  "cloud-rain": 2,
  none: 1,
}

export function moodToWeather(mood: number | null): Weather {
  if (mood == null) return "none"
  if (mood >= 8) return "sun"
  if (mood >= 6) return "cloud-sun"
  if (mood >= 4) return "cloud"
  return "cloud-rain"
}

// Local-date key so the 7-day loop and the entries bucket identically.
function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// Stable, deterministic variant pick so the same day always reads the same
// (avoids hydration mismatches and week-to-week flicker) while differing
// across days and bands.
function pickVariant(seed: string, count: number): number {
  if (count <= 1) return 0
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h % count
}

function reflectionFor(weather: Weather, dateKey: string, t: Translate): string {
  const count = REFLECTION_VARIANTS[weather]
  const idx = pickVariant(`${weather}:${dateKey}`, count)
  return t(`wellbeing.reflection.${weather}.${idx}`)
}

export function buildWeeklySummary(
  entries: SummaryEntry[],
  { t, locale, now = new Date() }: BuildOptions,
): WeeklySummary {
  const narrowFmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" })
  const longFmt = new Intl.DateTimeFormat(locale, { weekday: "long" })

  // Bucket entries by local date; keep the most recent entry per day.
  const byDay = new Map<string, SummaryEntry>()
  for (const e of entries) {
    const key = toDateKey(new Date(e.created_at))
    const existing = byDay.get(key)
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) {
      byDay.set(key, e)
    }
  }

  // This week = the 7 days ending today (index 6).
  const days: DayWeather[] = []
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeekKeys = new Set<string>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = toDateKey(d)
    thisWeekKeys.add(key)
    const entry = byDay.get(key)
    const mood = entry ? Number(entry.mood) : null
    const weather = moodToWeather(mood)
    days.push({
      date: key,
      dayLabel: narrowFmt.format(d),
      dayFull: longFmt.format(d),
      mood,
      weather,
      reflection: reflectionFor(weather, key, t),
    })
  }

  const presentDays = days.filter((d) => d.mood != null)
  const hasEnoughData = presentDays.length >= 3
  const hasAnyData = presentDays.length > 0

  // Rest / routine — this week only, over days that have an entry.
  const daysWithEntry = Array.from(thisWeekKeys)
    .map((k) => byDay.get(k))
    .filter((e): e is SummaryEntry => Boolean(e))
  const sleepValues = daysWithEntry
    .map((e) => Number(e.sleep_hours))
    .filter((h) => !Number.isNaN(h))
  const hasSleepData = sleepValues.length > 0
  const sleepAvgHours = hasSleepData
    ? Math.round((sleepValues.reduce((s, h) => s + h, 0) / sleepValues.length) * 10) / 10
    : null
  const routineTotalDays = daysWithEntry.length
  const routineKeptDays = daysWithEntry.filter((e) => e.medication_taken).length

  // Prior week = days 7..13 ago, used only to phrase the headline direction.
  const priorMoods: number[] = []
  for (let i = 13; i >= 7; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const entry = byDay.get(toDateKey(d))
    if (entry) priorMoods.push(Number(entry.mood))
  }
  const thisWeekMean =
    presentDays.length > 0
      ? presentDays.reduce((s, d) => s + (d.mood as number), 0) / presentDays.length
      : null
  const priorMean =
    priorMoods.length > 0 ? priorMoods.reduce((s, m) => s + m, 0) / priorMoods.length : null

  let headline: string
  let subline: string
  if (!hasEnoughData) {
    headline = t("wellbeing.empty.thin.headline")
    subline = t("wellbeing.empty.thin.subline")
  } else {
    if (priorMean == null || thisWeekMean == null) {
      headline = t("wellbeing.headline.default")
    } else if (thisWeekMean > priorMean + 0.8) {
      headline = t("wellbeing.headline.clearer")
    } else if (thisWeekMean < priorMean - 0.8) {
      headline = t("wellbeing.headline.cloudier")
    } else {
      headline = t("wellbeing.headline.stable")
    }
    subline = t("wellbeing.subline")
  }

  return {
    days,
    headline,
    subline,
    sleepAvgHours,
    routineKeptDays,
    routineTotalDays,
    hasEnoughData,
    hasAnyData,
    hasSleepData,
  }
}
