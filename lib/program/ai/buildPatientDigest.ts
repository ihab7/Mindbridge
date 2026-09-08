import { getSql } from "@/lib/db"
import { topKeywords } from "@/lib/text/keywords"

const WINDOW_DAYS = 30

export type Trend = "up" | "down" | "flat" | null

export type PatientDigest = {
  windowDays: number
  anxiety: { avg: number | null; trend: Trend; peakDayOfWeek: string | null; sampleCount: number }
  mood: { avg: number | null; trend: Trend; sampleCount: number }
  sleep: { avgHours: number | null; poorNights: number; trend: Trend; sampleCount: number }
  medication: { adherencePct: number | null; missedDays: number }
  sideEffects: { name: string; count: number }[]
  journal: { entryCount: number; topKeywords: { word: string; count: number }[] }
  sessionPrep: { discussTopics: string[]; questions: string[] }
  history: { hasCompletedProgram: boolean; lastProgramId: string | null; completedSessionIds: string[] }
  signals: string[]
}

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const

function avg(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
}

/** Compares the average of the earlier half of a date-ordered series against
 *  the later half — same directional-trend approach used for mood in
 *  `lib/program/progress.ts`, applied here to raw journal entries. */
function trendOf(chronological: number[]): Trend {
  if (chronological.length < 4) return null
  const mid = Math.ceil(chronological.length / 2)
  const firstHalf = chronological.slice(0, mid)
  const secondHalf = chronological.slice(mid)
  const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length
  const diff = secondAvg - firstAvg
  if (diff > 0.4) return "up"
  if (diff < -0.4) return "down"
  return "flat"
}

function peakDayOfWeek(rows: { created_at: string; anxiety: number }[]): string | null {
  if (rows.length < 7) return null
  const sums = new Array(7).fill(0)
  const counts = new Array(7).fill(0)
  for (const row of rows) {
    const day = new Date(row.created_at).getDay()
    sums[day] += row.anxiety
    counts[day] += 1
  }
  let bestDay = -1
  let bestAvg = -Infinity
  for (let day = 0; day < 7; day++) {
    if (counts[day] === 0) continue
    const dayAvg = sums[day] / counts[day]
    if (dayAvg > bestAvg) {
      bestAvg = dayAvg
      bestDay = day
    }
  }
  return bestDay === -1 ? null : DAY_NAMES[bestDay]
}

function deriveSignals(digest: Omit<PatientDigest, "signals">): string[] {
  const signals = new Set<string>()

  if (digest.anxiety.avg != null && digest.anxiety.avg >= 7) signals.add("high_anxiety")
  if (digest.anxiety.avg != null && digest.anxiety.avg <= 3) signals.add("low_anxiety")
  if (digest.anxiety.trend === "up") signals.add("worsening_anxiety")

  if (digest.sleep.avgHours != null && digest.sleep.avgHours < 6) signals.add("low_sleep")
  if (digest.sleep.poorNights > 15) signals.add("poor_sleep_quality")

  if (digest.medication.adherencePct != null && digest.medication.adherencePct < 80) signals.add("poor_adherence")
  if (digest.medication.adherencePct != null && digest.medication.adherencePct >= 90) signals.add("good_adherence")

  if (digest.sideEffects.length > 0) signals.add("has_side_effects")

  const allKeywords = new Set([
    ...digest.journal.topKeywords.map((k) => k.word),
    ...digest.sessionPrep.discussTopics,
    ...digest.sessionPrep.questions,
  ])
  const hasAny = (...terms: string[]) => terms.some((t) => allKeywords.has(t))
  if (hasAny("work", "boss", "meeting", "travail", "patron", "réunion", "عمل", "مدير", "اجتماع")) signals.add("work_stress")
  if (hasAny("sleep", "tired", "sommeil", "fatigué", "fatigue", "نوم", "متعب")) signals.add("sleep_concern")
  if (hasAny("alone", "friends", "seul", "amis", "وحيد", "أصدقاء")) signals.add("social_concern")

  if (!digest.history.hasCompletedProgram && digest.history.completedSessionIds.length === 0) {
    signals.add("first_program")
  }

  if (digest.anxiety.peakDayOfWeek === "sunday" || digest.anxiety.peakDayOfWeek === "monday") {
    signals.add("anticipatory_anxiety")
  }

  return [...signals]
}

/**
 * Aggregates a patient's last 30 days of tracked data into a digest for AI
 * care-plan drafting. PRIVACY: the returned object contains only aggregates,
 * counts, and extracted keywords — never raw journal text, reflection
 * answers, names, emails, or dates of birth. See buildPatientDigest.test
 * (Phase 9) for the assertion that enforces this.
 */
