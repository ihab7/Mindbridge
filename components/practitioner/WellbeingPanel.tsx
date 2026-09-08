"use client"

import { useMemo } from "react"
import Link from "next/link"
import { IconMessageCircle, IconCalendarOff, IconAlertTriangle } from "@tabler/icons-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { buildClinicalSummary, type ClinicalEntry } from "@/lib/wellbeing/clinicalSummary"
import { ClinicalSignalStrip } from "./ClinicalSignalStrip"
import { ClinicalFlagsPanel } from "./ClinicalFlagsPanel"
import { WellbeingChart } from "./WellbeingChart"

// Practitioner-side wellbeing panel: scannable summary layer (chips + flags)
// on top of full-precision data (the combined chart). Composes header, chips,
// flags, and the chart. Client component because the chart needs hover/tap.
export function WellbeingPanel({
  entries,
  patientName,
  messageHref,
  windowDays = 14,
}: {
  entries: ClinicalEntry[]
  patientName: string
  messageHref: string
  windowDays?: number
}) {
  const { locale } = useI18n()
  const t = useT()

  const summary = useMemo(
    () => buildClinicalSummary(entries, { t, locale, windowDays }),
    // t/locale stable per render; entries drive recomputation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, locale, windowDays],
  )

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-medium text-card-foreground">{patientName}</h3>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {t("practitioner.wellbeing.header.window", {
            days: summary.windowDays,
            logged: summary.daysLogged,
            total: summary.daysTotal,
          })}
        </p>
      </div>
      <Link
        href={messageHref}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <IconMessageCircle size={16} stroke={2} aria-hidden />
        {t("practitioner.wellbeing.header.message")}
      </Link>
    </div>
  )

  // No data at all.
  if (!summary.hasAnyData) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-6">
          <IconCalendarOff size={20} stroke={1.75} className="shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{t("practitioner.wellbeing.state.noData")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {header}

      {summary.isThin && (
        <div className="flex items-start gap-2.5 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
          <IconAlertTriangle size={16} stroke={2} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <p className="text-[13px] text-card-foreground">
            {t("practitioner.wellbeing.state.thin", {
              logged: summary.daysLogged,
              total: summary.daysTotal,
            })}
          </p>
        </div>
      )}

      <ClinicalSignalStrip signals={summary.signals} />
      <ClinicalFlagsPanel flags={summary.flags} />

      <div className="rounded-xl border border-border bg-card p-5">
        <WellbeingChart series={summary.series} />
      </div>
    </div>
  )
}

// Skeleton for the Suspense fallback while the 14-day query resolves.
export function WellbeingPanelSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-hidden>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-48 rounded bg-muted" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[68px] rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-24 rounded-xl bg-muted" />
      <div className="h-[220px] rounded-xl bg-muted" />
    </div>
  )
}
