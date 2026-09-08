import type { Translator } from "@/lib/server-i18n"
import type { ReportFormat } from "@/lib/reports/data"

// Small chip so a practitioner scanning a reports list can tell the two
// formats apart at a glance. Plain function component — safe to render from
// server components (no client-only APIs).
export function ReportFormatChip({ format, t }: { format: ReportFormat; t: Translator }) {
  const isNarrative = format === "narrative"
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      <span aria-hidden>{isNarrative ? "✍" : "📄"}</span>
      {isNarrative ? t("report.format.narrative") : t("report.format.clinical")}
    </span>
  )
}
