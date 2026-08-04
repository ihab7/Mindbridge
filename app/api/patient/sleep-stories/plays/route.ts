export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { logStoryPlay } from "@/lib/sleep-stories/queries"

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as { storySlug?: string; completed?: boolean; timerMinutes?: number | null }
  if (!body.storySlug) {
    return NextResponse.json({ error: "storySlug is required" }, { status: 400 })
  }

  await logStoryPlay({
    storySlug: body.storySlug,
    patientId: user.id,
    completed: Boolean(body.completed),
    timerMinutes: typeof body.timerMinutes === "number" ? body.timerMinutes : null,
  })

  return NextResponse.json({ ok: true })
}
