"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Flame, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { useT } from "@/components/i18n-provider"
import type { Locale } from "@/i18n/routing"
import type { Program, SessionProgressEntry } from "@/lib/program/types"
import { completedCount, currentWeekNumber, dayStreak, moodTrend, percentComplete } from "@/lib/program/progress"

export function ProgramHero({
  program,
  progress,
  practitionerName,
  locale,
}: {
  program: Program
  progress: SessionProgressEntry[]
  practitionerName: string
  locale: Locale
}) {
  const t = useT()

  const pct = percentComplete(program, progress)
  const week = currentWeekNumber(program, progress)
  const streak = dayStreak(progress)
  const trend = moodTrend(progress)

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-card-foreground">{program.title[locale]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{program.description[locale]}</p>
          <Link
            href="/mindfulness"
            className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t("program.quickLink")}
          </Link>
          {practitionerName && (
            <p className="mt-2 text-xs font-medium text-primary">{t("program.assignedBy", { name: practitionerName })}</p>
          )}
        </div>

        <div className="flex gap-4">
          <Stat icon={<Flame className="h-3.5 w-3.5" />} value={String(completedCount(progress))} label={t("program.stats.sessionsDone")} />
          <Stat value={String(streak)} label={t("program.stats.dayStreak")} />
          <Stat icon={<TrendIcon className="h-3.5 w-3.5" />} value="" label={t("program.stats.moodTrend")} />
        </div>
      </div>

      <div className="mt-5">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg,#2a9d8f,#4ecdc4)",
              transition: "width 1s cubic-bezier(0.34,1.2,0.64,1)",
            }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{t("program.progress.percentWeek", { pct, week })}</p>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }: { icon?: ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-card-foreground">
        {icon}
        {value && <span className="text-lg font-bold">{value}</span>}
      </div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
