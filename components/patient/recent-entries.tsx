"use client"

import { Moon, Pill, Brain, TrendingUp } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import {
  formatSideEffectsForDisplay,
  parseSideEffectsFromDb,
} from "@/lib/side-effects"

type Entry = {
  id: number
  mood: number
  anxiety: number
  sleep_hours: number
  medication_taken: boolean
  side_effects?: string[]
  side_effects_other?: string | null
  side_effects_legacy?: string | null
  challenges: string
  achievements: string
  created_at: string
}

function moodColor(mood: number) {
  if (mood <= 3) return "text-destructive bg-destructive/10"
  if (mood <= 5) return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/15"
  if (mood <= 7) return "text-primary bg-primary/10"
  return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/15"
}

export function RecentEntries({ entries }: { entries: Entry[] }) {
  const { locale } = useI18n()
  const t = useT()

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t("patient.entries.empty")}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-1 text-lg font-semibold text-card-foreground">{t("patient.entries.title")}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{t("patient.entries.subtitle", { count: entries.length })}</p>
      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-border bg-background p-4"
          >
            {(() => {
              const parsed = parseSideEffectsFromDb(
                entry.side_effects,
                entry.side_effects_other,
                entry.side_effects_legacy
              )
              const formatted = formatSideEffectsForDisplay(parsed)
              return formatted ? (
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-medium text-card-foreground">{t("patient.entries.sideEffects")}</span> {formatted}
                </p>
              ) : null
            })()}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <time className="text-sm font-medium text-card-foreground">
                {new Date(entry.created_at).toLocaleDateString(locale, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${moodColor(Number(entry.mood))}`}> 
                  <Brain className="h-3 w-3" />
                  {t("patient.entries.moodValue", { value: entry.mood })}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  {t("patient.entries.anxietyValue", { value: entry.anxiety })}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Moon className="h-3 w-3" />
                {t("patient.entries.sleepHours", { hours: entry.sleep_hours })}
              </span>
              <span className={`inline-flex items-center gap-1 ${entry.medication_taken ? "text-primary" : "text-destructive"}`}>
                <Pill className="h-3 w-3" />
                {entry.medication_taken ? t("patient.entries.medTaken") : t("patient.entries.medMissed")}
              </span>
            </div>
            {(entry.challenges || entry.achievements) && (
              <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
                {entry.challenges && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-card-foreground">{t("patient.entries.challenge")}</span> {entry.challenges}
                  </p>
                )}
                {entry.achievements && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-card-foreground">{t("patient.entries.win")}</span> {entry.achievements}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
