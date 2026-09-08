import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { logDbError } from "@/lib/db-errors"

const FIELDS = [
  "full_name",
  "specialty",
  "cabinet_name",
  "license_number",
  "address",
  "phone",
  "email",
  "report_footer_note",
] as const

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null
  const s = v.trim()
  return s.length > 0 ? s.slice(0, 500) : null
}

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const sql = getSql()
    const rows = (await sql`
      SELECT full_name, specialty, cabinet_name, license_number, address, phone, email, report_footer_note
      FROM practitioner_profiles WHERE user_id = ${user.id}
    `) as Record<string, unknown>[]
    return NextResponse.json({ profile: rows[0] ?? null })
  } catch (err) {
    logDbError(err, "practitioner-profile:get")
    return NextResponse.json({ error: "server-error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const v = Object.fromEntries(FIELDS.map((f) => [f, clean(body?.[f])])) as Record<
    (typeof FIELDS)[number],
    string | null
  >

  try {
    const sql = getSql()
    await sql`
      INSERT INTO practitioner_profiles
        (user_id, full_name, specialty, cabinet_name, license_number, address, phone, email, report_footer_note, updated_at)
      VALUES
        (${user.id}, ${v.full_name}, ${v.specialty}, ${v.cabinet_name}, ${v.license_number},
         ${v.address}, ${v.phone}, ${v.email}, ${v.report_footer_note}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        specialty = EXCLUDED.specialty,
        cabinet_name = EXCLUDED.cabinet_name,
        license_number = EXCLUDED.license_number,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        report_footer_note = EXCLUDED.report_footer_note,
        updated_at = NOW()
    `
    return NextResponse.json({ ok: true })
  } catch (err) {
    logDbError(err, "practitioner-profile:put")
    return NextResponse.json({ error: "server-error" }, { status: 500 })
  }
}
