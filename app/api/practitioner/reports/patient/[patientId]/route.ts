export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"
import { mapReportRow } from "@/lib/consultation-report/data"

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

  const rows = (await sql`
    SELECT * FROM consultation_reports
    WHERE patient_id = ${pid} AND practitioner_id = ${user.id}
    ORDER BY consultation_date DESC
  `) as Record<string, unknown>[]

  return NextResponse.json({ reports: rows.map(mapReportRow) })
}
