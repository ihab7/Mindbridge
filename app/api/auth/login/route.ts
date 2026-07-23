export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { createSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const sql = getSql()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const rows = await sql`SELECT id, role, name, email, password_hash FROM users WHERE email = ${email}`

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = rows[0]
    const passwordValid = await bcrypt.compare(password, user.password_hash)

    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await createSession(user.id)

    return NextResponse.json({
      user: { id: user.id, role: user.role, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    const message =
      error instanceof Error && error.message.includes("DATABASE_URL")
        ? "Server database is not configured. Please set DATABASE_URL."
        : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
