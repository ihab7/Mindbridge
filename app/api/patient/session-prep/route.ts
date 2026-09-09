export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

function clampText(input: unknown, maxLen: number): string {
  const value = typeof input === "string" ? input.trim() : ""
  return value.length > maxLen ? value.slice(0, maxLen) : value
}

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  const rows = (await sql`
    SELECT id, patient_id, topics_to_discuss, questions_for_therapist, recent_concerns, updated_at
    FROM session_prep
    WHERE patient_id = ${user.id}
    LIMIT 1
  `) as Record<string, unknown>[]

  return NextResponse.json({ sessionPrep: rows[0] ?? null })
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    const maxLen = 1500
    const topicsToDiscuss = clampText(body.topicsToDiscuss, maxLen)
    const questionsForTherapist = clampText(body.questionsForTherapist, maxLen)
    const recentConcerns = clampText(body.recentConcerns, maxLen)

    const sql = getSql()

    const result = await sql`
      INSERT INTO session_prep (patient_id, topics_to_discuss, questions_for_therapist, recent_concerns, updated_at)
      VALUES (${user.id}, ${topicsToDiscuss}, ${questionsForTherapist}, ${recentConcerns}, NOW())
      ON CONFLICT (patient_id)
      DO UPDATE SET
        topics_to_discuss = EXCLUDED.topics_to_discuss,
        questions_for_therapist = EXCLUDED.questions_for_therapist,
        recent_concerns = EXCLUDED.recent_concerns,
        updated_at = NOW()
      RETURNING id, patient_id, topics_to_discuss, questions_for_therapist, recent_concerns, updated_at
    `

    return NextResponse.json({ sessionPrep: (result as Record<string, unknown>[])[0] }, { status: 200 })
  } catch (error) {
    const pgError = error as {
      message?: string
      code?: string
      table?: string
      column?: string
      constraint?: string
      detail?: string
      hint?: string
      schema?: string
    }
    console.error("Session prep save error:", {
      message: pgError?.message,
      code: pgError?.code,
      table: pgError?.table,
      column: pgError?.column,
      constraint: pgError?.constraint,
      detail: pgError?.detail,
      hint: pgError?.hint,
      schema: pgError?.schema,
      raw: error,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
