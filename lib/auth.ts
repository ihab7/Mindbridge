import { cookies } from "next/headers"
import { getSql } from "./db"
import { randomBytes } from "crypto"

export type User = {
  id: number
  role: "patient" | "practitioner"
  name: string
  email: string
}

export async function createSession(userId: number): Promise<string> {
  const sql = getSql()
  const sessionId = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})
  `

  const cookieStore = await cookies()
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })

  return sessionId
}

export async function getSession(): Promise<User | null> {
  const sql = getSql()
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) return null

  const rows = await sql`
    SELECT u.id, u.role, u.name, u.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId}
      AND s.expires_at > NOW()
  `

  if (rows.length === 0) return null
  return rows[0] as User
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (sessionId) {
    const sql = getSql()
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
    cookieStore.delete("session_id")
  }
}
