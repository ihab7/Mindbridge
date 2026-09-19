"use client"

import { useRef } from "react"
import { useT } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { PERIODS, type PeriodDays } from "@/lib/wellbeing/progressModel"

/** 7 j | 14 j | 30 j — a radio group (one tab stop, arrow keys move). */
export function PeriodSelector({ value, onChange }: { value: PeriodDays; onChange: (p: PeriodDays) => void }) {
  const t = useT()
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl"
    const forward = e.key === (rtl ? "ArrowLeft" : "ArrowRight") || e.key === "ArrowDown"
    const backward = e.key === (rtl ? "ArrowRight" : "ArrowLeft") || e.key === "ArrowUp"
    if (!forward && !backward) return
    e.preventDefault()
    const next = (index + (forward ? 1 : -1) + PERIODS.length) % PERIODS.length
    onChange(PERIODS[next])
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={t("practitioner.progress.period.label")}
      className="inline-flex rounded-full bg-muted p-1"
    >
      {PERIODS.map((p, i) => {
        const selected = p === value
        return (
          <button
            key={p}
            ref={(el) => { refs.current[i] = el }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t("practitioner.progress.period.long", { count: p })}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(p)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "min-h-9 min-w-[3.25rem] rounded-full px-3 text-xs font-medium tabular-nums outline-none ring-ring transition-colors focus-visible:ring-2",
              selected ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground",
            )}
          >
            {t("practitioner.progress.period.short", { count: p })}
          </button>
        )
      })}
    </div>
  )
}
