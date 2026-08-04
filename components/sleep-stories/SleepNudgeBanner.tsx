"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Moon } from "lucide-react"
import { useT } from "@/components/i18n-provider"

type NudgeResponse =
  | { show: false }
  | { show: true; reason: "drop" | "low"; thisWeekAvg: number; priorWeekAvg: number | null; storySlug: string | null }

export function SleepNudgeBanner() {
  const t = useT()
  const [nudge, setNudge] = useState<NudgeResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/patient/sleep-stories/nudge")
        if (!res.ok) return
        const data = (await res.json()) as NudgeResponse
        if (!cancelled) setNudge(data)
      } catch {
        // silent -- the banner just doesn't show if this fails
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!nudge || !nudge.show) return null

  const href = nudge.storySlug ? `/sleep-stories/${nudge.storySlug}` : "/sleep-stories"
  const message =
    nudge.reason === "drop"
      ? t("sleepStories.nudge.drop", { avg: nudge.thisWeekAvg })
      : t("sleepStories.nudge.low", { avg: nudge.thisWeekAvg })

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/60"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Moon className="h-4 w-4" aria-hidden="true" />
      </span>
      <p className="text-sm text-card-foreground">{message}</p>
    </Link>
  )
}
