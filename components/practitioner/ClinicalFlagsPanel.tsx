"use client"

import {
  IconMoonOff,
  IconAlertTriangle,
  IconMoodSad,
  IconPill,
  IconCalendarOff,
  IconNotes,
  IconCircleCheck,
  type IconProps,
} from "@tabler/icons-react"
import type { ComponentType } from "react"
import { useT } from "@/components/i18n-provider"
import type { ClinicalFlag, SignalTone } from "@/lib/wellbeing/clinicalSummary"

const ICONS: Record<string, ComponentType<IconProps>> = {
  "moon-off": IconMoonOff,
  "alert-triangle": IconAlertTriangle,
  "mood-sad": IconMoodSad,
  pill: IconPill,
  "calendar-off": IconCalendarOff,
  notes: IconNotes,
  "circle-check": IconCircleCheck,
}

const TONE_CLASS: Record<SignalTone, string> = {
  danger: "text-destructive",
  warning: "text-accent",
  good: "text-primary",
  neutral: "text-muted-foreground",
}

export function ClinicalFlagsPanel({ flags }: { flags: ClinicalFlag[] }) {
  const t = useT()
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <p className="text-xs text-muted-foreground">{t("practitioner.wellbeing.flags.header")}</p>
      <ul className="mt-1">
        {flags.map((flag, i) => {
          const Icon = ICONS[flag.icon] ?? IconCircleCheck
          return (
            <li
              key={i}
              className="flex items-start gap-2.5 py-[7px] [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border/60"
            >
              <Icon size={16} stroke={2} className={`mt-0.5 shrink-0 ${TONE_CLASS[flag.tone]}`} aria-hidden />
              <span className="text-[13px] leading-normal text-card-foreground">{flag.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
