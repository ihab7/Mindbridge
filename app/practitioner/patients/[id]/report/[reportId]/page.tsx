import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"
import { getI18nForLocale } from "@/lib/server-i18n"
import { getStoredReport } from "@/lib/reports/data"
import { ConsultationReportSheet } from "@/components/practitioner/reports/ConsultationReportSheet"
import { NarrativeReportSheet } from "@/components/practitioner/reports/NarrativeReportSheet"
import { PrintButton } from "@/components/practitioner/reports/PrintButton"
import { isLocale } from "@/i18n/routing"
import type { ConsultationReport } from "@/lib/reports/consultationReport"
import type { NarrativeReport } from "@/lib/reports/narrativeReport"

export default async function ConsultationReportPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>
}) {
  const user = await getSession()
  // Patients (and anyone unauthenticated) can never load this route.
  if (!user || user.role !== "practitioner") redirect("/login")

  const { id, reportId } = await params
  const patientId = parseInt(id)

  const sql = getSql()

  // Ownership: only the practitioner linked to this patient may view.
  const owns = (await sql`
    SELECT 1 FROM patients WHERE user_id = ${patientId} AND practitioner_id = ${user.id}
  `) as Record<string, unknown>[]
  if (owns.length === 0) redirect("/practitioner/patients")

  // Report is scoped to the owning practitioner in the query itself.
  const stored = await getStoredReport(sql, reportId, user.id)
  if (!stored || stored.snapshot.patient == null) redirect(`/practitioner/patients/${patientId}`)

  // Render in the report's OWN language, not the viewer's UI language.
  const reportLocale = isLocale(stored.language) ? stored.language : "fr"
  const t = await getI18nForLocale(reportLocale)

  return (
    <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4 py-6">
      <div className="no-print flex items-center justify-between gap-4">
        <Link
          href={`/practitioner/patients/${patientId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft size={16} stroke={2} aria-hidden />
          {t("report.back")}
        </Link>
        <PrintButton />
      </div>

      {/* format is fixed at generation and stored on the row — a report always
          renders in the format it was issued in, never editable after the fact. */}
      {stored.format === "narrative" ? (
        <NarrativeReportSheet report={stored.snapshot as NarrativeReport} t={t} />
      ) : (
        <ConsultationReportSheet report={stored.snapshot as ConsultationReport} t={t} />
      )}
    </div>
  )
}
