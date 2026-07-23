import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

function normalizeSideEffectsPayload(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.map(String)
}

function applySideEffectsRules(sideEffects: string[], sideEffectsOther: unknown): {
  sideEffects: string[]
  sideEffectsOther: string | null
} {
  const cleaned = sideEffects.map((s) => String(s).trim()).filter(Boolean)
  const unique = Array.from(new Set(cleaned))

  const other = typeof sideEffectsOther === "string" ? sideEffectsOther.trim() : ""

  if (unique.includes("none")) {
    return { sideEffects: ["none"], sideEffectsOther: null }
  }

  const withoutNone = unique.filter((s) => s !== "none")

  if (withoutNone.length === 0) {
    return { sideEffects: [], sideEffectsOther: null }
  }

  if (withoutNone.includes("other")) {
    return { sideEffects: withoutNone, sideEffectsOther: other || "" }
  }

  return { sideEffects: withoutNone, sideEffectsOther: null }
}

async function hasNewSideEffectsColumns(sql: ReturnType<typeof getSql>) {
  const rows = (await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'journal_entries'
      AND column_name IN ('side_effects', 'side_effects_other')
  `) as Record<string, unknown>[]

  const byName = new Map(rows.map((r) => [String(r.column_name), String(r.data_type)]))
  const sideEffectsType = byName.get("side_effects")
  const hasOther = byName.has("side_effects_other")

  return {
    hasArraySideEffects: sideEffectsType === "ARRAY",
    hasSideEffectsOther: hasOther,
  }
}

function serializeLegacySideEffectsText(ruled: { sideEffects: string[]; sideEffectsOther: string | null }) {
  return JSON.stringify({
    sideEffects: ruled.sideEffects,
    ...(ruled.sideEffectsOther != null ? { sideEffectsOther: ruled.sideEffectsOther } : {}),
  })
}

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  const entries = (await sql`
    SELECT * FROM journal_entries
    WHERE patient_id = ${user.id}
    ORDER BY created_at DESC
    LIMIT 30
  `) as Record<string, unknown>[]

  return NextResponse.json({ entries })
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sql = getSql()
    const body = await request.json()
    const {
      mood,
      anxiety,
      sleepHours,
      medicationTaken,
      sideEffects,
      sideEffectsOther,
      challenges,
      achievements,
    } = body

    if (mood == null || anxiety == null || sleepHours == null || medicationTaken == null) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    const normalized = normalizeSideEffectsPayload(sideEffects)
    const ruled = applySideEffectsRules(normalized, sideEffectsOther)

    const schema = await hasNewSideEffectsColumns(sql)

    const result = schema.hasArraySideEffects && schema.hasSideEffectsOther
      ? await sql`
          INSERT INTO journal_entries (
            patient_id,
            mood,
            anxiety,
            sleep_hours,
            medication_taken,
            side_effects,
            side_effects_other,
            challenges,
            achievements
          )
          VALUES (
            ${user.id},
            ${mood},
            ${anxiety},
            ${sleepHours},
            ${medicationTaken},
            ${ruled.sideEffects},
            ${ruled.sideEffectsOther},
            ${challenges || ""},
            ${achievements || ""}
          )
          RETURNING *
        `
      : await sql`
          INSERT INTO journal_entries (
            patient_id,
            mood,
            anxiety,
            sleep_hours,
            medication_taken,
            side_effects,
            challenges,
            achievements
          )
          VALUES (
            ${user.id},
            ${mood},
            ${anxiety},
            ${sleepHours},
            ${medicationTaken},
            ${serializeLegacySideEffectsText(ruled)},
            ${challenges || ""},
            ${achievements || ""}
          )
          RETURNING *
        `

    // Check alert rules after submission
    await checkAlertRules(user.id)

    return NextResponse.json({ entry: (result as Record<string, unknown>[])[0] }, { status: 201 })
  } catch (error) {
    console.error("Journal submission error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function checkAlertRules(patientId: number) {
  try {
    const sql = getSql()
    // Get last 3 entries
    const recent = (await sql`
      SELECT mood, sleep_hours, medication_taken, created_at
      FROM journal_entries
      WHERE patient_id = ${patientId}
      ORDER BY created_at DESC
      LIMIT 3
    `) as Record<string, unknown>[]

    if (recent.length < 2) return

    // Rule 1: Mood decreases by >= 3 points in 3 days
    if (recent.length >= 3) {
      const moodDrop = Number(recent[2]?.mood) - Number(recent[0]?.mood)
      if (moodDrop >= 3) {
        const existing = (await sql`
          SELECT id FROM alerts
          WHERE patient_id = ${patientId} AND alert_type = 'mood_drop' AND status = 'open'
          AND created_at > NOW() - INTERVAL '3 days'
        `) as Record<string, unknown>[]
        if (existing.length === 0) {
          await sql`
            INSERT INTO alerts (patient_id, alert_type, description, status)
            VALUES (${patientId}, 'mood_drop', ${"Mood dropped by " + moodDrop + " points over 3 entries"}, 'open')
          `
        }
      }
    }

    // Rule 2: Medication not taken for 2 consecutive days
    if (recent.length >= 2 && !recent[0].medication_taken && !recent[1].medication_taken) {
      const existing = (await sql`
        SELECT id FROM alerts
        WHERE patient_id = ${patientId} AND alert_type = 'medication_missed' AND status = 'open'
        AND created_at > NOW() - INTERVAL '2 days'
      `) as Record<string, unknown>[]
      if (existing.length === 0) {
        await sql`
          INSERT INTO alerts (patient_id, alert_type, description, status)
          VALUES (${patientId}, 'medication_missed', 'Medication not taken for 2 consecutive entries', 'open')
        `
      }
    }

    // Rule 3: Sleep < 4 hours for 2 nights
    if (recent.length >= 2 && Number(recent[0].sleep_hours) < 4 && Number(recent[1].sleep_hours) < 4) {
      const existing = (await sql`
        SELECT id FROM alerts
        WHERE patient_id = ${patientId} AND alert_type = 'sleep_critical' AND status = 'open'
        AND created_at > NOW() - INTERVAL '2 days'
      `) as Record<string, unknown>[]
      if (existing.length === 0) {
        await sql`
          INSERT INTO alerts (patient_id, alert_type, description, status)
          VALUES (${patientId}, 'sleep_critical', 'Sleep below 4 hours for 2 consecutive nights', 'open')
        `
      }
    }
  } catch (error) {
    console.error("Alert check error:", error)
  }
}
