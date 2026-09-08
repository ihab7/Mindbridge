"use client"

import { IconMoon } from "@tabler/icons-react"
import { useT } from "@/components/i18n-provider"
import type { WeeklySummary } from "@/lib/wellbeing/weeklySummary"

// Rest + routine, phrased as a single neutral sentence. Adherence is expressed
// only as "n days out of total" — never a percentage, a red bar, or a "missed"
// label.
export function RestSummaryCard({ summary }: { summary: WeeklySummary }) {
  const t = useT()

  const avg = summary.sleepAvgHours ?? 0
  const allDays =
    summary.routineTotalDays > 0 && summary.routineKeptDays === summary.routineTotalDays

  const sentence = allDays
    ? t("wellbeing.rest.sentenceAllDays", { avg })
    : t("wellbeing.rest.sentence", {
        avg,
        n: summary.routineKeptDays,
        total: summary.routineTotalDays,
      })

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-[13px] text-muted-foreground">{t("wellbeing.rest.label")}</p>
      <div className="mt-2 flex items-start gap-2">
        <IconMoon size={20} className="mt-0.5 shrink-0 text-muted-foreground" stroke={1.75} aria-hidden />
        <p className="text-sm leading-relaxed text-card-foreground">{sentence}</p>
      </div>
    </div>
  )
}
