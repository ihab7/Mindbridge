import type { Translator } from "@/lib/server-i18n"
import type { ConsultationReport } from "@/lib/reports/consultationReport"

// Shared by both report formats (clinical letter and narrative summary) so the
// "omit empty lines, never print a placeholder, no MindBridge branding here"
// rules can't drift between them. MindBridge belongs only in the footer — this
// is the practitioner's document, not the platform's.
export function ReportLetterhead({
  practitioner,
  t,
}: {
  practitioner: ConsultationReport["practitioner"]
  t: Translator
}) {
  const p = practitioner
  return (
    <div className="report-section flex items-start justify-between gap-6 border-b-[1.5px] border-border pb-3">
      <div className="min-w-0">
        <div className="text-[15px] font-medium">{p.fullName}</div>
        {p.specialty && <div className="text-[12px] text-muted-foreground">{p.specialty}</div>}
        {p.licenseNumber && (
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {t("report.license", { number: p.licenseNumber })}
          </div>
        )}
      </div>
      <div className="shrink-0 text-end text-[11px] text-muted-foreground">
        {p.cabinetName && <div>{p.cabinetName}</div>}
        {p.address && <div>{p.address}</div>}
        {p.phone && <div>{p.phone}</div>}
        {p.email && <div>{p.email}</div>}
      </div>
    </div>
  )
}
