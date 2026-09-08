import Link from "next/link"
import { IconExternalLink } from "@tabler/icons-react"
import { getSql } from "@/lib/db"
import { getServerI18n } from "@/lib/server-i18n"
import { getPractitionerLetterhead, listReports } from "@/lib/reports/data"
import { GenerateReportDialog } from "./GenerateReportDialog"
import { ReportFormatChip } from "./ReportFormatChip"

// Server component placed in the patient-detail view: the "Générer un rapport"
// entry point plus the list of previously generated reports. Re-opening a row
// renders from its stored snapshot, never from live data. This button is the
// original entry point and stays put — the dashboard fast path is additional,
// not a replacement.
export async function ReportsSection({
  patientId,
  practitionerId,
}: {
  patientId: number
  practitionerId: number
}) {
  const sql = getSql()
  const { t, locale } = await getServerI18n()

  const [{ hasProfile }, reports] = await Promise.all([
    getPractitionerLetterhead(sql, practitionerId),
    listReports(sql, patientId, practitionerId),
  ])

  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-card-foreground">{t("report.section.listTitle")}</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{t("report.section.listSubtitle")}</p>
        </div>
        <GenerateReportDialog patientId={patientId} practitionerId={practitionerId} hasProfile={hasProfile} />
      </div>

      {reports.length > 0 ? (
        <ul className="mt-4 divide-y divide-border/60">
          {reports.map((r) => (
            <li key={r.id}>
              <Link
                href={`/practitioner/patients/${patientId}/report/${r.id}`}
                className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:text-primary"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-card-foreground">{r.reference}</span>
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
        <p className="mt-4 text-[13px] text-muted-foreground">{t("report.section.listEmpty")}</p>
      )}
    </div>
  )
}
