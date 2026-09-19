"use client"

import { useEffect, useRef, useState } from "react"
import { useT } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import type { DayRecord, ProgressView } from "@/lib/wellbeing/progressModel"
import type { ProgressFormat } from "./format"
import { PeriodSelector } from "./period-selector"
import type { PeriodDays } from "@/lib/wellbeing/progressModel"

// Pixel-based SVG (measured with ResizeObserver) rather than a scaled viewBox,
// so labels stay the same crisp size from a 390 px phone to a 1440 px screen.
// Days are bands: every chart and the dose strip share the same x-scale, so a
// day lines up vertically across all three.
const PAD_START = 26
const PAD_END = 10

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

function bandX(width: number, n: number) {
  const plotW = Math.max(0, width - PAD_START - PAD_END)
  const step = n > 0 ? plotW / n : 0
  return { step, x: (i: number) => PAD_START + step * (i + 0.5) }
}

/** Monotone cubic (Fritsch–Carlson): smooth, never overshoots the real values. */
function monotonePath(pts: { x: number; y: number }[]): string {
  const n = pts.length
  if (n < 2) return ""
  const d: number[] = []
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1].y - pts[i].y) / (pts[i + 1].x - pts[i].x))
  const m: number[] = new Array(n)
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b
    if (s > 9) { const tau = 3 / Math.sqrt(s); m[i] = tau * a * d[i]; m[i + 1] = tau * b * d[i] }
  }
  let path = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < n - 1; i++) {
    const h = (pts[i + 1].x - pts[i].x) / 3
    path += ` C${(pts[i].x + h).toFixed(1)} ${(pts[i].y + m[i] * h).toFixed(1)} ${(pts[i + 1].x - h).toFixed(1)} ${(pts[i + 1].y - m[i + 1] * h).toFixed(1)} ${pts[i + 1].x.toFixed(1)} ${pts[i + 1].y.toFixed(1)}`
  }
  return path
}

type Interaction = {
  active: number | null
  setActive: (i: number | null) => void
  open: (i: number) => void
}

/** Pointer → day index, shared by the charts and the strip. */
function usePointerDay(width: number, n: number, { active, setActive, open }: Interaction) {
  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const { step } = bandX(width, n)
    if (!step) return null
    const i = Math.floor((e.clientX - rect.left - PAD_START) / step)
    return i < 0 || i >= n ? null : i
  }
  return {
    onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.pointerType === "mouse") setActive(pick(e))
    },
    onPointerLeave: (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.pointerType === "mouse") setActive(null)
    },
    // Touch: first tap selects the day (readout), a second tap on it opens it.
    // Mouse: click opens directly (hover already showed the readout).
    onPointerUp: (e: React.PointerEvent<SVGSVGElement>) => {
      const i = pick(e)
      if (i == null) return
      if (e.pointerType !== "mouse" && active !== i) setActive(i)
      else open(i)
    },
  }
}

