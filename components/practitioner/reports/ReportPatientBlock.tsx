import type { Translator } from "@/lib/server-i18n"
import type { ConsultationReport } from "@/lib/reports/consultationReport"

// Shared by both report formats. Tinted block with a border, so the boundary
// survives when the print dialog's "Background graphics" option is off (its
// default). Any row whose value is null is omitted — never an empty label.
export function ReportPatientBlock({ patient, t }: { patient: ConsultationReport["patient"]; t: Translator }) {
  const rows: { label: string; value: string }[] = []
  rows.push({ label: t("report.patient.patient"), value: patient.fullName })
  if (patient.age != null) rows.push({ label: t("report.patient.age"), value: t("report.patient.ageValue", { age: patient.age }) })
  if (patient.fileNumber) rows.push({ label: t("report.patient.file"), value: patient.fileNumber })
  if (patient.followedSince) rows.push({ label: t("report.patient.since"), value: patient.followedSince })

  return (
    <div className="report-section mt-4 rounded border border-border bg-muted px-[14px] py-[10px]">
      <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-2 text-[11px]">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
