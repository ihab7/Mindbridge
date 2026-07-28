import { getSql } from "@/lib/db"
import { ANXIETY_PROGRAM } from "./content"
import { completedCount, hasCompletedToday } from "./progress"
import type { ProgramAssignment, ProgramAssignmentWithProgress, SessionProgressEntry } from "./types"

function mapAssignment(row: Record<string, unknown>): ProgramAssignment {
  return {
    id: String(row.id),
    programId: String(row.program_id),
    patientId: Number(row.patient_id),
    practitionerId: Number(row.practitioner_id),
    practitionerNote: String(row.practitioner_note ?? ""),
    status: row.status === "completed" ? "completed" : "active",
    assignedAt: new Date(row.assigned_at as string).toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at as string).toISOString() : null,
  }
}

function mapProgress(row: Record<string, unknown>): SessionProgressEntry {
  return {
    sessionId: String(row.session_id),
    moodBefore: row.mood_before == null ? null : Number(row.mood_before),
    moodAfter: row.mood_after == null ? null : Number(row.mood_after),
    reflectionAnswer: String(row.reflection_answer ?? ""),
    selectedTriggers: Array.isArray(row.selected_triggers) ? (row.selected_triggers as string[]) : [],
    completedAt: new Date(row.completed_at as string).toISOString(),
  }
}

export async function getActiveAssignmentForPatient(patientId: number): Promise<ProgramAssignment | null> {
  const sql = getSql()
  const rows = (await sql`
    SELECT * FROM program_assignments
    WHERE patient_id = ${patientId} AND status = 'active'
    ORDER BY assigned_at DESC
    LIMIT 1
  `) as Record<string, unknown>[]
  return rows.length > 0 ? mapAssignment(rows[0]) : null
}

export async function getProgressForAssignment(assignmentId: string): Promise<SessionProgressEntry[]> {
  const sql = getSql()
  const rows = (await sql`
    SELECT * FROM session_progress
    WHERE assignment_id = ${assignmentId}
    ORDER BY completed_at ASC
  `) as Record<string, unknown>[]
  return rows.map(mapProgress)
}

async function getPractitionerName(practitionerId: number): Promise<string> {
  const sql = getSql()
  const rows = (await sql`SELECT name FROM users WHERE id = ${practitionerId}`) as Array<{ name: string }>
  return rows[0]?.name ?? ""
}

/** The active (or most recently completed) assignment for a patient, with full progress and
 *  the practitioner's name resolved — the shape the patient-facing program page needs. */
export async function getAssignmentWithProgress(patientId: number): Promise<ProgramAssignmentWithProgress | null> {
  const sql = getSql()
  const rows = (await sql`
    SELECT * FROM program_assignments
    WHERE patient_id = ${patientId}
    ORDER BY (status = 'active') DESC, assigned_at DESC
    LIMIT 1
  `) as Record<string, unknown>[]
  if (rows.length === 0) return null

  const assignment = mapAssignment(rows[0])
  const [progress, practitionerName] = await Promise.all([
    getProgressForAssignment(assignment.id),
    getPractitionerName(assignment.practitionerId),
  ])

  return { assignment, progress, practitionerName }
}

/** Cheap check used by layouts to decide whether to show the "My Program" nav tab
 *  and its attention dot, without pulling the full progress history. */
export async function getProgramNavState(
  patientId: number
): Promise<{ hasActiveProgram: boolean; needsSessionToday: boolean }> {
  const assignment = await getActiveAssignmentForPatient(patientId)
  if (!assignment) return { hasActiveProgram: false, needsSessionToday: false }

  const progress = await getProgressForAssignment(assignment.id)
  return { hasActiveProgram: true, needsSessionToday: !hasCompletedToday(progress) }
}

export async function assignProgram(
  practitionerId: number,
  patientId: number,
  note: string,
  programId = ANXIETY_PROGRAM.id
): Promise<ProgramAssignment> {
  const sql = getSql()

  const existing = await getActiveAssignmentForPatient(patientId)
  if (existing) return existing

  const rows = (await sql`
    INSERT INTO program_assignments (program_id, patient_id, practitioner_id, practitioner_note)
    VALUES (${programId}, ${patientId}, ${practitionerId}, ${note})
    RETURNING *
  `) as Record<string, unknown>[]

  return mapAssignment(rows[0])
}

export async function completeSession(
  assignmentId: string,
  sessionId: string,
  payload: {
    moodBefore: number | null
    moodAfter: number | null
    reflectionAnswer: string
    selectedTriggers: string[]
  }
): Promise<SessionProgressEntry[]> {
  const sql = getSql()

  await sql`
    INSERT INTO session_progress (
      assignment_id, session_id, mood_before, mood_after, reflection_answer, selected_triggers
    )
    VALUES (
      ${assignmentId}, ${sessionId}, ${payload.moodBefore}, ${payload.moodAfter},
      ${payload.reflectionAnswer}, ${payload.selectedTriggers}
    )
    ON CONFLICT (assignment_id, session_id) DO UPDATE SET
      mood_before = EXCLUDED.mood_before,
      mood_after = EXCLUDED.mood_after,
      reflection_answer = EXCLUDED.reflection_answer,
      selected_triggers = EXCLUDED.selected_triggers,
      completed_at = NOW()
  `

  const progress = await getProgressForAssignment(assignmentId)

  if (completedCount(progress) >= ANXIETY_PROGRAM.totalSessions) {
    await sql`
      UPDATE program_assignments
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${assignmentId} AND status = 'active'
    `
  }

  return progress
}

/** Every patient a practitioner has ever assigned this program to, with a lightweight
 *  summary — used to decide whether to show the "assign" empty-state per patient. */
export async function getAssignmentForPatientOwnedBy(
  practitionerId: number,
  patientId: number
): Promise<ProgramAssignmentWithProgress | null> {
  const sql = getSql()
  const owns = (await sql`
    SELECT 1 FROM patients WHERE user_id = ${patientId} AND practitioner_id = ${practitionerId}
  `) as unknown[]
  if (owns.length === 0) return null

  return getAssignmentWithProgress(patientId)
}
