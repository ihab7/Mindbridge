import { getSql } from "./db"

export async function assertPractitionerOwnsPatient(
  sql: ReturnType<typeof getSql>,
  practitionerId: number,
  patientId: number
): Promise<boolean> {
  const authorized = await sql`
    SELECT 1 FROM patients
    WHERE user_id = ${patientId} AND practitioner_id = ${practitionerId}
    LIMIT 1
  `
  return authorized.length > 0
}
