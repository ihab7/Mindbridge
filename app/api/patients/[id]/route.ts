export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  const { id } = await params
  const patientId = parseInt(id)

  // Verify this patient belongs to this practitioner
  const ok = await assertPractitionerOwnsPatient(sql, user.id, patientId)
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const patientRows = await sql`SELECT id, name, email FROM users WHERE id = ${patientId}`
  if (patientRows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const entries = await sql`
    SELECT * FROM journal_entries
    WHERE patient_id = ${patientId}
    ORDER BY created_at DESC
    LIMIT 30
  `

  const alerts = await sql`
    SELECT * FROM alerts
    WHERE patient_id = ${patientId}
    ORDER BY created_at DESC
  `

  // Calculate analytics
  const totalEntries = entries.length
  const medTakenCount = entries.filter((e: Record<string, unknown>) => e.medication_taken).length
  const adherenceRate = totalEntries > 0 ? Math.round((medTakenCount / totalEntries) * 100) : 0
  const avgMood = totalEntries > 0 ? (entries.reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.mood), 0) / totalEntries).toFixed(1) : "N/A"
  const avgSleep = totalEntries > 0 ? (entries.reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.sleep_hours), 0) / totalEntries).toFixed(1) : "N/A"

  return NextResponse.json({
    patient: patientRows[0],
    entries,
    alerts,
    analytics: { adherenceRate, avgMood, avgSleep, totalEntries },
  })
}
