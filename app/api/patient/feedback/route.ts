export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  const rows = (await sql`
    SELECT
      pf.note,
      pf.next_appointment_at,
      pf.updated_at,
      u.name as practitioner_name
    FROM practitioner_feedback pf
    JOIN users u ON u.id = pf.practitioner_id
    WHERE pf.patient_id = ${user.id}
    LIMIT 1
  `) as Record<string, unknown>[]

  if (rows.length === 0) {
    return NextResponse.json({ feedback: null }, { status: 200 })
  }

  const row = rows[0]
  return NextResponse.json(
    {
      feedback: {
        note: row.note,
        nextAppointmentAt: row.next_appointment_at,
        updatedAt: row.updated_at,
        practitionerName: row.practitioner_name,
      },
    },
    { status: 200 },
  )
}
