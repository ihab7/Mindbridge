export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getPendingForPatient } from "@/lib/video/data"

// Polled every 15s by the patient dashboard (see components/patient/video-call-card.tsx).
export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()
  const result = await getPendingForPatient(sql, user.id)
  return NextResponse.json(result)
}
