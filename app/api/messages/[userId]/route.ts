export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  const { userId } = await params
  const otherUserId = parseInt(userId)

  // Mark messages from the other user as read
  await sql`
    UPDATE messages SET read = true
    WHERE sender_id = ${otherUserId} AND receiver_id = ${user.id}
  `

  const messages = await sql`
    SELECT m.*, u.name as sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE (m.sender_id = ${user.id} AND m.receiver_id = ${otherUserId})
       OR (m.sender_id = ${otherUserId} AND m.receiver_id = ${user.id})
    ORDER BY m.created_at ASC
  `

  return NextResponse.json({ messages })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()

  const { userId } = await params
  const receiverId = parseInt(userId)

  try {
    const { text } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO messages (sender_id, receiver_id, text)
      VALUES (${user.id}, ${receiverId}, ${text.trim()})
      RETURNING *
    `

    return NextResponse.json({ message: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
