"use client"

import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { useT } from "@/components/i18n-provider"
import type { PatientDigest, Trend } from "@/lib/program/ai/buildPatientDigest"

type Severity = "danger" | "warning" | "success" | "neutral"

const BORDER_COLOR: Record<Severity, string> = {
  danger: "#dc2626",
  warning: "#d97706",
  success: "#2a9d8f",
  neutral: "hsl(var(--border))",
}

function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
  if (trend === "flat") return <Minus className="h-3.5 w-3.5" aria-hidden="true" />
  return null
}

function Card({
  label,
  value,
  severity,
  trend,
}: {
  label: string
  value: string
  severity: Severity
  trend?: Trend
}) {
  return (
    <div
      className="rounded-lg rounded-s-none bg-card py-3 pe-3 ps-3"
      style={{ borderInlineStart: `3px solid ${BORDER_COLOR[severity]}` }}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="text-lg font-bold text-card-foreground">{value}</span>
        {trend && trend !== null && <TrendArrow trend={trend} />}
      </div>
    </div>
  )
}

export function PatientSignalStrip({ digest }: { digest: PatientDigest }) {
  const t = useT()

  const anxietySeverity: Severity =
    digest.anxiety.avg == null ? "neutral" : digest.anxiety.avg >= 7 ? "danger" : digest.anxiety.avg >= 5 ? "warning" : "success"

  const sleepSeverity: Severity =
    digest.sleep.avgHours == null ? "neutral" : digest.sleep.avgHours < 6 ? "danger" : digest.sleep.avgHours < 7 ? "warning" : "success"

  const adherenceSeverity: Severity =
    digest.medication.adherencePct == null
      ? "neutral"
      : digest.medication.adherencePct < 80
        ? "danger"
        : digest.medication.adherencePct < 90
          ? "warning"
          : "success"

  const journalSeverity: Severity =
    digest.journal.entryCount >= 20 ? "success" : digest.journal.entryCount >= 10 ? "warning" : "danger"

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card
        label={t("practitioner.review.signals.anxiety")}
        value={digest.anxiety.avg != null ? `${digest.anxiety.avg}/10` : "—"}
        severity={anxietySeverity}
        trend={digest.anxiety.trend}
      />
      <Card
        label={t("practitioner.review.signals.sleep")}
        value={digest.sleep.avgHours != null ? `${digest.sleep.avgHours}h` : "—"}
        severity={sleepSeverity}
        trend={digest.sleep.trend}
      />
      <Card
        label={t("practitioner.review.signals.adherence")}
        value={digest.medication.adherencePct != null ? `${digest.medication.adherencePct}%` : "—"}
        severity={adherenceSeverity}
      />
      <Card
        label={t("practitioner.review.signals.journal")}
        value={t("practitioner.review.signals.journalValue", { count: digest.journal.entryCount, days: digest.windowDays })}
        severity={journalSeverity}
      />
    </div>
  )
}
