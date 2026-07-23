"use client"

import { cn } from "@/lib/utils"
import { useT } from "@/components/i18n-provider"

const STATUS_MAP = {
  stable: {
    emoji: "\u{1F60A}",
    labelKey: "status.stable",
    bg: "bg-emerald-50 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  moderate: {
    emoji: "\u{1F610}",
    labelKey: "status.moderate",
    bg: "bg-amber-50 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/30",
  },
  concerning: {
    emoji: "\u{1F61F}",
    labelKey: "status.concerning",
    bg: "bg-orange-50 dark:bg-orange-500/15",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-500/30",
  },
  critical: {
    emoji: "\u{1F6A8}",
    labelKey: "status.critical",
    bg: "bg-red-50 dark:bg-red-500/15",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-500/30",
  },
} as const

type StatusKey = keyof typeof STATUS_MAP

function getStatusFromMood(mood: number): StatusKey {
  if (mood >= 8) return "stable"
  if (mood >= 5) return "moderate"
  if (mood >= 3) return "concerning"
  return "critical"
}

export function MentalStatusBadge({
  mood,
  size = "default",
  className,
}: {
  mood: number | null | undefined
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  const t = useT()

  if (mood == null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
          className,
        )}
      >
        {t("status.noData")}
      </span>
    )
  }

  const key = getStatusFromMood(mood)
  const status = STATUS_MAP[key]
  const statusLabel = t(status.labelKey)

  const sizeClasses = {
    sm: "gap-1 px-2 py-0.5 text-[11px]",
    default: "gap-1.5 px-2.5 py-1 text-xs",
    lg: "gap-2 px-3 py-1.5 text-sm",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        status.bg,
        status.text,
        status.border,
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label={t("status.aria", { status: statusLabel, mood })}
    >
      <span aria-hidden="true">{status.emoji}</span>
      <span>{statusLabel}</span>
    </span>
  )
}
