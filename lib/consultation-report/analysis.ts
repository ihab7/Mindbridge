import { parseSideEffectsFromDb, sideEffectsKeyToLabel } from "@/lib/side-effects"
import type { BreathingSessionRow, JournalEntryRow } from "./types"

const POSITIVE_WORDS = [
  "calm", "calmer", "better", "improve", "improved", "improving", "optimistic",
  "happy", "happier", "relief", "relieved", "good", "great", "hopeful",
  "confident", "grateful", "proud", "relaxed", "stable",
]

const NEGATIVE_WORDS = [
  "stress", "stressed", "stressful", "anxious", "anxiety", "overwhelmed",
  "worried", "worry", "difficult", "hard", "tired", "exhausted", "sad",
  "down", "struggling", "frustrated", "panic", "low",
]

const STRESS_CATEGORIES: Record<string, string[]> = {
  work: ["work", "job", "boss", "deadline", "office", "career"],
  sleep: ["sleep", "insomnia", "tired", "exhausted", "night"],
  family: ["family", "parent", "spouse", "partner", "kids", "children"],
  social: ["social", "friend", "friends", "relationship", "isolat"],
  health: ["health", "pain", "medication", "physical"],
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function splitHalves<T>(items: T[]): { earlier: T[]; recent: T[] } {
  const mid = Math.ceil(items.length / 2)
  return { earlier: items.slice(0, mid), recent: items.slice(mid) }
}

function countKeywordHits(text: string, words: string[]): number {
  const lower = text.toLowerCase()
  return words.reduce((count, word) => (lower.includes(word) ? count + 1 : count), 0)
}

export type MoodStats = {
  entryCount: number
  currentAvg: number
  earlierAvg: number
  trend: "improving" | "declining" | "stable" | "insufficient"
  anxietyEpisodes: number
}

export type MedicationStats = {
  entryCount: number
  adherenceRate: number
  missedCount: number
  trend: "improving" | "declining" | "stable" | "insufficient"
}

export type SleepStats = {
  entryCount: number
  avgHours: number
  earlierAvgHours: number
  trend: "improving" | "declining" | "stable" | "insufficient"
}

export type MindfulnessStats = {
  breathingCount: number
  meditationCount: number
  totalMinutes: number
}

export type JournalStats = {
  positiveHits: number
  negativeHits: number
  dominantTheme: "positive" | "negative" | "mixed" | "insufficient"
  stressCategory: string | null
}

export type SideEffectStats = {
  frequency: { label: string; count: number }[]
  hasSevere: boolean
}

export type PatientAnalysis = {
  entries: JournalEntryRow[]
  mood: MoodStats
  medication: MedicationStats
  sleep: SleepStats
  mindfulness: MindfulnessStats
  journal: JournalStats
  sideEffects: SideEffectStats
}

function trendFromAverages(earlier: number, recent: number, threshold: number): "improving" | "declining" | "stable" | "insufficient" {
  const delta = recent - earlier
  if (Math.abs(delta) < threshold) return "stable"
  return delta > 0 ? "improving" : "declining"
}

function analyzeMood(entries: JournalEntryRow[]): MoodStats {
  if (entries.length === 0) {
    return { entryCount: 0, currentAvg: 0, earlierAvg: 0, trend: "insufficient", anxietyEpisodes: 0 }
  }

  const { earlier, recent } = splitHalves(entries)
  const earlierAvg = average(earlier.map((e) => Number(e.mood)))
  const recentAvg = average(recent.map((e) => Number(e.mood)))
  const anxietyEpisodes = entries.filter((e) => Number(e.anxiety) >= 7).length

  return {
    entryCount: entries.length,
    currentAvg: average(entries.map((e) => Number(e.mood))),
    earlierAvg,
    trend: entries.length < 4 ? "insufficient" : trendFromAverages(earlierAvg, recentAvg, 0.6),
    anxietyEpisodes,
  }
}

function analyzeMedication(entries: JournalEntryRow[]): MedicationStats {
  if (entries.length === 0) {
    return { entryCount: 0, adherenceRate: 0, missedCount: 0, trend: "insufficient" }
  }

  const takenCount = entries.filter((e) => e.medication_taken).length
  const missedCount = entries.length - takenCount
  const { earlier, recent } = splitHalves(entries)
  const earlierRate = earlier.length ? earlier.filter((e) => e.medication_taken).length / earlier.length : 0
  const recentRate = recent.length ? recent.filter((e) => e.medication_taken).length / recent.length : 0

  return {
    entryCount: entries.length,
    adherenceRate: Math.round((takenCount / entries.length) * 100),
    missedCount,
    trend: entries.length < 4 ? "insufficient" : trendFromAverages(earlierRate, recentRate, 0.1),
  }
}

function analyzeSleep(entries: JournalEntryRow[]): SleepStats {
  if (entries.length === 0) {
    return { entryCount: 0, avgHours: 0, earlierAvgHours: 0, trend: "insufficient" }
  }

  const { earlier, recent } = splitHalves(entries)
  const earlierAvg = average(earlier.map((e) => Number(e.sleep_hours)))
  const recentAvg = average(recent.map((e) => Number(e.sleep_hours)))

  return {
    entryCount: entries.length,
    avgHours: average(entries.map((e) => Number(e.sleep_hours))),
    earlierAvgHours: earlierAvg,
    trend: entries.length < 4 ? "insufficient" : trendFromAverages(earlierAvg, recentAvg, 0.4),
  }
}

function analyzeMindfulness(sessions: BreathingSessionRow[]): MindfulnessStats {
  const breathingTypes = new Set(["one_minute", "calm_down"])
  const breathingCount = sessions.filter((s) => breathingTypes.has(s.exercise_type)).length
  const meditationCount = sessions.length - breathingCount
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + Number(s.duration_seconds), 0) / 60)

  return { breathingCount, meditationCount, totalMinutes }
}