export async function buildPatientDigest(patientId: number): Promise<PatientDigest> {
  const sql = getSql()

  const [journalRawRows, sessionPrepRawRows, assignmentRawRows] = (await Promise.all([
    sql`
      SELECT mood, anxiety, sleep_hours, medication_taken, side_effects, challenges, achievements, created_at
      FROM journal_entries
      WHERE patient_id = ${patientId}
        AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at ASC
    `,
    sql`
      SELECT topics_to_discuss, questions_for_therapist, recent_concerns
      FROM session_prep
      WHERE patient_id = ${patientId}
      LIMIT 1
    `,
    sql`
      SELECT id, program_id, status, assigned_at
      FROM program_assignments
      WHERE patient_id = ${patientId}
      ORDER BY assigned_at DESC
    `,
  ])) as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[]]

  const journalRows = journalRawRows.map((r) => ({
    mood: Number(r.mood),
    anxiety: Number(r.anxiety),
    sleep_hours: Number(r.sleep_hours),
    medication_taken: Boolean(r.medication_taken),
    side_effects: Array.isArray(r.side_effects) ? (r.side_effects as string[]) : [],
    challenges: r.challenges == null ? "" : String(r.challenges),
    achievements: r.achievements == null ? "" : String(r.achievements),
    created_at: String(r.created_at),
  }))

  const sessionPrepRows = sessionPrepRawRows.map((r) => ({
    topics_to_discuss: r.topics_to_discuss == null ? "" : String(r.topics_to_discuss),
    questions_for_therapist: r.questions_for_therapist == null ? "" : String(r.questions_for_therapist),
    recent_concerns: r.recent_concerns == null ? "" : String(r.recent_concerns),
  }))

  const assignmentRows = assignmentRawRows.map((r) => ({
    id: String(r.id),
    program_id: String(r.program_id),
    status: String(r.status),
    assigned_at: String(r.assigned_at),
  }))

  const completedSessionIds = assignmentRows.length
    ? (
        ((await sql`
          SELECT DISTINCT session_id
          FROM session_progress
          WHERE assignment_id = ANY(${assignmentRows.map((a) => a.id)})
        `) as Record<string, unknown>[])
      ).map((r) => String(r.session_id))
    : []

  const anxietyValues = journalRows.map((r) => r.anxiety)
  const moodValues = journalRows.map((r) => r.mood)
  const sleepValues = journalRows.map((r) => r.sleep_hours)

  const anxiety = {
    avg: avg(anxietyValues),
    trend: trendOf(anxietyValues),
    peakDayOfWeek: peakDayOfWeek(journalRows.map((r) => ({ created_at: r.created_at, anxiety: r.anxiety }))),
    sampleCount: journalRows.length,
  }

  const mood = {
    avg: avg(moodValues),
    trend: trendOf(moodValues),
    sampleCount: journalRows.length,
  }

  const sleep = {
    avgHours: avg(sleepValues),
    poorNights: sleepValues.filter((h) => h < 6).length,
    trend: trendOf(sleepValues),
    sampleCount: journalRows.length,
  }

  const medicationTakenCount = journalRows.filter((r) => r.medication_taken).length
  const medication = {
    adherencePct: journalRows.length ? Math.round((medicationTakenCount / journalRows.length) * 100) : null,
    missedDays: journalRows.filter((r) => !r.medication_taken).length,
  }

  const sideEffectCounts = new Map<string, number>()
  for (const row of journalRows) {
    for (const effect of row.side_effects ?? []) {
      if (!effect || effect === "none") continue
      sideEffectCounts.set(effect, (sideEffectCounts.get(effect) ?? 0) + 1)
    }
  }
  const sideEffects = [...sideEffectCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const freeText = journalRows.flatMap((r) => [r.challenges ?? "", r.achievements ?? ""])
  const prep = sessionPrepRows[0]
  const prepText = prep ? [prep.topics_to_discuss ?? "", prep.recent_concerns ?? "", prep.questions_for_therapist ?? ""] : []
  const journal = {
    entryCount: journalRows.length,
    topKeywords: topKeywords([...freeText, ...prepText], 8),
  }

  const sessionPrep = {
    discussTopics: prep ? topKeywords([prep.topics_to_discuss ?? "", prep.recent_concerns ?? ""], 5).map((k) => k.word) : [],
    questions: prep ? topKeywords([prep.questions_for_therapist ?? ""], 5).map((k) => k.word) : [],
  }

  const lastAssignment = assignmentRows[0] ?? null
  const history = {
    hasCompletedProgram: assignmentRows.some((a) => a.status === "completed"),
    lastProgramId: lastAssignment?.program_id ?? null,
    completedSessionIds,
  }

  const digestWithoutSignals = { windowDays: WINDOW_DAYS, anxiety, mood, sleep, medication, sideEffects, journal, sessionPrep, history }

  return { ...digestWithoutSignals, signals: deriveSignals(digestWithoutSignals) }
}
