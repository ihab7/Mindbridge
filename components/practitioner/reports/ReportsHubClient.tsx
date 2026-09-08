"use client"

import { useState } from "react"
import Link from "next/link"
import { IconExternalLink } from "@tabler/icons-react"
import { useT, useI18n } from "@/components/i18n-provider"
import { PatientPickerList, type PickerPatient } from "./PatientPickerList"
import { GenerateReportDialog } from "./GenerateReportDialog"
import { ReportFormatChip } from "./ReportFormatChip"
import type { ReportFormat } from "@/lib/reports/data"

export type HubReportRow = {
  id: string
  patientId: number
  patientName: string
  reference: string
  periodLabel: string
  issuedAt: string
  format: ReportFormat
}

// Fast path: dashboard "Follow-up reports" card lands here directly on a
// patient picker. Clicking a patient opens the generate dialog inline — no
// navigation to their profile. The existing per-patient "Generate report"
// button is untouched; this is an additional entry point, not a replacement.
export function ReportsHubClient({
  patients,
  hasProfile,
  practitionerId,
  reports,
}: {
  patients: PickerPatient[]
  hasProfile: boolean
  practitionerId: number
  reports: HubReportRow[]
}) {
  const t = useT()
  const { locale } = useI18n()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" })

  function pick(id: number) {
    setSelectedId(id)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="md:h-[480px]">
          <PatientPickerList
            patients={patients}
            selectedId={selectedId ?? undefined}
            onSelect={pick}
            searchPlaceholder={t("report.hub.searchPlaceholder")}
            emptyLabel={t("report.hub.noPatients")}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-medium text-card-foreground">{t("report.hub.recentTitle")}</h3>
          {reports.length > 0 ? (
            <ul className="mt-3 divide-y divide-border/60">
              {reports.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/practitioner/patients/${r.patientId}/report/${r.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:text-primary"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-card-foreground">{r.patientName}</span>
                        <span className="text-muted-foreground">· {r.reference}</span>
                        <ReportFormatChip format={r.format} t={t} />
                      </span>
                      <span className="truncate text-[12px] text-muted-foreground">{r.periodLabel}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[12px] text-muted-foreground">
                      {dateFmt.format(new Date(r.issuedAt))}
                      <IconExternalLink size={14} stroke={2} aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[13px] text-muted-foreground">{t("report.section.listEmpty")}</p>
          )}
        </div>
      </div>

      {selectedId != null && (
        <GenerateReportDialog
          patientId={selectedId}
          practitionerId={practitionerId}
          hasProfile={hasProfile}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          trigger={false}
        />
      )}
    </div>
  )
}
