export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { validateCabinetContact } from "@/lib/directory"

// PUT: the practitioner edits the PUBLIC cabinet contact of their own
// directory listing (practitioners.phone / .email). Scoped to the session
// user's listing — there is no listing id to tamper with. Distinct from
// /api/practitioner/profile, which is the letterhead of clinical reports.
export async function PUT(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (user.role !== "practitioner") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const contact = validateCabinetContact(body?.phone, body?.email)
  if (!contact.ok) return NextResponse.json({ errorCode: contact.errorCode }, { status: 400 })

  try {
    const rows = (await getSql()`
      UPDATE practitioners
      SET phone = ${contact.phone}, email = ${contact.email}
      WHERE user_id = ${user.id}
      RETURNING phone, email
    `) as { phone: string; email: string }[]
    if (rows.length === 0) return NextResponse.json({ errorCode: "no_listing" }, { status: 404 })
    return NextResponse.json({ phone: rows[0].phone, email: rows[0].email })
  } catch (error) {
    console.error("Listing contact update error:", error)
    return NextResponse.json({ errorCode: "server_error" }, { status: 500 })
  }
}
