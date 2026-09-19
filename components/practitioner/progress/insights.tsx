"use client"

import {
  IconCalendarOff,
  IconChevronRight,
  IconChevronLeft,
  IconCircleCheck,
  IconMoodSad,
  IconPill,
  IconTrendingDown,
  IconTrendingUp,
  IconMoon,
  IconActivityHeartbeat,
  type IconProps,
} from "@tabler/icons-react"
import type { ComponentType } from "react"
import { useI18n, useT } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import type { ProgressView, Signal, SignalKind } from "@/lib/wellbeing/progressModel"
import type { ProgressFormat } from "./format"

const PANEL = "mb-card rounded-2xl border border-border/70 bg-card p-5 sm:p-6"

// ── What changed? ──────────────────────────────────────────────────────────
export function PeriodComparison({ view, fmt }: { view: ProgressView; fmt: ProgressFormat }) {
  const t = useT()
  const { period, stats, previous, deltas, directions, hasBaseline } = view

  const rows: { label: string; value: string; delta: string | null }[] = [
    {
      label: t("practitioner.progress.metric.mood"),
      value: fmt.score(stats.moodAvg),
      delta: deltas.mood == null ? null : t("practitioner.progress.changed.points", { value: fmt.signed(deltas.mood) }),
    },
    {
      label: t("practitioner.progress.metric.anxiety"),
      value: fmt.score(stats.anxietyAvg),
      delta: deltas.anxiety == null ? null : t("practitioner.progress.changed.points", { value: fmt.signed(deltas.anxiety) }),
    },
    {
      label: t("practitioner.progress.metric.adherence"),
      value: stats.adherencePct == null ? "—" : `${fmt.int(stats.adherencePct)} %`,
      delta: deltas.adherence == null ? null : `${fmt.signedInt(deltas.adherence)} %`,
    },
    {
      label: t("practitioner.progress.changed.checkIns"),
      value: t("practitioner.progress.changed.checkInsValue", { count: stats.checkIns, total: period }),
      delta: hasBaseline && deltas.checkIns != null ? fmt.signedInt(deltas.checkIns) : null,
    },
  ]

  // Short observable sentences — what moved, by how much. No interpretation.
  const sentences: string[] = []
  if (hasBaseline) {
    for (const key of ["mood", "anxiety"] as const) {
      const dir = directions[key]
      const delta = deltas[key]
      if (dir === "up" || dir === "down") {
        sentences.push(t(`practitioner.progress.changed.sentence.${key}.${dir}`, { value: fmt.score(Math.abs(delta ?? 0)) }))
      } else if (dir === "flat") {
        sentences.push(t(`practitioner.progress.changed.sentence.${key}.flat`))
      }
    }
  }
  sentences.push(t("practitioner.progress.changed.sentence.checkIns", { count: stats.checkIns, total: period }))

  return (
    <section aria-labelledby="progress-changed-title" className={PANEL}>
      <h3 id="progress-changed-title" className="text-base font-semibold text-card-foreground">
        {t("practitioner.progress.changed.title")}
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {hasBaseline
          ? t("practitioner.progress.changed.subtitle", { days: period })
          : t("practitioner.progress.changed.noBaseline", { days: period, count: previous.checkIns })}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map((r) => (
          <div key={r.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{r.label}</dt>
            <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-lg font-semibold tabular-nums text-card-foreground">{r.value}</span>
              {r.delta && <span className="text-xs tabular-nums text-muted-foreground">{r.delta}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 border-t border-border/60 pt-3 text-sm leading-relaxed text-card-foreground">{sentences.join(" ")}</p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{t("practitioner.progress.changed.disclaimer")}</p>
    </section>
  )
}

// ── Signals ────────────────────────────────────────────────────────────────
const SIGNAL_ICON: Record<SignalKind, ComponentType<IconProps>> = {
  moodDecline: IconTrendingDown,
  anxietyIncrease: IconTrendingUp,
  lowMoodDays: IconMoodSad,
  highAnxietyDays: IconActivityHeartbeat,
  suddenChange: IconActivityHeartbeat,
  missedDoses: IconPill,
  checkInGap: IconCalendarOff,
  shortSleep: IconMoon,
}

function signalText(s: Signal, t: (k: string, v?: Record<string, string | number>) => string, fmt: ProgressFormat) {
  const k = `practitioner.progress.signal.${s.kind}`
  switch (s.kind) {
    case "moodDecline":
    case "anxietyIncrease":
      return t(k, { value: fmt.score(Math.abs(s.delta ?? 0)) })
    case "missedDoses":
    case "suddenChange":
      return t(`${k}.${s.count === 1 ? "one" : "other"}`, { count: s.count ?? 0 })
    case "checkInGap":
      return t(s.ongoing ? `${k}.ongoing` : k, { count: s.count ?? 0 })
    default:
      return t(k, { count: s.count ?? 0 })
  }
}

function signalDetail(s: Signal, view: ProgressView, t: (k: string, v?: Record<string, string | number>) => string, fmt: ProgressFormat) {
  if (s.kind === "moodDecline" || s.kind === "anxietyIncrease") return t("practitioner.progress.signal.vsPrevious", { days: view.period })
  if (s.kind === "suddenChange") return `${t("practitioner.progress.signal.suddenChange.detail")} · ${fmt.dates(s.dates)}`
  return fmt.dates(s.dates)
}

export function AttentionSignals({
  view,
  fmt,
  onSelect,
}: {
  view: ProgressView
  fmt: ProgressFormat
  onSelect: (dates: string[]) => void
}) {
  const t = useT()
  const { locale } = useI18n()
  const Chevron = locale === "ar" ? IconChevronLeft : IconChevronRight
  const signals = view.signals

  return (
    <section aria-labelledby="progress-signals-title" className={PANEL}>
      <h3 id="progress-signals-title" className="text-base font-semibold text-card-foreground">
        {t("practitioner.progress.signals.title")}
      </h3>
      {signals.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <IconCircleCheck size={16} stroke={1.75} className="text-primary" aria-hidden />
          {t("practitioner.progress.signals.none")}
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {signals.map((s, i) => {
            const Icon = SIGNAL_ICON[s.kind]
            const attention = s.severity === "attention"
            return (
              <li key={`${s.kind}-${i}`}>
                <button
                  type="button"
                  onClick={() => onSelect(s.dates)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start outline-none ring-ring transition-colors focus-visible:ring-2",
                    attention ? "bg-[hsl(var(--progress-attention)/0.08)] hover:bg-[hsl(var(--progress-attention)/0.13)]" : "bg-muted/60 hover:bg-muted",
                  )}
                >
                  <Icon
                    size={18}
                    stroke={1.75}
                    className={cn("mt-0.5 shrink-0", attention ? "text-[hsl(var(--progress-attention))]" : "text-muted-foreground")}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-card-foreground">{signalText(s, t, fmt)}</span>
                    <span className="block text-xs text-muted-foreground">{signalDetail(s, view, t, fmt)}</span>
                    <span className="sr-only">
                      {t(attention ? "practitioner.progress.signals.attention" : "practitioner.progress.signals.info")}
                    </span>
                  </span>
                  <span className="mt-0.5 flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground group-hover:text-card-foreground">
                    <span className="hidden sm:inline">{t("practitioner.progress.signals.view")}</span>
                    <Chevron size={14} stroke={2} aria-hidden />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
