export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  const patients = await sql`
    SELECT u.id, u.name, u.email, p.created_at as enrolled_at,
      (SELECT COUNT(*) FROM journal_entries j WHERE j.patient_id = u.id) as entry_count,
      (SELECT COUNT(*) FROM alerts a WHERE a.patient_id = u.id AND a.status = 'open') as open_alerts,
      (SELECT mood FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as latest_mood,
      (SELECT created_at FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as last_entry_at
    FROM users u
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${user.id}
    ORDER BY u.name ASC
  `

  return NextResponse.json({ patients })
}
