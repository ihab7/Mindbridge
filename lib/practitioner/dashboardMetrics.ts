// Practitioner dashboard overview metrics. Each of the three non-trivial
// metrics (open alerts, critical mood, active tracking) is backed by an
// exported `get*PatientIds` function — the SAME function drives both the
// dashboard card's count and the patient-list filter, so a card showing "2"
// and the filtered list it links to can never disagree.

import { getSql } from "@/lib/db"

// Trailing lookback shared by "critical mood" and "active tracking": per
// spec, activeTracking uses an inclusive comparison against
// `current_date - 7` (today plus the 7 preceding days = an 8-day span).
// criticalMood's "last 7 days" window uses the same boundary for consistency
// between the two time-windowed cards.
const TRAILING_WINDOW_DAYS = 7

export type DashboardMetrics = {
  totalPatients: number
  openAlerts: number
  criticalMood: number
  activeTracking: number
  activeTrackingTotal: number // == totalPatients, for the "6/7" display
}

/** Patients (of this practitioner) with at least one 'open' alert. */
export async function getOpenAlertPatientIds(practitionerId: string): Promise<string[]> {
  const sql = getSql()
  const pid = Number(practitionerId)
  const rows = (await sql`
    SELECT DISTINCT a.patient_id
    FROM alerts a
    JOIN patients p ON p.user_id = a.patient_id
    WHERE p.practitioner_id = ${pid} AND a.status = 'open'
  `) as Record<string, unknown>[]
  return rows.map((r) => String(r.patient_id))
}

/** Patients with at least one journal entry (mood/anxiety/sleep/journal are
 *  all columns on the same row) in the trailing window. */
export async function getActiveTrackingPatientIds(practitionerId: string): Promise<string[]> {
  const sql = getSql()
  const pid = Number(practitionerId)
  const rows = (await sql`
    SELECT DISTINCT p.user_id AS patient_id
    FROM patients p
    JOIN journal_entries j ON j.patient_id = p.user_id
    WHERE p.practitioner_id = ${pid}
      AND j.created_at::date >= current_date - ${TRAILING_WINDOW_DAYS}::int
  `) as Record<string, unknown>[]
  return rows.map((r) => String(r.patient_id))
}

/**
 * Patients with >= 3 CONSECUTIVE calendar days (within the trailing window)
 * where mood <= 3 OR anxiety >= 7. A patient can qualify on either signal,
 * or both, and is counted once either way.
 *
 * Multiple same-day entries are deduped to the latest one per day (same
 * convention as lib/wellbeing/clinicalSummary.ts). "Consecutive" is real
 * adjacent calendar dates, not just 3 qualifying entries anywhere in the
 * window — detected via the standard gaps-and-islands technique: within a
 * per-patient, date-ordered sequence of qualifying days, `day - ROW_NUMBER()`
 * is constant exactly across a run of truly adjacent dates, and shifts the
 * instant a day is skipped (missing entry) or fails the threshold.
 */
export async function getCriticalMoodPatientIds(practitionerId: string): Promise<string[]> {
  const sql = getSql()
  const pid = Number(practitionerId)
  const rows = (await sql`
    WITH daily AS (
      SELECT DISTINCT ON (j.patient_id, j.created_at::date)
        j.patient_id, j.created_at::date AS day, j.mood, j.anxiety
      FROM journal_entries j
      JOIN patients p ON p.user_id = j.patient_id
      WHERE p.practitioner_id = ${pid}
        AND j.created_at::date >= current_date - ${TRAILING_WINDOW_DAYS}::int
      ORDER BY j.patient_id, j.created_at::date, j.created_at DESC
    ),
    mood_bad AS (
      SELECT patient_id, day,
        day - (ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY day))::int AS grp
      FROM daily WHERE mood <= 3
    ),
    anxiety_bad AS (
      SELECT patient_id, day,
        day - (ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY day))::int AS grp
      FROM daily WHERE anxiety >= 7
    ),
    mood_streak AS (
      SELECT patient_id FROM mood_bad GROUP BY patient_id, grp HAVING COUNT(*) >= 3
    ),
    anxiety_streak AS (
      SELECT patient_id FROM anxiety_bad GROUP BY patient_id, grp HAVING COUNT(*) >= 3
    )
    SELECT DISTINCT patient_id FROM (
      SELECT patient_id FROM mood_streak
      UNION ALL
      SELECT patient_id FROM anxiety_streak
    ) combined
  `) as Record<string, unknown>[]
  return rows.map((r) => String(r.patient_id))
}

export async function computeDashboardMetrics(practitionerId: string): Promise<DashboardMetrics> {
  const sql = getSql()
  const pid = Number(practitionerId)

  const [totalRows, openAlertIds, criticalIds, activeIds] = await Promise.all([
    sql`SELECT count(*)::int AS n FROM patients WHERE practitioner_id = ${pid}` as Promise<Record<string, unknown>[]>,
    getOpenAlertPatientIds(practitionerId),
    getCriticalMoodPatientIds(practitionerId),
    getActiveTrackingPatientIds(practitionerId),
  ])

  const totalPatients = Number((totalRows[0] as Record<string, unknown> | undefined)?.n ?? 0)

  return {
    totalPatients,
    openAlerts: openAlertIds.length,
    criticalMood: criticalIds.length,
    activeTracking: activeIds.length,
    activeTrackingTotal: totalPatients,
  }
}
