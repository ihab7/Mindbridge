// Practitioner-side clinical summary. Full numeric precision, red/amber flags,
// no fabricated baselines, no interpolation across missing days. This is the
// deliberate opposite of the patient-facing weather summary.

import { topKeywords } from "@/lib/text/keywords"

export type SignalTone = "danger" | "warning" | "neutral" | "good"

export type ClinicalSignal = {
  key: "anxiety" | "mood" | "sleep" | "adherence"
  label: string
  value: string // formatted, e.g. "5.9" or "5.7h" or "79%"
  priorValue: string // "was 4.6" or "no baseline"
  trend: "up" | "down" | "flat"
  tone: SignalTone
  // Raw numeric values behind `value`/`priorValue`, exposed so downstream
  // consumers (e.g. the printed consultation report) can re-format with locale
  // decimals and compute a signed delta WITHOUT recomputing the signal. Unit is
  // the metric's natural unit: points (1-10) for mood/anxiety, hours for sleep,
  // percent for adherence. priorNum is null when there is no trustworthy
  // baseline — never a fabricated figure.
  currentNum: number | null
  priorNum: number | null
}

export type ClinicalFlag = {
  icon: string // tabler icon name (short form)
  tone: SignalTone
  text: string // localized, specific, cites numbers
}

export type ClinicalSummary = {
  windowDays: number // 14
  daysLogged: number
  daysTotal: number
  hasAnyData: boolean
  isThin: boolean // fewer than 4 logged days
  signals: ClinicalSignal[]
  flags: ClinicalFlag[]
  series: {
    dates: string[] // ISO date, one per day in window (chronological)
    mood: (number | null)[]
    anxiety: (number | null)[]
    sleepHours: (number | null)[]
    doseMissed: boolean[]
  }
}

export type ClinicalEntry = {
  mood: number
  anxiety: number
  sleep_hours: number
  medication_taken: boolean
  challenges?: string | null
  achievements?: string | null
  created_at: string
}

type Translate = (key: string, values?: Record<string, string | number>) => string

type BuildOptions = {
  t: Translate
  locale: string
  now?: Date
  windowDays?: number
  // "withinWindow" (default) is the original behavior: prior = first half of
  // the same window, current = second half — used by the practitioner
  // wellbeing panel and unchanged. The report's Comparaison modes replace
  // that split entirely: current becomes the mean of the FULL window, and
  // prior comes from `priorEntries` (a separately fetched period), never
  // computed by splitting `entries`.
  comparisonMode?: "withinWindow" | "previousPeriod" | "inclusion"
  priorEntries?: ClinicalEntry[]
}

const TONE_ORDER: Record<SignalTone, number> = { danger: 0, warning: 1, neutral: 2, good: 3 }

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
}

function fmt1(n: number): string {
  return n.toFixed(1)
}

function dedupeByDay(entries: ClinicalEntry[]): ClinicalEntry[] {
  const byDay = new Map<string, ClinicalEntry>()
  for (const e of entries) {
    const key = toDateKey(new Date(e.created_at))
    const existing = byDay.get(key)
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) byDay.set(key, e)
  }
  return [...byDay.values()]
}

