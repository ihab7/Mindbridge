"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IconNotes } from "@tabler/icons-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { buildWeeklySummary, type SummaryEntry, type DayWeather } from "@/lib/wellbeing/weeklySummary"
import { WeeklyWeatherCard } from "./WeeklyWeatherCard"
import { DayReflectionCard } from "./DayReflectionCard"
import { RestSummaryCard } from "./RestSummaryCard"
import { DetailedTrendsPanel } from "./DetailedTrendsPanel"

// Patient-only weekly wellbeing view. Replaces the raw mood/anxiety and
// sleep/medication charts on the patient dashboard with a warm narrative.
// `entries` are the last 14 days (by date); this-week vs prior-week is derived
// inside buildWeeklySummary.
export function WeeklyWellbeing({
  entries,
  checkInHref = "#journal-form",
}: {
  entries: SummaryEntry[]
  checkInHref?: string
}) {
  const { locale } = useI18n()
  const t = useT()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const summary = useMemo(
    () => buildWeeklySummary(entries, { t, locale }),
    // t/locale are stable per render; entries drive recomputation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, locale],
  )

  // Thin week: render every day as "no entry" so 1-2 lonely icons don't stand
  // out, per the thin-data spec.
  const displayDays: DayWeather[] = useMemo(() => {
    if (summary.hasEnoughData) return summary.days
    return summary.days.map((d) => ({
      ...d,
      weather: "none",
      mood: null,
      reflection: t("wellbeing.reflection.none.0"),
    }))
  }, [summary, t])

  // Zero entries ever: a single gentle invitation, no weather row.
  if (!summary.hasAnyData) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5">
        <IconNotes size={22} className="text-primary" stroke={1.75} aria-hidden />
        <p className="text-[15px] font-medium text-card-foreground">
          {t("wellbeing.empty.zero.title")}
        </p>
        <Link
          href={checkInHref}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("wellbeing.empty.zero.cta")}
        </Link>
      </div>
    )
  }

  const displaySummary = { ...summary, days: displayDays }
  const selectedDay =
    selectedIndex != null ? displayDays[selectedIndex] ?? null : null

  return (
    <div className="flex flex-col gap-6">
      <WeeklyWeatherCard
        summary={displaySummary}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />
      <DayReflectionCard day={selectedDay} />
      {summary.hasSleepData && <RestSummaryCard summary={summary} />}
      <DetailedTrendsPanel entries={entries} />
    </div>
  )
}
