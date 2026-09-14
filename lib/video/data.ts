// Data layer for video teleconsultation (meet.jit.si, no dedicated server for
// v1 — see app/consultations/[id]/live). No RLS on this stack: every query
// here that returns a row to a caller is scoped to "practitioner_id = userId
// OR patient_id = userId" so a mismatched id can never surface someone else's
// consultation. Routes must still call the assert/lookup helpers below rather
// than trusting a practitionerId/patientId sent in a request body.

import { getSql } from "@/lib/db"

type Sql = ReturnType<typeof getSql>

export type VideoConsultationMode = "urgent" | "scheduled"
export type VideoConsultationStatus = "pending" | "active" | "completed" | "cancelled" | "no_show"

export type VideoConsultation = {
  id: string
  practitionerId: number
  patientId: number
  roomName: string
  mode: VideoConsultationMode
  scheduledAt: string | null
  status: VideoConsultationStatus
  practitionerReason: string | null
  startedAt: string | null
  endedAt: string | null
  durationSeconds: number | null
  practitionerJoined: boolean
  patientJoined: boolean
  patientConsentAt: string | null
  consentVersion: string | null
  createdAt: string
}

export const CONSENT_VERSION = "v1-2025-01"

// Once a scheduled call is this close, the patient dashboard promotes its
// discreet card to the same prominent, joinable treatment as an urgent call.
export const SCHEDULED_JOIN_WINDOW_MS = 15 * 60 * 1000

function mapRow(r: Record<string, unknown>): VideoConsultation {
  return {
    id: String(r.id),
    practitionerId: Number(r.practitioner_id),
    patientId: Number(r.patient_id),
    roomName: String(r.room_name),
    mode: r.mode as VideoConsultationMode,
    scheduledAt: r.scheduled_at ? new Date(String(r.scheduled_at)).toISOString() : null,
    status: r.status as VideoConsultationStatus,
    practitionerReason: r.practitioner_reason == null ? null : String(r.practitioner_reason),
    startedAt: r.started_at ? new Date(String(r.started_at)).toISOString() : null,
    endedAt: r.ended_at ? new Date(String(r.ended_at)).toISOString() : null,
    durationSeconds: r.duration_seconds == null ? null : Number(r.duration_seconds),
    practitionerJoined: Boolean(r.practitioner_joined),
    patientJoined: Boolean(r.patient_joined),
    patientConsentAt: r.patient_consent_at ? new Date(String(r.patient_consent_at)).toISOString() : null,
    consentVersion: r.consent_version == null ? null : String(r.consent_version),
    createdAt: new Date(String(r.created_at)).toISOString(),
  }
}

/** True when this practitioner is linked to this patient (the same ownership check used everywhere else in the app). */
export async function practitionerOwnsPatient(sql: Sql, practitionerId: number, patientId: number): Promise<boolean> {
  const rows = (await sql`
    SELECT 1 FROM patients WHERE user_id = ${patientId} AND practitioner_id = ${practitionerId}
  `) as unknown[]
  return rows.length > 0
}

/**
 * Fetch a consultation ONLY if userId is one of its two participants. This is
 * the single authorization primitive for every video route and for
 * /consultations/[id]/live — a mismatched id yields null, never someone
 * else's row, regardless of what the caller claims to be.
 */
export async function getConsultationForParticipant(sql: Sql, id: string, userId: number): Promise<VideoConsultation | null> {
  const rows = (await sql`
    SELECT * FROM video_consultations
    WHERE id = ${id} AND (practitioner_id = ${userId} OR patient_id = ${userId})
    LIMIT 1
  `) as Record<string, unknown>[]
  return rows[0] ? mapRow(rows[0]) : null
}

export async function createUrgentConsultation(
  sql: Sql,
  params: { practitionerId: number; patientId: number; reason: string | null },
): Promise<VideoConsultation> {
  const rows = (await sql`
    INSERT INTO video_consultations (practitioner_id, patient_id, mode, status, practitioner_reason)
    VALUES (${params.practitionerId}, ${params.patientId}, 'urgent', 'pending', ${params.reason})
    RETURNING *
  `) as Record<string, unknown>[]
  return mapRow(rows[0])
}

export async function createScheduledConsultation(
  sql: Sql,
  params: { practitionerId: number; patientId: number; scheduledAtIso: string },
): Promise<VideoConsultation> {
  const rows = (await sql`
    INSERT INTO video_consultations (practitioner_id, patient_id, mode, status, scheduled_at)
    VALUES (${params.practitionerId}, ${params.patientId}, 'scheduled', 'pending', ${params.scheduledAtIso}::timestamptz)
    RETURNING *
  `) as Record<string, unknown>[]
  return mapRow(rows[0])
}

export type PatientFacingConsultation = Omit<VideoConsultation, "practitionerReason"> & {
  practitionerName: string
}

// practitioner_reason is a clinical note "never shared with the patient" per
// spec — stripped here so it structurally cannot leak through this shape,
// rather than relying on every call site to remember to omit it.
function toPatientFacing(v: VideoConsultation, practitionerName: string): PatientFacingConsultation {
  const { practitionerReason: _practitionerReason, ...rest } = v
  return { ...rest, practitionerName }
}

export type PendingForPatient = {
  /** The single call the dashboard should show prominently right now, if any. */
  prominent: PatientFacingConsultation | null
  /** Scheduled calls further out — discreet card only. */
  upcoming: PatientFacingConsultation[]
}

