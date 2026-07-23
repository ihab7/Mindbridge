export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  const { id } = await params

  await sql`
    UPDATE alerts SET status = 'resolved'
    WHERE id = ${parseInt(id)}
    AND patient_id IN (
      SELECT user_id FROM patients WHERE practitioner_id = ${user.id}
    )
  `

  return NextResponse.json({ success: true })
}
