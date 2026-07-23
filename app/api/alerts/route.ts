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

  const alerts = await sql`
    SELECT a.*, u.name as patient_name
    FROM alerts a
    JOIN users u ON a.patient_id = u.id
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${user.id}
    ORDER BY a.created_at DESC
  `

  return NextResponse.json({ alerts })
}
