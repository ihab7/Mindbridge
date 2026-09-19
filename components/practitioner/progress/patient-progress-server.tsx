import { getSql } from "@/lib/db"
import { getServerI18n } from "@/lib/server-i18n"
import { parseSideEffectsFromDb } from "@/lib/side-effects"
import { findLibrarySession } from "@/lib/program/sessionLibrary"
import { DAYS_LOADED, type ProgressInput } from "@/lib/wellbeing/progressModel"
import { PatientProgress } from "./patient-progress"

// Server half of the practitioner "patient progress" section. Loads the last
// 60 clinic days (the longest selectable period, 30 days, plus the 30 before
// it for the comparison) in three reads — check-ins, breathing sessions and
// program sessions — and hands plain data to the client component. The page
// has already verified that this patient is linked to the practitioner.
//
// Days are the clinic's own calendar days (Africa/Tunis): journal_entries
// .entry_date for check-ins, completed_at converted the same way for
// activities, and "today" from the database clock, so server and browser can
// never disagree about which day an entry belongs to.
export async function PatientProgressServer({ patientId, messageHref }: { patientId: number; messageHref: string }) {
  const sql = getSql()
  const { locale } = await getServerI18n()
  const since = `${DAYS_LOADED + 1} days`

  const [todayRes, entryRes, breathingRes, programRes] = await Promise.all([
    sql`SELECT ((now() AT TIME ZONE 'Africa/Tunis')::date)::text AS today`,
    sql`
      SELECT entry_date::text AS date, mood, anxiety, sleep_hours::float8 AS sleep_hours, medication_taken,
             side_effects, side_effects_other, side_effects_legacy, challenges, achievements,
             to_char(updated_at AT TIME ZONE 'Africa/Tunis', 'HH24:MI') AS check_in_time
      FROM journal_entries
      WHERE patient_id = ${patientId}
        AND entry_date > ((now() AT TIME ZONE 'Africa/Tunis')::date - ${DAYS_LOADED}::int)
      ORDER BY entry_date ASC
    `,
    sql`
      SELECT ((completed_at AT TIME ZONE 'Africa/Tunis')::date)::text AS date, exercise_type, duration_seconds, rating
      FROM breathing_sessions
      WHERE patient_id = ${patientId} AND completed_at >= NOW() - ${since}::interval
      ORDER BY completed_at ASC
    `,
    sql`
      SELECT ((sp.completed_at AT TIME ZONE 'Africa/Tunis')::date)::text AS date, sp.session_id, sp.mood_before, sp.mood_after
      FROM session_progress sp
      JOIN program_assignments pa ON pa.id = sp.assignment_id
      WHERE pa.patient_id = ${patientId} AND sp.completed_at IS NOT NULL AND sp.completed_at >= NOW() - ${since}::interval
      ORDER BY sp.completed_at ASC
    `,
  ])
  const todayRows = todayRes as unknown as { today: string }[]
  const entryRows = entryRes as unknown as Record<string, unknown>[]
  const breathingRows = breathingRes as unknown as Record<string, unknown>[]
  const programRows = programRes as unknown as Record<string, unknown>[]

  const numOrNull = (v: unknown) => (v == null ? null : Number(v))
  const textOrNull = (v: unknown) => (v == null || String(v).trim() === "" ? null : String(v))

  const input: ProgressInput = {
    today: todayRows[0].today,
    entries: entryRows.map((r) => {
      const effects = parseSideEffectsFromDb(r.side_effects, r.side_effects_other, r.side_effects_legacy)
      return {
        date: String(r.date),
        mood: Number(r.mood),
        anxiety: Number(r.anxiety),
        sleepHours: numOrNull(r.sleep_hours),
        medicationTaken: Boolean(r.medication_taken),
        sideEffects: (effects.sideEffects ?? []).filter((k) => k !== "none"),
        sideEffectsOther: textOrNull(effects.sideEffectsOther),
        challenges: textOrNull(r.challenges),
        achievements: textOrNull(r.achievements),
        checkInTime: textOrNull(r.check_in_time),
      }
    }),
    breathing: breathingRows.map((r) => ({
      date: String(r.date),
      exerciseType: String(r.exercise_type),
      durationSeconds: Number(r.duration_seconds),
      rating: numOrNull(r.rating),
    })),
    program: programRows.map((r) => {
      const title = findLibrarySession(String(r.session_id))?.title
      return {
        date: String(r.date),
        // Resolved here so the (large) session library never ships to the browser.
        title: title ? (title[locale as keyof typeof title] ?? title.fr ?? null) : null,
        moodBefore: numOrNull(r.mood_before),
        moodAfter: numOrNull(r.mood_after),
      }
    }),
  }

  return <PatientProgress input={input} messageHref={messageHref} />
}
