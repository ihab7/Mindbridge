"use client"

import { useEffect, useMemo, useState } from "react"
import { IconChevronDown, IconPill, IconCalendarOff } from "@tabler/icons-react"
import { useT } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import type { DayFlag, DayRecord, DayTone, ProgressView } from "@/lib/wellbeing/progressModel"
import type { ProgressFormat } from "./format"

const INITIAL_ROWS = 7

type Row = { kind: "day"; day: DayRecord } | { kind: "gap"; dates: string[] }

/** Newest first; consecutive days without a check-in collapse into one row. */
function toRows(days: DayRecord[]): Row[] {
  const rows: Row[] = []
  for (const day of [...days].reverse()) {
    const last = rows[rows.length - 1]
    if (!day.entry && day.breathing.length === 0 && day.program.length === 0) {
      if (last?.kind === "gap") last.dates.unshift(day.date)
      else rows.push({ kind: "gap", dates: [day.date] })
    } else rows.push({ kind: "day", day })
  }
  return rows
}

const TONE_BAR: Record<DayTone, string> = {
  good: "bg-primary/50",
  steady: "bg-border",
  difficult: "bg-[hsl(var(--progress-attention))]",
  missing: "bg-transparent",
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <span className="relative hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted md:inline-block" aria-hidden>
      <span className="absolute inset-y-0 start-0 rounded-full" style={{ width: `${value * 10}%`, backgroundColor: color }} />
    </span>
  )
}

export function DailyTimeline({
  view,
  fmt,
  highlight,
  onOpenDay,
}: {
  view: ProgressView
  fmt: ProgressFormat
  highlight: string[]
  onOpenDay: (date: string) => void
}) {
  const t = useT()
  const rows = useMemo(() => toRows(view.days), [view.days])
  const [expanded, setExpanded] = useState(false)

  // A signal pointing at older days opens the full list so the rows exist to scroll to.
  const highlightKey = highlight.join(",")
  useEffect(() => {
    if (highlight.length === 0) return
    const index = rows.findIndex((r) => (r.kind === "day" ? highlight.includes(r.day.date) : r.dates.some((d) => highlight.includes(d))))
    if (index >= INITIAL_ROWS) setExpanded(true)
    requestAnimationFrame(() => {
      const target = document.getElementById(`progress-row-${highlight[highlight.length - 1]}`) ?? document.getElementById(`progress-row-${highlight[0]}`)
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightKey])

  const shown = expanded ? rows : rows.slice(0, INITIAL_ROWS)
  const flagLabel = (f: DayFlag) => t(`practitioner.progress.flag.${f}`)

  return (
    <section aria-labelledby="progress-daily-title" className="mb-card rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="progress-daily-title" className="text-base font-semibold text-card-foreground">
          {t("practitioner.progress.daily.title")}
        </h3>
        <p className="text-xs text-muted-foreground">{t("practitioner.progress.daily.subtitle")}</p>
      </div>

      <ol className="mt-4 flex flex-col gap-1.5">
        {shown.map((row) => {
          if (row.kind === "gap") {
            const hl = row.dates.some((d) => highlight.includes(d))
            const label =
              row.dates.length === 1
                ? t("practitioner.progress.daily.noCheckIn")
                : t("practitioner.progress.daily.noCheckInRange", { count: row.dates.length })
            return (
              <li
                key={`gap-${row.dates[0]}`}
                id={`progress-row-${row.dates[row.dates.length - 1]}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground",
                  hl && "ring-2 ring-[hsl(var(--progress-attention)/0.6)]",
                )}
              >
                {/* Extra ids so every missing date in the group can be scrolled to. */}
                {row.dates.slice(0, -1).map((d) => <span key={d} id={`progress-row-${d}`} className="hidden" />)}
                <IconCalendarOff size={16} stroke={1.75} className="shrink-0" aria-hidden />
                <span className="font-medium">{fmt.dates(row.dates)}</span>
                <span>· {label}</span>
              </li>
            )
          }

          const day = row.day
          const e = day.entry
          const reading = view.readings[day.date]
          const hl = highlight.includes(day.date)
          const flags = reading?.flags.filter((f) => f !== "missedDose") ?? []
          return (
            <li key={day.date} id={`progress-row-${day.date}`}>
              <button
                type="button"
                onClick={() => onOpenDay(day.date)}
                className={cn(
                  "group relative flex w-full flex-col gap-2 overflow-hidden rounded-xl bg-muted/40 py-3 pe-4 ps-5 text-start outline-none ring-ring transition-colors hover:bg-muted focus-visible:ring-2 sm:flex-row sm:items-center sm:gap-4",
                  hl && "ring-2 ring-[hsl(var(--progress-attention)/0.6)]",
                )}
              >
                <span className={cn("absolute inset-y-2 start-1.5 w-1 rounded-full", TONE_BAR[reading?.tone ?? "steady"])} aria-hidden />
                <span className="sr-only">{t(`practitioner.progress.tone.${reading?.tone ?? "steady"}`)}</span>

                <span className="flex w-28 shrink-0 flex-col">
                  <span className="text-xs capitalize text-muted-foreground">{fmt.weekday(day.date)}</span>
                  <span className="text-sm font-medium text-card-foreground">{fmt.dayMonth(day.date)}</span>
                </span>

                {e ? (
                  <span className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t("practitioner.progress.metric.mood")}</span>
                      <span className="font-semibold tabular-nums text-card-foreground">{e.mood}/10</span>
                      <ScoreBar value={e.mood} color="hsl(var(--progress-mood))" />
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">{t("practitioner.progress.metric.anxiety")}</span>
                      <span className="font-semibold tabular-nums text-card-foreground">{e.anxiety}/10</span>
                      <ScoreBar value={e.anxiety} color="hsl(var(--progress-anxiety))" />
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                        e.medicationTaken ? "bg-primary/10 text-primary" : "bg-[hsl(var(--progress-attention)/0.12)] text-[hsl(var(--progress-attention))]",
                      )}
                    >
                      <IconPill size={13} stroke={2} aria-hidden />
                      {t(e.medicationTaken ? "practitioner.progress.dose.taken" : "practitioner.progress.dose.missed")}
                    </span>
                  </span>
                ) : (
                  <span className="flex-1 text-sm text-muted-foreground">{t("practitioner.progress.daily.activityOnly")}</span>
                )}

                {flags.length > 0 && (
                  <span className="flex flex-wrap gap-1.5">
                    {flags.map((f) => (
                      <span key={f} className="rounded-full border border-[hsl(var(--progress-attention)/0.35)] px-2 py-0.5 text-xs text-[hsl(var(--progress-attention))]">
                        {flagLabel(f)}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>

      {rows.length > INITIAL_ROWS && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary outline-none ring-ring hover:bg-primary/10 focus-visible:ring-2"
        >
          <IconChevronDown size={16} stroke={2} className={cn("transition-transform motion-reduce:transition-none", expanded && "rotate-180")} aria-hidden />
          {expanded ? t("practitioner.progress.daily.showLess") : t("practitioner.progress.daily.showAll", { count: rows.length })}
        </button>
      )}
    </section>
  )
}