function MetricChart({
  days,
  metric,
  label,
  color,
  average,
  height,
  interaction,
  fmt,
}: {
  days: DayRecord[]
  metric: "mood" | "anxiety"
  label: string
  color: string
  average: string
  height: number
  interaction: Interaction
  fmt: ProgressFormat
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const n = days.length
  const { step, x } = bandX(width, n)
  const top = 8
  // The plot ends above a thin "no entry" track: missing days sit there as
  // neutral rings, apart from the 1–10 scale, so they never read as a score.
  const bottom = height - 22
  const trackY = height - 7
  const y = (v: number) => bottom - ((v - 1) / 9) * (bottom - top)
  const pointer = usePointerDay(width, n, interaction)
  const active = interaction.active
  const ringR = n > 20 ? 2.25 : 3

  // Solid curves only through consecutive recorded days. Between two recorded
  // days separated by missing ones, a straight neutral dotted connector keeps
  // the timeline continuous without suggesting any measured value in between.
  const segments: { x: number; y: number }[][] = []
  const bridges: { x1: number; y1: number; x2: number; y2: number }[] = []
  let run: { x: number; y: number }[] = []
  let lastLogged: { i: number; x: number; y: number } | null = null
  days.forEach((d, i) => {
    if (!d.entry) {
      if (run.length) { segments.push(run); run = [] }
      return
    }
    const p = { x: x(i), y: y(d.entry[metric]) }
    if (lastLogged && lastLogged.i < i - 1) bridges.push({ x1: lastLogged.x, y1: lastLogged.y, x2: p.x, y2: p.y })
    run.push(p)
    lastLogged = { i, ...p }
  })
  if (run.length) segments.push(run)

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{average}</p>
      </div>
      <div ref={ref} className="relative w-full" dir="ltr">
        {width > 0 && (
          <svg width={width} height={height} className="block touch-manipulation select-none" aria-hidden {...pointer}>
            {/* Scale: just 1, 5 and 10, one quiet midline. */}
            <line x1={PAD_START} x2={width - PAD_END} y1={y(5)} y2={y(5)} stroke="hsl(var(--border))" strokeDasharray="2 4" />
            {[1, 5, 10].map((v) => (
              <text key={v} x={PAD_START - 8} y={y(v) + 3.5} textAnchor="end" fontSize={11} fill="hsl(var(--muted-foreground))">
                {v}
              </text>
            ))}
            {active != null && (
              <rect x={x(active) - step / 2} y={top - 4} width={step} height={height - top + 2} rx={4} fill="hsl(var(--foreground))" fillOpacity={0.05} />
            )}
            {bridges.map((b, i) => (
              <line
                key={`b${i}`}
                x1={b.x1}
                y1={b.y1}
                x2={b.x2}
                y2={b.y2}
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.55}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray="0.1 5"
              />
            ))}
            {segments.map((seg, i) => (
              <path key={`s${i}`} d={monotonePath(seg)} fill="none" stroke={color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {days.map((d, i) =>
              d.entry ? (
                <circle
                  key={`p${i}`}
                  cx={x(i)}
                  cy={y(d.entry[metric])}
                  r={active === i ? 5 : n > 20 ? 2.5 : 3.25}
                  fill={color}
                  stroke="hsl(var(--card))"
                  strokeWidth={active === i ? 2 : 1}
                />
              ) : (
                <circle
                  key={`p${i}`}
                  cx={x(i)}
                  cy={trackY}
                  r={active === i ? ringR + 1 : ringR}
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={active === i ? 0.9 : 0.5}
                  strokeWidth={1.25}
                />
              ),
            )}
          </svg>
        )}
        {width === 0 && <div style={{ height }} />}
      </div>
    </div>
  )
}

function DoseStrip({ days, interaction, fmt }: { days: DayRecord[]; interaction: Interaction; fmt: ProgressFormat }) {
  const t = useT()
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const n = days.length
  const { step, x } = bandX(width, n)
  const pointer = usePointerDay(width, n, interaction)
  const cy = 12
  // Date labels at least ~48 px apart, always including the latest day.
  const every = step > 0 ? Math.max(1, Math.ceil(48 / step)) : n
  const labelled = (i: number) => (n - 1 - i) % every === 0

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-card-foreground">{t("practitioner.progress.trends.dose")}</p>
      <div ref={ref} className="w-full" dir="ltr">
        {width > 0 && (
          <svg width={width} height={40} className="block touch-manipulation select-none" aria-hidden {...pointer}>
            {interaction.active != null && (
              <rect x={x(interaction.active) - step / 2} y={0} width={step} height={24} rx={4} fill="hsl(var(--foreground))" fillOpacity={0.05} />
            )}
            {days.map((d, i) => {
              const cx = x(i)
              const r = Math.min(5, Math.max(3, step / 4))
              if (!d.entry) {
                // Same neutral ring as the charts' "no entry" track.
                const rr = n > 20 ? 2.25 : 3
                return <circle key={i} cx={cx} cy={cy} r={rr} fill="hsl(var(--card))" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} strokeWidth={1.25} />
              }
              return d.entry.medicationTaken ? (
                <circle key={i} cx={cx} cy={cy} r={r} fill="hsl(var(--progress-mood))" fillOpacity={0.45} />
              ) : (
                <circle key={i} cx={cx} cy={cy} r={r} fill="hsl(var(--card))" stroke="hsl(var(--progress-attention))" strokeWidth={2} />
              )
            })}
            {days.map((d, i) =>
              labelled(i) ? (
                <text key={`l${i}`} x={x(i)} y={36} textAnchor="middle" fontSize={11} fill="hsl(var(--muted-foreground))">
                  {fmt.axisDay(d.date)}
                </text>
              ) : null,
            )}
          </svg>
        )}
        {width === 0 && <div style={{ height: 40 }} />}
      </div>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--progress-mood)/0.45)]" aria-hidden />
          {t("practitioner.progress.legend.taken")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--progress-attention))]" aria-hidden />
          {t("practitioner.progress.legend.missed")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full border-[1.25px] border-muted-foreground/60" aria-hidden />
          {t("practitioner.progress.legend.noCheckIn")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2 border-dotted border-muted-foreground/60" aria-hidden />
          {t("practitioner.progress.legend.gap")}
        </li>
      </ul>
    </div>
  )
}