/**
 * Everything the patient dashboard's poll needs, in one query.
 *
 * The two time windows in the WHERE clause are what make the banner
 * disappear on its own. Nothing else ever clears a row: an unanswered call
 * stays 'pending' forever, so without them a single stale test row sat at
 * the top of the dashboard indefinitely AND — because the loop below fills
 * the prominent slot once — hid every newer call behind it.
 *
 * - urgent: visible for 5 minutes after creation. A call nobody picked up in
 *   that time is over in practice, whatever the row still says.
 * - scheduled: visible only while its appointment is still ahead. Note this
 *   means a scheduled call vanishes at its start time, late arrivals
 *   included — say the word if you want a grace period after scheduled_at.
 *
 * 'active' is kept for scheduled (not just 'pending', which is what the
 * literal rule said): once the practitioner has joined, the row flips to
 * 'active', and that is exactly the moment the patient most needs the card.
 */
export async function getPendingForPatient(sql: Sql, patientId: number): Promise<PendingForPatient> {
  const rows = (await sql`
    SELECT vc.*, u.name AS practitioner_name
    FROM video_consultations vc
    JOIN users u ON u.id = vc.practitioner_id
    WHERE vc.patient_id = ${patientId}
      AND (
        (
          vc.mode = 'urgent'
          AND vc.status IN ('pending', 'active')
          AND vc.created_at > NOW() - INTERVAL '5 minutes'
        )
        OR
        (
          vc.mode = 'scheduled'
          AND vc.status IN ('pending', 'active')
          AND vc.scheduled_at > NOW()
        )
      )
    ORDER BY (vc.mode = 'urgent') DESC, vc.scheduled_at ASC NULLS FIRST, vc.created_at DESC
  `) as Record<string, unknown>[]

  const now = Date.now()
  let prominent: PatientFacingConsultation | null = null
  const upcoming: PatientFacingConsultation[] = []

  for (const r of rows) {
    const consultation = toPatientFacing(mapRow(r), String(r.practitioner_name))
    if (consultation.mode === "urgent") {
      // created_at DESC above means the first urgent row here is the most
      // recent one. A second simultaneous urgent call is deliberately not
      // shown: two "answer me now" banners at once would be worse than one.
      if (!prominent) prominent = consultation
      continue
    }
    // scheduled
    const scheduledAtMs = consultation.scheduledAt ? new Date(consultation.scheduledAt).getTime() : null
    const withinJoinWindow = scheduledAtMs != null && scheduledAtMs - now <= SCHEDULED_JOIN_WINDOW_MS
    if (withinJoinWindow && !prominent) {
      prominent = consultation
    } else {
      upcoming.push(consultation)
    }
  }

  return { prominent, upcoming }
}

type Role = "practitioner" | "patient"

/**
 * Mark one participant as joined. First arrival flips a still-pending call to
 * 'active' and stamps started_at. For the patient, this is also where
 * per-call consent is recorded (the client only calls this after the
 * consent dialog is accepted) — patient_consent_at/consent_version are set
 * once and never overwritten by a later join.
 */
export async function markJoined(sql: Sql, id: string, role: Role): Promise<VideoConsultation | null> {
  const rows =
    role === "practitioner"
      ? ((await sql`
          UPDATE video_consultations
          SET practitioner_joined = true,
              started_at = CASE WHEN status = 'pending' THEN NOW() ELSE started_at END,
              status = CASE WHEN status = 'pending' THEN 'active' ELSE status END
          WHERE id = ${id}
          RETURNING *
        `) as Record<string, unknown>[])
      : ((await sql`
          UPDATE video_consultations
          SET patient_joined = true,
              patient_consent_at = COALESCE(patient_consent_at, NOW()),
              consent_version = COALESCE(consent_version, ${CONSENT_VERSION}),
              started_at = CASE WHEN status = 'pending' THEN NOW() ELSE started_at END,
              status = CASE WHEN status = 'pending' THEN 'active' ELSE status END
          WHERE id = ${id}
          RETURNING *
        `) as Record<string, unknown>[])
  return rows[0] ? mapRow(rows[0]) : null
}

/**
 * Either participant leaving ends the call for both — this is a 1:1
 * consultation, not a multi-party room. No-ops (0 rows) if the call was
 * never active (still pending) or already finished/cancelled, so it's safe
 * to call from a "beforeunload"-style handler without checking state first.
 */
export async function markLeft(sql: Sql, id: string): Promise<VideoConsultation | null> {
  const rows = (await sql`
    UPDATE video_consultations
    SET status = 'completed',
        ended_at = NOW(),
        duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (NOW() - started_at))::int)
    WHERE id = ${id} AND status = 'active'
    RETURNING *
  `) as Record<string, unknown>[]
  return rows[0] ? mapRow(rows[0]) : null
}

/** Cancel a call that never started — either side, only while still 'pending'. */
export async function cancelConsultation(sql: Sql, id: string): Promise<VideoConsultation | null> {
  const rows = (await sql`
    UPDATE video_consultations
    SET status = 'cancelled'
    WHERE id = ${id} AND status = 'pending'
    RETURNING *
  `) as Record<string, unknown>[]
  return rows[0] ? mapRow(rows[0]) : null
}

/** Practitioner-side history list for a patient's detail page (Phase 6). */
export async function getConsultationHistory(sql: Sql, patientId: number, practitionerId: number): Promise<VideoConsultation[]> {
  const rows = (await sql`
    SELECT * FROM video_consultations
    WHERE patient_id = ${patientId} AND practitioner_id = ${practitionerId}
    ORDER BY COALESCE(scheduled_at, created_at) DESC
  `) as Record<string, unknown>[]
  return rows.map(mapRow)
}