export function buildClinicalSummary(
  entries: ClinicalEntry[],
  { t, locale, now = new Date(), windowDays = 14, comparisonMode = "withinWindow", priorEntries }: BuildOptions,
): ClinicalSummary {
  const shortDate = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" })
  const fmtDate = (iso: string) => shortDate.format(new Date(`${iso}T00:00:00`))

  // One representative entry per calendar day (the latest that day).
  const byDay = new Map<string, ClinicalEntry>()
  for (const e of entries) {
    const key = toDateKey(new Date(e.created_at))
    const existing = byDay.get(key)
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) byDay.set(key, e)
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dates: string[] = []
  const mood: (number | null)[] = []
  const anxiety: (number | null)[] = []
  const sleepHours: (number | null)[] = []
  const doseMissed: boolean[] = []

  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = toDateKey(d)
    const e = byDay.get(key)
    dates.push(key)
    mood.push(e ? Number(e.mood) : null)
    anxiety.push(e ? Number(e.anxiety) : null)
    sleepHours.push(e ? Number(e.sleep_hours) : null)
    doseMissed.push(e ? !e.medication_taken : false)
  }

  const daysTotal = windowDays
  const daysLogged = dates.filter((_, i) => mood[i] != null).length
  const hasAnyData = daysLogged > 0
  const isThin = daysLogged < 4

  // Split the window in half: recent 7 vs prior 7 (chronological, so the tail
  // is "recent"). half = windowDays/2.
  const half = Math.floor(windowDays / 2)
  const recentIdx = dates.map((_, i) => i).filter((i) => i >= windowDays - half)
  const priorIdx = dates.map((_, i) => i).filter((i) => i < windowDays - half)

  const present = (arr: (number | null)[], idx: number[]) =>
    idx.map((i) => arr[i]).filter((v): v is number => v != null)

  // Prior-window baseline is only trustworthy with >= 3 entries; otherwise we
  // report "no baseline" rather than inventing a comparison.
  const priorLogged = priorIdx.filter((i) => mood[i] != null).length
  const hasBaseline = priorLogged >= 3

  // External-prior modes (report Comparaison): "current" is the mean of the
  // FULL window (not just its recent half), and "prior" comes entirely from
  // a separately fetched period — never from splitting `entries`.
  const useExternalPrior = comparisonMode !== "withinWindow"
  const fullWindowIdx = dates.map((_, i) => i)
  const priorDaily = useExternalPrior ? dedupeByDay(priorEntries ?? []) : []
  const priorMoodVals = priorDaily.map((e) => Number(e.mood))
  const priorAnxietyVals = priorDaily.map((e) => Number(e.anxiety))
  const priorSleepVals = priorDaily.map((e) => Number(e.sleep_hours))
  const priorAdherencePct =
    priorDaily.length > 0
      ? Math.round((priorDaily.filter((e) => e.medication_taken).length / priorDaily.length) * 100)
      : null
  const hasExternalBaseline = priorDaily.length >= 3
  const currentIdx = useExternalPrior ? fullWindowIdx : recentIdx
  const baselineOk = useExternalPrior ? hasExternalBaseline : hasBaseline

  function directionTrend(delta: number | null, threshold: number): "up" | "down" | "flat" {
    if (delta == null) return "flat"
    if (delta > threshold) return "up"
    if (delta < -threshold) return "down"
    return "flat"
  }

  const signals: ClinicalSignal[] = []

  // ---- Anxiety (higher is worse) ----
  {
    const recent = mean(present(anxiety, currentIdx))
    const prior = useExternalPrior ? mean(priorAnxietyVals) : mean(present(anxiety, priorIdx))
    const delta = baselineOk && recent != null && prior != null ? recent - prior : null
    let tone: SignalTone = "neutral"
    if (recent != null) {
      const rising = delta != null && delta >= 0.2
      if (recent >= 7 || (delta != null && delta >= 1.0)) tone = "danger"
      else if (recent >= 5.5 || (delta != null && delta >= 0.5)) tone = "warning"
      else if (recent <= 3.5 && !rising) tone = "good"
    }
    signals.push({
      key: "anxiety",
      label: t("practitioner.wellbeing.chip.anxiety"),
      value: recent != null ? fmt1(recent) : "—",
      priorValue:
        baselineOk && prior != null
          ? t("practitioner.wellbeing.chip.was", { value: fmt1(prior) })
          : t("practitioner.wellbeing.chip.noBaseline"),
      trend: directionTrend(delta, 0.2),
      tone,
      currentNum: recent,
      priorNum: baselineOk ? prior : null,
    })
  }

  // ---- Mood (higher is better) ----
  {
    const recent = mean(present(mood, currentIdx))
    const prior = useExternalPrior ? mean(priorMoodVals) : mean(present(mood, priorIdx))
    const delta = baselineOk && recent != null && prior != null ? recent - prior : null
    let tone: SignalTone = "neutral"
    if (recent != null) {
      const falling = delta != null && delta <= -0.2
      if (recent <= 3.5 || (delta != null && delta <= -1.5)) tone = "danger"
      else if (recent <= 5 || (delta != null && delta <= -0.8)) tone = "warning"
      else if (recent >= 7 && !falling) tone = "good"
    }
    signals.push({
      key: "mood",
      label: t("practitioner.wellbeing.chip.mood"),
      value: recent != null ? fmt1(recent) : "—",
      priorValue:
        baselineOk && prior != null
          ? t("practitioner.wellbeing.chip.was", { value: fmt1(prior) })
          : t("practitioner.wellbeing.chip.noBaseline"),
      trend: directionTrend(delta, 0.2),
      tone,
      currentNum: recent,
      priorNum: baselineOk ? prior : null,
    })
  }

  // ---- Sleep (higher is better) ----
  {
    const recent = mean(present(sleepHours, currentIdx))
    const prior = useExternalPrior ? mean(priorSleepVals) : mean(present(sleepHours, priorIdx))
    const delta = baselineOk && recent != null && prior != null ? recent - prior : null
    let tone: SignalTone = "neutral"
    if (recent != null) {
      if (recent < 5.5 || (delta != null && delta <= -1.0)) tone = "danger"
      else if (recent < 6.5 || (delta != null && delta <= -0.5)) tone = "warning"
      else if (recent >= 7) tone = "good"
    }
    signals.push({
      key: "sleep",
      label: t("practitioner.wellbeing.chip.sleep"),
      value: recent != null ? `${fmt1(recent)}h` : "—",
      priorValue:
        baselineOk && prior != null
          ? t("practitioner.wellbeing.chip.was", { value: `${fmt1(prior)}h` })
          : t("practitioner.wellbeing.chip.noBaseline"),
      trend: directionTrend(delta, 0.2),
      tone,
      currentNum: recent,
      priorNum: baselineOk ? prior : null,
    })
  }

  // ---- Adherence (higher is better), percent of logged days med was taken ----
  {
    const recentDays = currentIdx.filter((i) => mood[i] != null)
    const priorDays = priorIdx.filter((i) => mood[i] != null)
    const pct = (idx: number[]) =>
      idx.length ? Math.round((idx.filter((i) => !doseMissed[i]).length / idx.length) * 100) : null
    const recent = pct(recentDays)
    const prior = useExternalPrior ? priorAdherencePct : pct(priorDays)
    const delta = baselineOk && recent != null && prior != null ? recent - prior : null
    let tone: SignalTone = "neutral"
    if (recent != null) {
      if (recent < 70) tone = "danger"
      else if (recent < 90) tone = "warning"
      else if (recent >= 95) tone = "good"
    }
    signals.push({
      key: "adherence",
      label: t("practitioner.wellbeing.chip.adherence"),
      value: recent != null ? `${recent}%` : "—",
      priorValue:
        baselineOk && prior != null
          ? t("practitioner.wellbeing.chip.was", { value: `${prior}%` })
          : t("practitioner.wellbeing.chip.noBaseline"),
      trend: directionTrend(delta, 3),
      tone,
      currentNum: recent,
      priorNum: baselineOk ? prior : null,
    })
  }

  // ---------------- Flags ----------------
  const flags: ClinicalFlag[] = []

  // Sleep below 6h on n of last 14 nights (fires n >= 5)
  {
    const n = sleepHours.filter((h) => h != null && (h as number) < 6).length
    if (n >= 5) {
      flags.push({
        icon: "moon-off",
        tone: "warning",
        text: t("practitioner.wellbeing.flag.sleep", { count: n, total: windowDays }),
      })
    }
  }

  // Anxiety >= 7 on n consecutive days (fires on any run >= 3) — longest run
  {
    let best = { len: 0, start: -1, end: -1 }
    let runStart = -1
    for (let i = 0; i <= anxiety.length; i++) {
      const hit = i < anxiety.length && anxiety[i] != null && (anxiety[i] as number) >= 7
      if (hit) {
        if (runStart === -1) runStart = i
      } else if (runStart !== -1) {
        const len = i - runStart
        if (len >= best.len) best = { len, start: runStart, end: i - 1 }
        runStart = -1
      }
    }
    if (best.len >= 3) {
      flags.push({
        icon: "alert-triangle",
        tone: "danger",
        text: t("practitioner.wellbeing.flag.anxiety", {
          count: best.len,
          start: fmtDate(dates[best.start]),
          end: fmtDate(dates[best.end]),
        }),
      })
    }
  }

  // Mood <= 3 on n days in the last week (fires n >= 2)
  {
    const n = recentIdx.filter((i) => mood[i] != null && (mood[i] as number) <= 3).length
    if (n >= 2) {
      flags.push({
        icon: "mood-sad",
        tone: "danger",
        text: t("practitioner.wellbeing.flag.mood", { count: n }),
      })
    }
  }

  // n doses missed, clustered {ranges} (fires n >= 2)
  {
    const missedIdx = dates.map((_, i) => i).filter((i) => mood[i] != null && doseMissed[i])
    const n = missedIdx.length
    if (n >= 2) {
      // A cluster = missed days each within 3 days of the next.
      const clusters: number[][] = []
      let cur: number[] = []
      for (const idx of missedIdx) {
        if (cur.length === 0 || idx - cur[cur.length - 1] <= 3) cur.push(idx)
        else {
          clusters.push(cur)
          cur = [idx]
        }
      }
      if (cur.length) clusters.push(cur)
      const multiDayClusters = clusters.filter((c) => c.length >= 2)
      if (multiDayClusters.length > 0) {
        const ranges = multiDayClusters
          .map((c) => `${fmtDate(dates[c[0]])}–${fmtDate(dates[c[c.length - 1]])}`)
          .join(", ")
        flags.push({
          icon: "pill",
          tone: "warning",
          text: t("practitioner.wellbeing.flag.adherenceClustered", { count: n, ranges }),
        })
      } else {
        flags.push({
          icon: "pill",
          tone: "warning",
          text: t("practitioner.wellbeing.flag.adherence", { count: n }),
        })
      }
    }
  }

  // No entries for n consecutive days (fires on any gap >= 3) — longest gap
  {
    let best = { len: 0, start: -1, end: -1 }
    let runStart = -1
    for (let i = 0; i <= mood.length; i++) {
      const isGap = i < mood.length && mood[i] == null
      if (isGap) {
        if (runStart === -1) runStart = i
      } else if (runStart !== -1) {
        const len = i - runStart
        if (len >= best.len) best = { len, start: runStart, end: i - 1 }
        runStart = -1
      }
    }
    if (best.len >= 3) {
      flags.push({
        icon: "calendar-off",
        tone: "warning",
        text: t("practitioner.wellbeing.flag.dataGap", {
          count: best.len,
          start: fmtDate(dates[best.start]),
          end: fmtDate(dates[best.end]),
        }),
      })
    }
  }

  // Journal keywords: top 3, always shown if journal text exists (neutral)
  {
    const texts: string[] = []
    for (const i of dates.map((_, idx) => idx)) {
      const e = byDay.get(dates[i])
      if (e) {
        if (e.challenges) texts.push(String(e.challenges))
        if (e.achievements) texts.push(String(e.achievements))
      }
    }
    const kws = topKeywords(texts, 3)
    if (kws.length > 0) {
      const rendered = kws.map((k) => `${k.word} ×${k.count}`).join(", ")
      flags.push({
        icon: "notes",
        tone: "neutral",
        text: t("practitioner.wellbeing.flag.journal", { keywords: rendered }),
      })
    }
  }

  flags.sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone])

  if (flags.length === 0) {
    flags.push({
      icon: "circle-check",
      tone: "neutral",
      text: t("practitioner.wellbeing.flag.none"),
    })
  }

  return {
    windowDays,
    daysLogged,
    daysTotal,
    hasAnyData,
    isThin,
    signals,
    flags,
    series: { dates, mood, anxiety, sleepHours, doseMissed },
  }
}