export function TrendsCard({
  view,
  period,
  onPeriodChange,
  active,
  setActive,
  onOpenDay,
  fmt,
}: {
  view: ProgressView
  period: PeriodDays
  onPeriodChange: (p: PeriodDays) => void
  active: number | null
  setActive: (i: number | null) => void
  onOpenDay: (date: string) => void
  fmt: ProgressFormat
}) {
  const t = useT()
  const days = view.days
  const interaction: Interaction = { active, setActive, open: (i) => onOpenDay(days[i].date) }
  const activeDay = active != null ? days[active] : null
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const update = () => setNarrow(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  const chartHeight = narrow ? 110 : 130

  // Keyboard: one tab stop for the whole chart area; arrows move day by day.
  function onKeyDown(e: React.KeyboardEvent) {
    const last = days.length - 1
    const current = active ?? last
    let next: number | null = null
    if (e.key === "ArrowRight") next = Math.min(last, current + (active == null ? 0 : 1))
    else if (e.key === "ArrowLeft") next = Math.max(0, current - (active == null ? 0 : 1))
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = last
    else if ((e.key === "Enter" || e.key === " ") && active != null) {
      e.preventDefault()
      onOpenDay(days[active].date)
      return
    } else if (e.key === "Escape") { setActive(null); return }
    if (next != null) { e.preventDefault(); setActive(next) }
  }

  const readout = activeDay
    ? [
        fmt.longDay(activeDay.date),
        activeDay.entry
          ? [
              t("practitioner.progress.readout.mood", { value: activeDay.entry.mood }),
              t("practitioner.progress.readout.anxiety", { value: activeDay.entry.anxiety }),
              t(activeDay.entry.medicationTaken ? "practitioner.progress.dose.taken" : "practitioner.progress.dose.missed"),
            ].join(" · ")
          : t("practitioner.progress.readout.noCheckIn"),
      ]
    : null

  return (
    <section aria-labelledby="progress-trends-title" className="mb-card flex min-w-0 flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="progress-trends-title" className="text-base font-semibold text-card-foreground">
          {t("practitioner.progress.trends.title")}
        </h3>
        <PeriodSelector value={period} onChange={onPeriodChange} />
      </div>

      {/* Readout: fixed height so the charts never jump while hovering. */}
      <div className="flex min-h-[3.25rem] items-center justify-between gap-3 rounded-xl bg-muted/60 px-4 py-2.5" aria-live="polite">
        {readout ? (
          <>
            <p className="min-w-0 text-sm">
              <span className="font-medium capitalize text-card-foreground">{readout[0]}</span>
              <span className="block text-muted-foreground sm:inline sm:before:content-['_·_']">{readout[1]}</span>
            </p>
            <button
              type="button"
              onClick={() => onOpenDay(activeDay!.date)}
              className="min-h-9 shrink-0 rounded-full border border-border bg-card px-3 text-xs font-medium text-card-foreground outline-none ring-ring transition-colors hover:bg-muted focus-visible:ring-2"
            >
              {t("practitioner.progress.readout.open")}
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("practitioner.progress.readout.hint")}</p>
        )}
      </div>

      <div
        role="group"
        tabIndex={0}
        aria-label={t("practitioner.progress.chart.aria", { days: fmt.int(days.length) })}
        onKeyDown={onKeyDown}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setActive(null) }}
        className="flex flex-col gap-5 rounded-xl outline-none ring-ring ring-offset-4 ring-offset-card focus-visible:ring-2"
      >
        <MetricChart
          days={days}
          metric="mood"
          label={t("practitioner.progress.metric.mood")}
          color="hsl(var(--progress-mood))"
          average={view.stats.moodAvg == null ? "—" : t("practitioner.progress.chart.average", { value: fmt.score(view.stats.moodAvg) })}
          height={chartHeight}
          interaction={interaction}
          fmt={fmt}
        />
        <MetricChart
          days={days}
          metric="anxiety"
          label={t("practitioner.progress.metric.anxiety")}
          color="hsl(var(--progress-anxiety))"
          average={view.stats.anxietyAvg == null ? "—" : t("practitioner.progress.chart.average", { value: fmt.score(view.stats.anxietyAvg) })}
          height={chartHeight}
          interaction={interaction}
          fmt={fmt}
        />
        <DoseStrip days={days} interaction={interaction} fmt={fmt} />
      </div>

      {/* Screen readers get the numbers as a table. */}
      {/* sr-only on a wrapper: a table cannot shrink below its content width and would widen the page. */}
      <div className="sr-only">
        <table>
          <caption>{t("practitioner.progress.chart.tableCaption", { days: days.length })}</caption>
          <thead>
            <tr>
              <th scope="col">{t("practitioner.progress.table.date")}</th>
              <th scope="col">{t("practitioner.progress.metric.mood")}</th>
              <th scope="col">{t("practitioner.progress.metric.anxiety")}</th>
              <th scope="col">{t("practitioner.progress.trends.dose")}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date}>
                <th scope="row">{fmt.longDay(d.date)}</th>
                <td>{d.entry ? `${d.entry.mood}/10` : t("practitioner.progress.readout.noCheckIn")}</td>
                <td>{d.entry ? `${d.entry.anxiety}/10` : "—"}</td>
                <td>{d.entry ? t(d.entry.medicationTaken ? "practitioner.progress.dose.taken" : "practitioner.progress.dose.missed") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

