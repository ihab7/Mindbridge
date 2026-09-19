"use client"

import { IconArrowDownRight, IconArrowUpRight, IconMinus } from "@tabler/icons-react"
import { useT } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import type { Direction, ProgressView } from "@/lib/wellbeing/progressModel"
import type { ProgressFormat } from "./format"

// Is this direction good news for this metric? Mood up = good, anxiety up =
// worth a look. Colour stays restrained: calm teal for favourable, soft amber
// for "worth a look", muted for everything else — never alarm red.
type Tone = "favourable" | "watch" | "neutral"
function toneFor(dir: Direction, higherIsBetter: boolean): Tone {
  if (dir === "up") return higherIsBetter ? "favourable" : "watch"
  if (dir === "down") return higherIsBetter ? "watch" : "favourable"
  return "neutral"
}
const TONE_TEXT: Record<Tone, string> = {
  favourable: "text-primary",
  watch: "text-[hsl(var(--progress-attention))]",
  neutral: "text-muted-foreground",
}

function TrendLine({ dir, delta, higherIsBetter, fmt, unit = "points" }: {
  dir: Direction
  delta: number | null
  higherIsBetter: boolean
  fmt: ProgressFormat
  unit?: "points" | "percent"
}) {
  const t = useT()
  const tone = toneFor(dir, higherIsBetter)
  const Icon = dir === "up" ? IconArrowUpRight : dir === "down" ? IconArrowDownRight : IconMinus
  if (dir === "none") return <p className="text-xs text-muted-foreground">{t("practitioner.progress.trend.none")}</p>
  const deltaText = delta == null ? "" : unit === "percent" ? `${fmt.signedInt(delta)} %` : fmt.signed(delta)
  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 text-xs font-medium", TONE_TEXT[tone])}>
      <Icon size={14} stroke={2} aria-hidden />
      <span>{t(`practitioner.progress.trend.${dir}`)}</span>
      {dir !== "flat" && deltaText && <span className="font-normal text-muted-foreground">({deltaText})</span>}
    </p>
  )
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-card flex min-w-0 flex-col gap-1.5 rounded-2xl border border-border/70 bg-card px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

export function OverviewCards({ view, fmt }: { view: ProgressView; fmt: ProgressFormat }) {
  const t = useT()
  const { latest, stats, deltas, directions, period } = view
  const latestInPeriod = latest && latest.daysAgo < period ? latest : null

  const scoreCard = (key: "mood" | "anxiety", higherIsBetter: boolean) => {
    const value = latestInPeriod ? latestInPeriod.entry[key] : null
    const avg = key === "mood" ? stats.moodAvg : stats.anxietyAvg
    return (
      <Card label={t(`practitioner.progress.metric.${key}`)}>
        <p className="text-3xl font-semibold tabular-nums text-card-foreground">
          {value == null ? "—" : fmt.int(value)}
          <span className="ms-1 text-base font-normal text-muted-foreground">/ 10</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {latestInPeriod
            ? t("practitioner.progress.card.latest", { when: fmt.whenAgo(latestInPeriod.daysAgo) })
            : t("practitioner.progress.card.noCheckIn")}
          {avg != null && <> · {t("practitioner.progress.card.average", { days: period, value: fmt.score(avg) })}</>}
        </p>
        <TrendLine dir={directions[key]} delta={deltas[key]} higherIsBetter={higherIsBetter} fmt={fmt} />
      </Card>
    )
  }

  const overallTone =
    view.overall === "improving" ? "text-primary" : view.overall === "watch" ? "text-[hsl(var(--progress-attention))]" : "text-card-foreground"
  const attentionCount = view.signals.filter((s) => s.severity === "attention").length
  const dirWord = (d: Direction) => t(`practitioner.progress.dir.${d === "none" ? "flat" : d}`)
  const overallReason =
    view.overall === "watch"
      ? attentionCount === 1
        ? t("practitioner.progress.overall.reason.watchOne")
        : t("practitioner.progress.overall.reason.watchOther", { count: attentionCount })
      : view.overall === "insufficient"
        ? t("practitioner.progress.overall.reason.insufficient", { count: stats.checkIns, total: period })
        : view.overall === "noBaseline"
          ? t("practitioner.progress.overall.reason.noBaseline")
          : t("practitioner.progress.overall.reason.trends", { mood: dirWord(directions.mood), anxiety: dirWord(directions.anxiety) })

  return (
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
      {scoreCard("mood", true)}
      {scoreCard("anxiety", false)}

      <Card label={t("practitioner.progress.metric.adherence")}>
        <p className="text-3xl font-semibold tabular-nums text-card-foreground">
          {stats.adherencePct == null ? "—" : `${fmt.int(stats.adherencePct)} %`}
        </p>
        <p className="text-xs text-muted-foreground">
          {stats.checkIns === 0
            ? t("practitioner.progress.card.noCheckIn")
            : stats.missedDoses === 0
              ? t("practitioner.progress.adherence.none")
              : stats.missedDoses === 1
                ? t("practitioner.progress.adherence.one")
                : t("practitioner.progress.adherence.other", { count: stats.missedDoses })}
        </p>
        <TrendLine dir={directions.adherence} delta={deltas.adherence} higherIsBetter fmt={fmt} unit="percent" />
      </Card>

      <Card label={t("practitioner.progress.metric.overall")}>
        <p className={cn("text-xl font-semibold leading-tight", overallTone)}>{t(`practitioner.progress.overall.${view.overall}`)}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{overallReason}</p>
      </Card>
    </div>
  )
}
