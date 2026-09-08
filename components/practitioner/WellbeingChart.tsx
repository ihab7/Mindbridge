"use client"

import { useState } from "react"
import { useI18n, useT } from "@/components/i18n-provider"
import type { ClinicalSummary } from "@/lib/wellbeing/clinicalSummary"

// The three chart colours are the only new hex values in this feature, per the
// spec. Everything else maps to shadcn tokens.
const MOOD = "#1D9E75"
const ANXIETY = "#BA7517"
const MISSED = "#E24B4A"

// viewBox geometry
const VB_W = 620
const VB_H = 220
const PAD_L = 32
const PAD_R = 8
const PAD_T = 10
const PAD_B = 26
const PLOT_L = PAD_L
const PLOT_R = VB_W - PAD_R
const PLOT_T = PAD_T
const PLOT_B = VB_H - PAD_B
const PLOT_W = PLOT_R - PLOT_L
const PLOT_H = PLOT_B - PLOT_T

type Series = ClinicalSummary["series"]

export function WellbeingChart({ series }: { series: Series }) {
  const { locale } = useI18n()
  const t = useT()
  const [hover, setHover] = useState<number | null>(null)

  const n = series.dates.length
  const xFmt = new Intl.DateTimeFormat(locale, { month: "numeric", day: "numeric" })
  const readoutFmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" })

  const x = (i: number) => (n <= 1 ? PLOT_L + PLOT_W / 2 : PLOT_L + (i / (n - 1)) * PLOT_W)
  const y = (v: number) => PLOT_B - ((v - 1) / 9) * PLOT_H

  // Build path "d" for a series, breaking at nulls so gaps are never bridged.
  function pathFor(values: (number | null)[]): string {
    let d = ""
    let penDown = false
    for (let i = 0; i < values.length; i++) {
      const v = values[i]
      if (v == null) {
        penDown = false
        continue
      }
      d += `${penDown ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)} `
      penDown = true
    }
    return d.trim()
  }

  const gridValues = [2, 4, 6, 8, 10]

  const readout = (() => {
    if (hover == null) return null
    const parts: string[] = [readoutFmt.format(new Date(`${series.dates[hover]}T00:00:00`))]
    const m = series.mood[hover]
    const a = series.anxiety[hover]
    const s = series.sleepHours[hover]
    if (m != null) parts.push(t("practitioner.wellbeing.readout.mood", { value: m }))
    if (a != null) parts.push(t("practitioner.wellbeing.readout.anxiety", { value: a }))
    if (s != null) parts.push(t("practitioner.wellbeing.readout.sleep", { value: s }))
    if (series.mood[hover] != null && series.doseMissed[hover])
      parts.push(t("practitioner.wellbeing.readout.doseMissed"))
    return parts.join(" · ")
  })()

  return (
    <div>
      {/* Legend — right-aligned above the chart */}
      <div className="mb-2 flex justify-end gap-4 text-[11px] text-muted-foreground">
        <LegendItem color={MOOD} label={t("practitioner.wellbeing.legend.mood")} />
        <LegendItem color={ANXIETY} label={t("practitioner.wellbeing.legend.anxiety")} />
        <LegendItem color={MISSED} label={t("practitioner.wellbeing.legend.doseMissed")} square />
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width="100%"
        height="auto"
        role="img"
        aria-label={t("practitioner.wellbeing.chart.aria")}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHover(null)
        }}
      >
        {/* 1. Missed-dose columns behind everything */}
        {series.doseMissed.map((missed, i) =>
          series.mood[i] != null && missed ? (
            <rect
              key={`band-${i}`}
              x={x(i) - 6}
              y={PLOT_T}
              width={12}
              height={PLOT_H}
              fill={MISSED}
              fillOpacity={0.13}
            />
          ) : null,
        )}

        {/* 2. Gridlines + y labels */}
        {gridValues.map((v) => (
          <g key={`grid-${v}`}>
            <line
              x1={PLOT_L}
              x2={PLOT_R}
              y1={y(v)}
              y2={y(v)}
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              x={PLOT_L - 6}
              y={y(v) + 3}
              textAnchor="end"
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
            >
              {v}
            </text>
          </g>
        ))}

        {/* x-axis date labels every other day */}
        {series.dates.map((iso, i) =>
          i % 2 === 0 ? (
            <text
              key={`xl-${i}`}
              x={x(i)}
              y={PLOT_B + 14}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
            >
              {xFmt.format(new Date(`${iso}T00:00:00`))}
            </text>
          ) : null,
        )}

        {/* 3. Anxiety line */}
        <path
          d={pathFor(series.anxiety)}
          fill="none"
          stroke={ANXIETY}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 4. Mood line */}
        <path
          d={pathFor(series.mood)}
          fill="none"
          stroke={MOOD}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. Data points */}
        {series.anxiety.map((v, i) =>
          v != null ? <circle key={`ap-${i}`} cx={x(i)} cy={y(v)} r={3} fill={ANXIETY} /> : null,
        )}
        {series.mood.map((v, i) =>
          v != null ? <circle key={`mp-${i}`} cx={x(i)} cy={y(v)} r={3} fill={MOOD} /> : null,
        )}

        {/* 6. Missed-dose markers at the bottom axis */}
        {series.doseMissed.map((missed, i) =>
          series.mood[i] != null && missed ? (
            <rect key={`mm-${i}`} x={x(i) - 4} y={PLOT_B - 3} width={8} height={6} rx={1.5} fill={MISSED} />
          ) : null,
        )}

        {/* Hover highlight for the active day */}
        {hover != null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={PLOT_T}
            y2={PLOT_B}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
        )}

        {/* 7. Transparent hover/tap targets per day */}
        {series.dates.map((_, i) => (
          <rect
            key={`hit-${i}`}
            x={x(i) - 10}
            y={PLOT_T}
            width={20}
            height={PLOT_H}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onPointerEnter={() => setHover(i)}
            onPointerDown={() => setHover(i)}
          />
        ))}
      </svg>

      {/* Readout line below the chart (fixed height so layout doesn't jump) */}
      <p className="mt-1 min-h-[20px] text-[13px] text-card-foreground">
        {readout ?? (
          <span className="text-muted-foreground">{t("practitioner.wellbeing.readout.hint")}</span>
        )}
      </p>
    </div>
  )
}

function LegendItem({ color, label, square }: { color: string; label: string; square?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {square ? (
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      ) : (
        <span className="inline-block h-0.5 w-4 rounded-full" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  )
}
