export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET: public directory listing. Patients browse for free -- no auth
// required -- but contact details (phone/email/website/address) are
// stripped server-side unless the caller has a session, so logged-out
// visitors can never read them off the network response.
export async function GET() {
  const sql = getSql()
  const user = await getSession()

  const rows = await sql`
    SELECT
      id, user_id, full_name, specialty, bio, address, city, latitude, longitude,
      phone, email, website, languages, experience_years, tags, avatar_url,
      opening_hours, plan, is_verified
    FROM practitioners
    WHERE is_subscribed = true
      AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
    ORDER BY (plan = 'premium') DESC, created_at DESC
  `

  const practitioners = rows.map((row) => {
    const base = { ...row }
    if (!user) {
      base.address = null
      base.phone = null
      base.email = null
      base.website = null
    }
    return base
  })

  return NextResponse.json({ practitioners, isLoggedIn: Boolean(user) })
}

// POST: public practitioner/cabinet registration ("join" the directory).
// No login required to apply. New listings start unsubscribed and
// unverified -- MindBridge reviews and activates (`is_subscribed = true`)
// within the trial window before the listing appears to patients.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      full_name,
      specialty,
      bio = "",
      address = "",
      city = "",
      latitude = null,
      longitude = null,
      phone = "",
      email = "",
      website = "",
      languages = [],
      experience_years = null,
      tags = [],
      opening_hours = {},
      plan = "basic",
    } = body ?? {}

    if (!full_name || !specialty || !city || !address || (!phone && !email)) {
      return NextResponse.json(
        { error: "Full name, specialty, city, address, and a phone or email are required." },
        { status: 400 },
      )
    }

    if (!["basic", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const sql = getSql()
    const result = await sql`
      INSERT INTO practitioners (
        full_name, specialty, bio, address, city, latitude, longitude,
        phone, email, website, languages, experience_years, tags, opening_hours, plan
      ) VALUES (
        ${full_name}, ${specialty}, ${bio}, ${address}, ${city}, ${latitude}, ${longitude},
        ${phone}, ${email}, ${website}, ${languages}, ${experience_years}, ${tags}, ${JSON.stringify(opening_hours)}, ${plan}
      )
      RETURNING id, full_name, plan
    `

    return NextResponse.json({ practitioner: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Practitioner registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
