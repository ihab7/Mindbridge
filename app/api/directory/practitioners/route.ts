export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { createSession, getSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

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

// POST: the single practitioner sign-up (/join). Creates the login account
// and the directory listing together, then opens a session -- the same way
// /api/auth/register does for a patient.
//
// Both rows are written by ONE statement (two data-modifying CTEs), which
// Postgres executes atomically: if the listing insert fails, the users insert
// is rolled back with it, so neither side can be left orphaned. The neon HTTP
// driver has no interactive transactions, which is why this is not two calls.
//
// The listing goes live immediately on the 30-day free trial the /join page
// advertises (is_subscribed = true, expiring in 30 days). is_verified stays
// false: the "verified" badge is a separate review nobody has automated.
const TRIAL_DAYS = 30

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
      password = "",
      website = "",
      languages = [],
      experience_years = null,
      tags = [],
      opening_hours = {},
      plan = "basic",
    } = body ?? {}

    if (!full_name || !specialty || !city || !address || !email || !password) {
      return NextResponse.json(
        { error: "Full name, specialty, city, address, email and password are required." },
        { status: 400 },
      )
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }

    if (!["basic", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // The map pin is optional, but when present it must be a real pair of
    // coordinates -- a half-set or out-of-range pair would place the cabinet
    // wrongly on every patient's map.
    const hasLat = latitude !== null && latitude !== ""
    const hasLng = longitude !== null && longitude !== ""
    if (hasLat || hasLng) {
      const lat = Number(latitude)
      const lng = Number(longitude)
      if (
        !hasLat || !hasLng ||
        typeof latitude === "boolean" || typeof longitude === "boolean" ||
        !Number.isFinite(lat) || !Number.isFinite(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180
      ) {
        return NextResponse.json({ error: "Invalid map location" }, { status: 400 })
      }
    }

    const latValue = hasLat ? Number(latitude) : null
    const lngValue = hasLng ? Number(longitude) : null

    const sql = getSql()

    const existing = (await sql`SELECT id FROM users WHERE email = ${email}`) as Record<string, unknown>[]
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = (await sql`
      WITH new_user AS (
        INSERT INTO users (role, name, email, password_hash)
        VALUES ('practitioner', ${full_name}, ${email}, ${passwordHash})
        RETURNING id, role, name, email
      ),
      new_listing AS (
        INSERT INTO practitioners (
          user_id, full_name, specialty, bio, address, city, latitude, longitude,
          phone, email, website, languages, experience_years, tags, opening_hours, plan,
          is_verified, is_subscribed, subscription_expires_at
        ) VALUES (
          (SELECT id FROM new_user),
          ${full_name}, ${specialty}, ${bio}, ${address}, ${city}, ${latValue}, ${lngValue},
          ${phone}, ${email}, ${website}, ${languages}, ${experience_years}, ${tags}, ${JSON.stringify(opening_hours)}, ${plan},
          false, true, NOW() + make_interval(days => ${TRIAL_DAYS})
        )
        RETURNING id, user_id, plan
      )
      SELECT u.id, u.role, u.name, u.email, l.id AS practitioner_id, l.plan
      FROM new_user u
      JOIN new_listing l ON l.user_id = u.id
    `) as Record<string, unknown>[]

    const created = result[0]
    await createSession(Number(created.id))

    return NextResponse.json(
      {
        user: { id: created.id, role: created.role, name: created.name, email: created.email },
        practitioner: { id: created.practitioner_id, plan: created.plan },
      },
      { status: 201 },
    )
  } catch (error) {
    // Two sign-ups racing on the same email: the UNIQUE constraint rejects the
    // whole statement, listing included.
    if (error && typeof error === "object" && (error as { code?: unknown }).code === "23505") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }
    console.error("Practitioner registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
