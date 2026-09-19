"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IconCalendarOff, IconInfoCircle, IconMessageCircle } from "@tabler/icons-react"
import { useT } from "@/components/i18n-provider"
import { buildDays, buildProgressView, type PeriodDays, type ProgressInput } from "@/lib/wellbeing/progressModel"
import { useProgressFormat } from "./format"
import { OverviewCards } from "./overview-cards"
import { TrendsCard } from "./trend-charts"
import { AttentionSignals, PeriodComparison } from "./insights"
import { DailyTimeline } from "./daily-timeline"
import { DayDetailDrawer } from "./day-detail-drawer"

// Practitioner view of a patient's recent evolution, ordered for a quick read
// before a consultation:
//   current state → recent trend → what changed → which days → day details.
// All figures come from the patient's own check-ins; the section describes,
// it never concludes (MindBridge signals, it does not diagnose).
export function PatientProgress({ input, messageHref }: { input: ProgressInput; messageHref: string }) {
  const t = useT()
  const fmt = useProgressFormat()
  const [period, setPeriod] = useState<PeriodDays>(14)
  const [active, setActive] = useState<number | null>(null)
  const [openDate, setOpenDate] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string[]>([])

  const allDays = useMemo(() => buildDays(input), [input])
  const view = useMemo(() => buildProgressView(allDays, period), [allDays, period])
  const anyData = allDays.some((d) => d.entry)

  function changePeriod(p: PeriodDays) {
    setPeriod(p)
    setActive(null)
    setHighlight([])
  }

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("practitioner.progress.title")}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {view.latest
            ? t("practitioner.progress.lastCheckIn", { when: fmt.whenAgo(view.latest.daysAgo) })
            : t("practitioner.progress.noCheckInYet")}
        </p>
      </div>
      <Link
        href={messageHref}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
      >
        <IconMessageCircle size={16} stroke={2} aria-hidden />
        {t("practitioner.wellbeing.header.message")}
      </Link>
    </div>
  )

  if (!anyData) {
    return (
      <section className="mb-progress flex flex-col gap-4" aria-label={t("practitioner.progress.title")}>
        {header}
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-8">
          <IconCalendarOff size={22} stroke={1.5} className="shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{t("practitioner.progress.empty")}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-progress flex flex-col gap-5" aria-label={t("practitioner.progress.title")}>
      {header}

      {view.stats.checkIns < 4 && (
        <p className="flex items-start gap-2 rounded-xl bg-muted/70 px-4 py-2.5 text-sm text-muted-foreground">
          <IconInfoCircle size={16} stroke={1.75} className="mt-0.5 shrink-0" aria-hidden />
          {t("practitioner.progress.thin", { count: view.stats.checkIns, total: period })}
        </p>
      )}

      {/* 1. Current state */}
      <OverviewCards view={view} fmt={fmt} />

      {/* 2–4. Trend, what changed, what deserves attention */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <TrendsCard
          view={view}
          period={period}
          onPeriodChange={changePeriod}
          active={active}
          setActive={setActive}
          onOpenDay={setOpenDate}
          fmt={fmt}
        />
        <div className="flex min-w-0 flex-col gap-5">
          <PeriodComparison view={view} fmt={fmt} />
          <AttentionSignals view={view} fmt={fmt} onSelect={setHighlight} />
        </div>
      </div>

      {/* 5. Day by day */}
      <DailyTimeline view={view} fmt={fmt} highlight={highlight} onOpenDay={setOpenDate} />

      <DayDetailDrawer view={view} date={openDate} onDateChange={setOpenDate} fmt={fmt} />
    </section>
  )
}

/** Suspense fallback, shaped like the section so nothing jumps when data lands. */
export function PatientProgressSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5 motion-reduce:animate-none" aria-hidden>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-3.5 w-52 rounded bg-muted" />
        </div>
        <div className="h-10 w-28 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[124px] rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="h-[420px] rounded-2xl bg-muted" />
        <div className="flex flex-col gap-5">
          <div className="h-[220px] rounded-2xl bg-muted" />
          <div className="h-[180px] rounded-2xl bg-muted" />
        </div>
      </div>
      <div className="h-[280px] rounded-2xl bg-muted" />
    </div>
  )
}
