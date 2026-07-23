export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const sql = getSql()
    const { role } = await request.json()

    if (!["patient", "practitioner"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Find first user with the requested role
    const rows = await sql`
      SELECT id, role, name, email FROM users WHERE role = ${role} ORDER BY id ASC LIMIT 1
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "No demo account available" }, { status: 404 })
    }

    const user = rows[0]
    await createSession(user.id)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Demo login error:", error)
    const message =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "Server database is not configured. Please set DATABASE_URL."
        : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
