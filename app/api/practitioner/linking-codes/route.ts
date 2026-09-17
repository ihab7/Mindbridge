export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createLinkingCode, listRecentCodes } from "@/lib/linking/codes"

// Practitioner-only. Codes are always created for, and listed from, the
// session user's own id — there is no practitioner_id parameter to tamper with.

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "practitioner") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const recent = await listRecentCodes(getSql(), user.id)
  return NextResponse.json({ recent })
}

export async function POST() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "practitioner") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const sql = getSql()
    const created = await createLinkingCode(sql, user.id)
    const recent = await listRecentCodes(sql, user.id)
    return NextResponse.json({ ...created, recent }, { status: 201 })
  } catch (error) {
    console.error("Linking code generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