function analyzeJournal(entries: JournalEntryRow[]): JournalStats {
  const text = entries
    .map((e) => `${e.challenges ?? ""} ${e.achievements ?? ""}`)
    .join(" ")
    .trim()

  if (!text) {
    return { positiveHits: 0, negativeHits: 0, dominantTheme: "insufficient", stressCategory: null }
  }

  const positiveHits = countKeywordHits(text, POSITIVE_WORDS)
  const negativeHits = countKeywordHits(text, NEGATIVE_WORDS)

  let dominantTheme: JournalStats["dominantTheme"] = "mixed"
  if (positiveHits === 0 && negativeHits === 0) dominantTheme = "insufficient"
  else if (positiveHits > negativeHits) dominantTheme = "positive"
  else if (negativeHits > positiveHits) dominantTheme = "negative"

  let stressCategory: string | null = null
  let bestScore = 0
  for (const [category, keywords] of Object.entries(STRESS_CATEGORIES)) {
    const score = countKeywordHits(text, keywords)
    if (score > bestScore) {
      bestScore = score
      stressCategory = category
    }
  }

  return { positiveHits, negativeHits, dominantTheme, stressCategory }
}

function analyzeSideEffects(entries: JournalEntryRow[]): SideEffectStats {
  const counts = new Map<string, number>()

  for (const entry of entries) {
    const parsed = parseSideEffectsFromDb(entry.side_effects, entry.side_effects_other, entry.side_effects_legacy)
    for (const key of parsed.sideEffects) {
      if (key === "none") continue
      const label = key === "other" && parsed.sideEffectsOther?.trim()
        ? parsed.sideEffectsOther.trim()
        : sideEffectsKeyToLabel(key)
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
  }

  const frequency = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  const severeKeywords = ["anxiety increase", "dizziness"]
  const hasSevere = frequency.some((f) => severeKeywords.includes(f.label.toLowerCase()) && f.count >= 3)

  return { frequency, hasSevere }
}

export function analyzePatientData(
  entries: JournalEntryRow[],
  breathingSessions: BreathingSessionRow[]
): PatientAnalysis {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return {
    entries: sorted,
    mood: analyzeMood(sorted),
    medication: analyzeMedication(sorted),
    sleep: analyzeSleep(sorted),
    mindfulness: analyzeMindfulness(breathingSessions),
    journal: analyzeJournal(sorted),
    sideEffects: analyzeSideEffects(sorted),
  }
}
