export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { redeemCodeForPatient } from "@/lib/linking/codes"

// POST: a signed-in patient with no practitioner enters a linking code from
// their dashboard. Validation and the atomic claim + link live in
// lib/linking/codes.ts, shared with sign-up (/api/auth/register).
export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await request.json().catch(() => ({}))
    const result = await redeemCodeForPatient(getSql(), user.id, body?.code)

    if (result.ok) return NextResponse.json({ practitioner: result.practitioner })
    if (result.error === "already_linked") {
      return NextResponse.json({ errorCode: result.error, practitionerName: result.practitionerName }, { status: 409 })
    }
    return NextResponse.json({ errorCode: result.error }, { status: 400 })
  } catch (error) {
    console.error("Patient link error:", error)
    return NextResponse.json({ errorCode: "generic" }, { status: 500 })
  }
}
