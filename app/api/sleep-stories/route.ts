export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { SLEEP_STORIES, getStoriesByLanguage, type SleepStory } from "@/lib/sleep-stories/stories"

const VALID_LANGUAGES: SleepStory["language"][] = ["ar", "en", "fr"]

export async function GET(request: Request) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const lang = searchParams.get("lang")

  if (lang && !VALID_LANGUAGES.includes(lang as SleepStory["language"])) {
    return NextResponse.json({ error: `Invalid lang "${lang}"` }, { status: 400 })
  }

  const stories = lang ? getStoriesByLanguage(lang as SleepStory["language"]) : SLEEP_STORIES

  return NextResponse.json(
    { stories },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  )
}
