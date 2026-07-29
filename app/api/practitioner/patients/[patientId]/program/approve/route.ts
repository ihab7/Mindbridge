export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"
import { assignComposedProgram } from "@/lib/program/data"
import { markProposalApproved } from "@/lib/program/ai/auditLog"
import { SESSION_LIBRARY } from "@/lib/program/sessionLibrary"
import type { PlanEntry, PractitionerEdits, ProposalSource } from "@/lib/program/types"

const MIN_SESSIONS = 4
const NOTE_MAX_LEN = 200
const VALID_SOURCES: ProposalSource[] = ["ai", "rules", "manual"]

function clampText(input: unknown, maxLen: number): string {
  const s = typeof input === "string" ? input.trim() : ""
  return s.length > maxLen ? s.slice(0, maxLen) : s
}

function parsePlan(raw: unknown): PlanEntry[] {
  if (!Array.isArray(raw)) return []
  const libraryIds = new Set(SESSION_LIBRARY.map((s) => s.id))
  const seen = new Set<string>()
  const cleaned: PlanEntry[] = []
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue
    const e = entry as Record<string, unknown>
    const sessionId = typeof e.sessionId === "string" ? e.sessionId : ""
    if (!sessionId || !libraryIds.has(sessionId) || seen.has(sessionId)) continue
    seen.add(sessionId)
    const week = Math.min(4, Math.max(1, Math.round(Number(e.week) || 1)))
    cleaned.push({ sessionId, week, order: cleaned.length })
  }
  return cleaned
}

function parsePractitionerEdits(raw: unknown): PractitionerEdits {
  const e = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {}
  return {
    removed: Array.isArray(e.removed) ? e.removed.filter((x): x is string => typeof x === "string") : [],
    added: Array.isArray(e.added) ? e.added.filter((x): x is string => typeof x === "string") : [],
    reordered: Boolean(e.reordered),
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ patientId: string }> }) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { patientId } = await params
  const pid = Number(patientId)
  if (!Number.isFinite(pid)) {
    return NextResponse.json({ error: "Invalid patient" }, { status: 400 })
  }

  const sql = getSql()
  const ok = await assertPractitionerOwnsPatient(sql, user.id, pid)
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
  const b = body as Record<string, unknown>

  const plan = parsePlan(b.plan)
  if (plan.length < MIN_SESSIONS) {
    return NextResponse.json({ error: "A plan needs at least 4 sessions to be approved." }, { status: 400 })
  }

  const rawSource = typeof b.source === "string" ? b.source : ""
  const source: ProposalSource = (VALID_SOURCES as string[]).includes(rawSource) ? (rawSource as ProposalSource) : "manual"
  const note = clampText(b.note, NOTE_MAX_LEN)
  const aiSummary = clampText(b.aiSummary, 400)
  const auditId = typeof b.auditId === "string" ? b.auditId : null
  const practitionerEdits = parsePractitionerEdits(b.practitionerEdits)

  const assignment = await assignComposedProgram({
    practitionerId: user.id,
    patientId: pid,
    note,
    source,
    plan,
    aiSummary,
  })

  if (auditId) {
    await markProposalApproved(auditId, assignment.id, practitionerEdits)
  }

  const weekCount = new Set(plan.map((p) => p.week)).size

  return NextResponse.json({
    assignment: { id: assignment.id, status: assignment.status, assignedAt: assignment.assignedAt },
    sessionCount: plan.length,
    weekCount,
  })
}
