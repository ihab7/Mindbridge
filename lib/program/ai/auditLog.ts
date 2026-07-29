import { getSql } from "@/lib/db"
import type { PractitionerEdits, ProgramProposal, ProposalSource } from "../types"

export type { PractitionerEdits }

/** Logs a drafted (AI or rules) proposal server-side, before the practitioner
 *  has reviewed it — the audit trail required for a clinical tool. Returns
 *  the audit row id so it can be updated once/if the plan is approved. */
export async function logProposal(params: {
  patientId: number
  practitionerId: number
  source: ProposalSource
  proposal: ProgramProposal
  warnings: string[]
}): Promise<string> {
  const sql = getSql()
  const rows = (await sql`
    INSERT INTO program_proposal_audit (patient_id, practitioner_id, source, session_ids, proposal, warnings)
    VALUES (
      ${params.patientId},
      ${params.practitionerId},
      ${params.source},
      ${params.proposal.sessions.map((s) => s.id)},
      ${JSON.stringify(params.proposal)},
      ${params.warnings}
    )
    RETURNING id
  `) as Array<{ id: string }>
  return rows[0].id
}

/** Marks a previously-logged proposal as approved, recording the resulting
 *  assignment and exactly what the practitioner changed relative to the draft. */
export async function markProposalApproved(
  auditId: string,
  assignmentId: string,
  practitionerEdits: PractitionerEdits
): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE program_proposal_audit
    SET approved = true, approved_at = NOW(), assignment_id = ${assignmentId}, practitioner_edits = ${JSON.stringify(practitionerEdits)}
    WHERE id = ${auditId}
  `
}
