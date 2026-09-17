export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { markLinksSeen } from "@/lib/linking/codes"

// POST: dismiss the "new patient linked" notice on the Patients page.
export async function POST() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "practitioner") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await markLinksSeen(getSql(), user.id)
  return NextResponse.json({ ok: true })
}
