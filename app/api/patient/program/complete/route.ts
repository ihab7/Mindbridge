export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { ANXIETY_PROGRAM, findSession } from "@/lib/program/content"
import { getActiveAssignmentForPatient, getProgressForAssignment, completeSession } from "@/lib/program/data"
import { isSessionUnlocked } from "@/lib/program/progress"

function clampText(input: unknown, maxLen: number) {
  const s = typeof input === "string" ? input.trim() : ""
  return s.length > maxLen ? s.slice(0, maxLen) : s
}

function clampMood(input: unknown): number | null {
  if (input === null || input === undefined) return null
  const n = Number(input)
  if (!Number.isFinite(n) || n < 1 || n > 5) return null
  return Math.round(n)
}

function clampTriggers(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.filter((v): v is string => typeof v === "string").map((v) => v.trim().slice(0, 60)).slice(0, 20)
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const sessionId = clampText(body.sessionId, 20)
    const found = findSession(ANXIETY_PROGRAM, sessionId)
    if (!sessionId || !found) {
      return NextResponse.json({ error: "Unknown session" }, { status: 400 })
    }

    const assignment = await getActiveAssignmentForPatient(user.id)
    if (!assignment) {
      return NextResponse.json({ error: "No active program" }, { status: 404 })
    }

    const existingProgress = await getProgressForAssignment(assignment.id)
    if (!isSessionUnlocked(ANXIETY_PROGRAM, existingProgress, sessionId)) {
      return NextResponse.json({ error: "Session locked" }, { status: 409 })
    }

    const progress = await completeSession(assignment.id, sessionId, {
      moodBefore: clampMood(body.moodBefore),
      moodAfter: clampMood(body.moodAfter),
      reflectionAnswer: clampText(body.reflectionAnswer, 4000),
      selectedTriggers: clampTriggers(body.selectedTriggers),
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("Program session completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
