export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

function clampText(input: unknown, maxLen: number) {
  const s = typeof input === "string" ? input.trim() : ""
  return s.length > maxLen ? s.slice(0, maxLen) : s
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const exerciseType = clampText(body.exerciseType, 50)
    const durationSeconds = Number(body.durationSeconds)

    if (!exerciseType || !Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 60 * 60) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const sql = getSql()
    const rows = (await sql`
      INSERT INTO breathing_sessions (patient_id, exercise_type, duration_seconds, completed_at)
      VALUES (${user.id}, ${exerciseType}, ${durationSeconds}, NOW())
      RETURNING id
    `) as Array<{ id: string }>

    return NextResponse.json({ ok: true, id: rows[0]?.id }, { status: 200 })
  } catch (error) {
    console.error("Breathing session save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = clampText(body.id, 100)
    const rating = body.rating === null || body.rating === undefined ? null : Number(body.rating)

    if (!id) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    if (rating !== null && (!Number.isFinite(rating) || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const sql = getSql()
    const rows = (await sql`
      UPDATE breathing_sessions
      SET rating = ${rating}
      WHERE id = ${id} AND patient_id = ${user.id}
      RETURNING id
    `) as Array<{ id: string }>

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Breathing session rating save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
