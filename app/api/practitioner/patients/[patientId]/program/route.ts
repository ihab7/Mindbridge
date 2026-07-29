export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"
import { getAssignmentWithProgress, assignProgram } from "@/lib/program/data"

function clampText(input: unknown, maxLen: number) {
  const s = typeof input === "string" ? input.trim() : ""
  return s.length > maxLen ? s.slice(0, maxLen) : s
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
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

  const data = await getAssignmentWithProgress(pid)
  if (!data || data.assignment.practitionerId !== user.id) {
    return NextResponse.json({ assignment: null })
  }

  return NextResponse.json({
    assignment: {
      programId: data.assignment.programId,
      practitionerNote: data.assignment.practitionerNote,
      status: data.assignment.status,
      assignedAt: data.assignment.assignedAt,
      source: data.assignment.source,
      plan: data.assignment.plan,
    },
    progress: data.progress,
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
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

  try {
    const body = await request.json()
    const note = clampText(body.note, 200)

    const assignment = await assignProgram(user.id, pid, note)
    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error("Program assignment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
