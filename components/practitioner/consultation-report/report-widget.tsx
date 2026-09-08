"use client"

import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import { useT } from "@/components/i18n-provider"

// Dashboard entry point for consultation reports. Two-step fast path: lands
// directly on a patient picker (not the full patient list → profile →
// scroll → button flow) so generating a report from the dashboard takes one
// click to pick a patient, then the generate dialog opens right there.
export function ConsultationReportWidget() {
  const t = useT()

  return (
    <Link
      href="/practitioner/reports/new"
      className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-card-foreground">{t("report.widget.title")}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("report.widget.subtitle")}</p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary">
        {t("report.widget.cta")}
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  )
}
