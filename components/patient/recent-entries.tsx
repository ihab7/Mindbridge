"use client"

import { useEffect, useState } from "react"
import { IconChevronDown, IconCheck, IconMinus } from "@tabler/icons-react"
import { useI18n, useT } from "@/components/i18n-provider"

const STORAGE_KEY = "mb_entries_expanded"

export type RecentEntryDay = {
  /** YYYY-MM-DD, already bucketed per calendar day server-side. */
  date: string
  mood: number
  sleepHours: number
  medicationTaken: boolean
}

// Dates arrive as plain YYYY-MM-DD and are anchored at noon before any
// formatting: parsing a bare date string would land on UTC midnight and a
// negative timezone offset would then render the previous day.
function atNoon(dateOnly: string) {
  return new Date(`${dateOnly}T12:00:00`)
}

function daysBetween(fromDateOnly: string, toDateOnly: string) {
  return Math.round((atNoon(toDateOnly).getTime() - atNoon(fromDateOnly).getTime()) / 86400000)
}

export function RecentEntries({
  daysThisMonth,
  lastEntryDate,
  todayDate,
  entries,
}: {
  daysThisMonth: number
  lastEntryDate: string | null
  /** The server's today, so the relative labels resolve identically on both sides. */
  todayDate: string
  entries: RecentEntryDay[]
}) {
  const { locale } = useI18n()
  const t = useT()
  const [expanded, setExpanded] = useState(false)

  // Read after mount, never during render: localStorage doesn't exist on the
  // server, so branching on it in the first render would desync hydration.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "true") setExpanded(true)
    } catch {
      /* private mode / blocked storage — stay collapsed */
    }
  }, [])

  function toggle() {
    setExpanded((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function relativeDay(dateOnly: string) {
    const diff = daysBetween(dateOnly, todayDate)
    if (diff <= 0) return t("patient.entries.today")
    if (diff === 1) return t("patient.entries.yesterday")
    if (diff < 7) return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(atNoon(dateOnly))
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(atNoon(dateOnly))
  }

  const hasHistory = entries.length > 0
  const headline =
    daysThisMonth > 0
      ? t(daysThisMonth === 1 ? "patient.entries.summaryOne" : "patient.entries.summary", { count: daysThisMonth })
      : t("patient.entries.none")

  // No entry ever recorded: nothing to expand, so the card is inert.
  const subline =
    lastEntryDate === null
      ? t("patient.entries.encourage")
      : t("patient.entries.lastNote", { when: relativeDay(lastEntryDate) })

  const numberFmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })

  return (
    <div className="rounded-xl border border-border bg-card">
      <div
        role={hasHistory ? "button" : undefined}
        tabIndex={hasHistory ? 0 : undefined}
        aria-expanded={hasHistory ? expanded : undefined}
        onClick={hasHistory ? toggle : undefined}
        onKeyDown={
          hasHistory
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggle()
                }
              }
            : undefined
        }
        className={`flex items-center gap-3 p-5 ${hasHistory ? "cursor-pointer" : ""}`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-card-foreground">{headline}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{subline}</p>
        </div>
        {hasHistory && (
          <IconChevronDown
            size={18}
            stroke={2}
            aria-hidden
            className={`shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {hasHistory && expanded && (
        <div className="border-t border-border px-5 py-1">
          {entries.map((entry) => (
            <div
              key={entry.date}
              className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0"
            >
              <span className="min-w-0 flex-1 truncate text-[14px] text-primary">
                {new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(
                  atNoon(entry.date),
                )}
              </span>
              <span className="flex shrink-0 items-center gap-[14px] text-[13px] text-muted-foreground">
                <span>{t("patient.entries.moodValue", { value: entry.mood })}</span>
                <span>{t("patient.entries.sleepValue", { hours: numberFmt.format(entry.sleepHours) })}</span>
                {/* Neutral dash, never red: a missed dose is information, not a verdict. */}
                {entry.medicationTaken ? (
                  <IconCheck size={15} stroke={2} aria-hidden />
                ) : (
                  <IconMinus size={15} stroke={2} aria-hidden />
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
