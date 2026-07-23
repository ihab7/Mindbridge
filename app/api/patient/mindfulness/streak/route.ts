export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

function computeStreak(days: string[], today: Date) {
  const set = new Set(days)
  let streak = 0

  for (let i = 0; i < 365; i++) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
    const key = d.toISOString().slice(0, 10)
    if (set.has(key)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function recommendExercise(now: Date) {
  const hour = now.getHours()
  if (hour >= 18 || hour < 6) return "sleep"
  if (hour >= 12) return "calm_down"
  return "three_minute"
}

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  // grab distinct UTC dates for last 60 days
  const rows = (await sql`
    SELECT DISTINCT to_char((completed_at AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') as day
    FROM breathing_sessions
    WHERE patient_id = ${user.id}
      AND completed_at > NOW() - INTERVAL '60 days'
    ORDER BY day DESC
  `) as Array<{ day: string }>

  const today = new Date()
  const streakDays = rows.map((r) => r.day)
  const streak = computeStreak(streakDays, new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())))

  return NextResponse.json(
    {
      streak,
      recommendedExerciseType: recommendExercise(today),
    },
    { status: 200 },
  )
}
