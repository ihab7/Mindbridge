"use client"

import { useRef } from "react"
import { useT } from "@/components/i18n-provider"
import type { WeeklySummary } from "@/lib/wellbeing/weeklySummary"
import { WeatherIcon } from "./weather-icon"

export function WeeklyWeatherCard({
  summary,
  selectedIndex,
  onSelect,
}: {
  summary: WeeklySummary
  selectedIndex: number | null
  onSelect: (index: number) => void
}) {
  const t = useT()
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Left/right arrows move between days (and follow focus), mirrored under RTL.
  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let next: number | null = null
    if (e.key === "ArrowRight") next = index + 1
    else if (e.key === "ArrowLeft") next = index - 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = summary.days.length - 1
    if (next == null) return
    e.preventDefault()
    const clamped = Math.max(0, Math.min(summary.days.length - 1, next))
    onSelect(clamped)
    buttonRefs.current[clamped]?.focus()
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-[13px] text-muted-foreground">{t("wellbeing.label")}</p>
      <h3 className="mt-1 text-lg font-medium leading-[1.5] text-card-foreground">
        {summary.headline}
      </h3>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">{summary.subline}</p>

      <div
        role="group"
        aria-label={t("wellbeing.label")}
        className="flex gap-2.5"
      >
        {summary.days.map((day, index) => {
          const selected = selectedIndex === index
          return (
            <button
              key={day.date}
              type="button"
              ref={(el) => {
                buttonRefs.current[index] = el
              }}
              onClick={() => onSelect(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-pressed={selected}
              aria-label={`${day.dayFull}, ${day.reflection}`}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-[10px] px-1 py-2.5 transition-colors ${
                selected ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <WeatherIcon weather={day.weather} />
              <span className="text-[11px] text-muted-foreground">{day.dayLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
