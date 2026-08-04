export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getBestNudgeStory } from "@/lib/sleep-stories/queries"
import { defaultLocale, isLocale, type Locale } from "@/i18n/routing"

const DROP_THRESHOLD_HOURS = 0.5
const LOW_AVG_THRESHOLD_HOURS = 6
const MIN_LOGGED_NIGHTS = 4

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sql = getSql()
  const entries = (await sql`
    SELECT sleep_hours, created_at FROM journal_entries
    WHERE patient_id = ${user.id} AND created_at >= NOW() - INTERVAL '14 days'
    ORDER BY created_at DESC
  `) as Array<{ sleep_hours: string; created_at: string }>

  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

  const thisWeek: number[] = []
  const priorWeek: number[] = []
  for (const e of entries) {
    const ageMs = now - new Date(e.created_at).getTime()
    const hours = Number(e.sleep_hours)
    if (ageMs < sevenDaysMs) thisWeek.push(hours)
    else priorWeek.push(hours)
  }

  const thisWeekAvg = average(thisWeek)
  const priorWeekAvg = average(priorWeek)

  const hasEnoughData = entries.length >= MIN_LOGGED_NIGHTS && thisWeekAvg !== null

  const dropped = hasEnoughData && priorWeekAvg !== null && priorWeekAvg - thisWeekAvg! > DROP_THRESHOLD_HOURS
  const sustainedLow = hasEnoughData && thisWeekAvg! < LOW_AVG_THRESHOLD_HOURS

  const show = hasEnoughData && (dropped || sustainedLow)

  if (!show) {
    return NextResponse.json({ show: false })
  }

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value
  const locale: Locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale

  const bestStory = getBestNudgeStory(locale)

  return NextResponse.json({
    show: true,
    reason: dropped ? "drop" : "low",
    thisWeekAvg: Math.round(thisWeekAvg! * 10) / 10,
    priorWeekAvg: priorWeekAvg !== null ? Math.round(priorWeekAvg * 10) / 10 : null,
    storySlug: bestStory?.slug ?? null,
  })
}
