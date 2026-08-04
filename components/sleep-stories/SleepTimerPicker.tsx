"use client"

import { useT } from "@/components/i18n-provider"

const MINUTE_OPTIONS = [15, 30, 45, 60]

export function SleepTimerPicker({
  value,
  onChange,
}: {
  /** null = tied to the end of the story (default). */
  value: number | null
  onChange: (minutes: number | null) => void
}) {
  const t = useT()

  return (
    <div
      role="radiogroup"
      aria-label={t("sleepStories.player.timer.label")}
      className="flex flex-wrap gap-2"
    >
      {MINUTE_OPTIONS.map((minutes) => {
        const selected = value === minutes
        return (
          <button
            key={minutes}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(minutes)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {t("sleepStories.player.timer.minutes", { count: minutes })}
          </button>
        )
      })}
      <button
        type="button"
        role="radio"
        aria-checked={value === null}
        onClick={() => onChange(null)}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          value === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:bg-muted"
        }`}
      >
        {t("sleepStories.player.timer.endOfStory")}
      </button>
    </div>
  )
}
