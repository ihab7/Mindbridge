export const runtime = "nodejs"

import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"
import { buildPatientDigest, type PatientDigest } from "@/lib/program/ai/buildPatientDigest"
import { validateProposal } from "@/lib/program/ai/validateProposal"
import { buildRulesProposal } from "@/lib/program/ai/rulesFallback"
import { logProposal } from "@/lib/program/ai/auditLog"
import { SESSION_LIBRARY } from "@/lib/program/sessionLibrary"
import { getActiveAssignmentForPatient } from "@/lib/program/data"
import type { ProgramProposal } from "@/lib/program/types"

const MODEL = "claude-sonnet-5"
const THIN_DATA_DAY_THRESHOLD = 7

const SYSTEM_PROMPT = `You are a clinical care-plan assistant for a mental health platform. You select sessions from a fixed library to build a personalized anxiety program.

RULES:
- You may ONLY use session ids from the provided library.
- Never invent a session, a title, or any therapy content.
- Select 10 to 16 sessions.
- Respect prerequisites: if a session lists prerequisites, those ids must appear earlier in your plan.
- Order by difficulty and logical progression: education before technique, technique before consolidation.
- Distribute across 4 weeks, 2 to 5 sessions per week.
- For every selected session give a rationale that cites a SPECIFIC number or signal from the patient digest.
- List at least 2 notable sessions you deliberately skipped, with the reason.
- Respond with valid JSON only. No prose, no markdown fences, no commentary.`

function libraryForPrompt() {
  return SESSION_LIBRARY.map((s) => ({
    id: s.id,
    title: s.title.en,
    category: s.category,
    tags: s.tags,
    targets: s.targets,
    difficulty: s.difficulty,
    prerequisites: s.prerequisites,
    suggestedWeek: s.suggestedWeek,
    durationMin: s.durationMin,
  }))
}

function buildUserMessage(digest: PatientDigest): string {
  return `PATIENT DIGEST:
${JSON.stringify(digest)}

SESSION LIBRARY:
${JSON.stringify(libraryForPrompt())}

Return this exact JSON shape:
{
  "sessions": [
    { "id": "...", "week": 1, "rationale": "..." }
  ],
  "skipped": [
    { "id": "...", "reason": "..." }
  ],
  "pace": "2_per_week" | "3_per_week" | "daily",
  "summary": "one sentence for the practitioner",
  "draftNote": "a short warm note to the patient, max 200 characters"
}`
}

async function requestAiProposal(digest: PatientDigest): Promise<{ text: string } | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null

  try {
    const client = new Anthropic()
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(digest) }],
    })

    if (response.stop_reason === "refusal") return null

    const textBlock = response.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") return null

    return { text: textBlock.text }
  } catch (error) {
    console.error("AI program proposal error:", error)
    return null
  }
}

async function draftFreshProposal(digest: PatientDigest): Promise<{ proposal: ProgramProposal; warnings: string[] }> {
  const aiResponse = await requestAiProposal(digest)

  if (aiResponse) {
    const validated = validateProposal(aiResponse.text, SESSION_LIBRARY)
    const proposal = validated.ok && validated.plan ? validated.plan : buildRulesProposal(digest.signals)
    return { proposal, warnings: validated.warnings }
  }

  return { proposal: buildRulesProposal(digest.signals), warnings: [] }
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
  const patientId = Number((body as { patientId?: unknown })?.patientId)
  const revise = Boolean((body as { revise?: unknown })?.revise)
  if (!Number.isFinite(patientId)) {
    return NextResponse.json({ error: "Invalid patient" }, { status: 400 })
  }

  const sql = getSql()
  const ok = await assertPractitionerOwnsPatient(sql, user.id, patientId)
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const digest = await buildPatientDigest(patientId)

  let proposal: ProgramProposal
  let warnings: string[] = []

  // "Revise plan" preloads the patient's CURRENT plan for editing rather than drafting a fresh
  // one — no AI call happens here; hitting "Redraft" in the review screen re-POSTs without
  // `revise` to get an actual new draft. Falls back to a fresh draft if there's nothing to revise.
  const currentAssignment = revise ? await getActiveAssignmentForPatient(patientId) : null
  if (currentAssignment && currentAssignment.plan.length > 0) {
    proposal = {
      source: "manual",
      sessions: currentAssignment.plan.map((entry) => ({
        id: entry.sessionId,
        week: entry.week,
        order: entry.order,
        rationale: "Currently part of this patient's assigned program.",
      })),
      skipped: [],
      pace: "2_per_week",
      summary: currentAssignment.aiSummary || "This patient's current plan, opened for revision.",
      draftNote: currentAssignment.practitionerNote,
    }
  } else {
    ;({ proposal, warnings } = await draftFreshProposal(digest))
  }

  const auditId = await logProposal({
    patientId,
    practitionerId: user.id,
    source: proposal.source,
    proposal,
    warnings,
  })

  return NextResponse.json({
    auditId,
    proposal,
    digest,
    thinData: digest.journal.entryCount < THIN_DATA_DAY_THRESHOLD,
  })
}
