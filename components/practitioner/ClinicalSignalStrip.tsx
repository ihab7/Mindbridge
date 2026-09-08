"use client"

import { IconArrowUpRight, IconArrowDownRight, IconMinus } from "@tabler/icons-react"
import type { ClinicalSignal, SignalTone } from "@/lib/wellbeing/clinicalSummary"

// Arrow COLOUR comes from tone, not trend: a rising mood is a success-coloured
// up arrow, a rising anxiety is a destructive-coloured up arrow. Same glyph,
// opposite meaning, carried by colour.
const TONE_CLASS: Record<SignalTone, string> = {
  danger: "text-destructive",
  warning: "text-accent",
  good: "text-primary",
  neutral: "text-muted-foreground",
}

function TrendArrow({ trend, tone }: { trend: ClinicalSignal["trend"]; tone: SignalTone }) {
  const Icon = trend === "up" ? IconArrowUpRight : trend === "down" ? IconArrowDownRight : IconMinus
  return <Icon size={15} stroke={2} className={TONE_CLASS[tone]} aria-hidden />
}

export function ClinicalSignalStrip({ signals }: { signals: ClinicalSignal[] }) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}
    >
      {signals.map((s) => (
        <div key={s.key} className="rounded-xl bg-muted px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xl font-medium text-card-foreground">
            <span>{s.value}</span>
            <TrendArrow trend={s.trend} tone={s.tone} />
          </p>
          <p className="text-[11px] text-muted-foreground">{s.priorValue}</p>
        </div>
      ))}
    </div>
  )
}
