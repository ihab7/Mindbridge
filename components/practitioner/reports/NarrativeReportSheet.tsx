import type { Translator } from "@/lib/server-i18n"
import { buildFooterText } from "@/lib/reports/consultationReport"
import type { NarrativeReport } from "@/lib/reports/narrativeReport"
import { ReportLetterhead } from "./ReportLetterhead"
import { ReportPatientBlock } from "./ReportPatientBlock"

// Renders the narrative summary at A4 proportions from a FROZEN snapshot —
// same letterhead + patient block + disclaimer as the clinical letter, but
// warm prose sections instead of an indicator table, and NO signature block:
// narrative summaries are notes, not formally signed documents.
export function NarrativeReportSheet({ report, t }: { report: NarrativeReport; t: Translator }) {
  const dir = report.language === "ar" ? "rtl" : "ltr"
  const footer = buildFooterText(report.footerNote, t)

  const sections: { key: string; title: string; body?: string; bullets?: string[] }[] = [
    { key: "mood", title: t("report.narrative.section.mood"), body: report.mood },
    { key: "medication", title: t("report.narrative.section.medication"), body: report.medication },
    { key: "sleep", title: t("report.narrative.section.sleep"), body: report.sleep },
    { key: "mindfulness", title: t("report.narrative.section.mindfulness"), body: report.mindfulness },
    { key: "journal", title: t("report.narrative.section.journal"), body: report.journal },
    { key: "sideEffects", title: t("report.narrative.section.sideEffects"), body: report.sideEffects },
    { key: "overallProgress", title: t("report.narrative.section.overallProgress"), body: report.overallProgress },
    { key: "recommendations", title: t("report.narrative.section.recommendations"), bullets: report.recommendations },
    { key: "nextAppointment", title: t("report.narrative.section.nextAppointment"), body: report.nextAppointment },
  ]

  return (
    <div
      dir={dir}
      className="report-sheet mx-auto w-full max-w-[794px] bg-card p-[40px] text-card-foreground shadow-sm"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" } as React.CSSProperties}
    >
      <ReportLetterhead practitioner={report.practitioner} t={t} />

      {/* ── DOCUMENT META ── */}
      <div className="report-section mt-4 flex items-start justify-between gap-6">
        <div>
          <div className="text-[14px] font-medium">{t("report.narrative.docTitle")}</div>
          <div className="text-[11px] text-muted-foreground">{report.period.label}</div>
        </div>
        <div className="text-end text-[11px] text-muted-foreground">
          <div>{t("report.meta.ref", { reference: report.reference })}</div>
          <div>
            {t("report.meta.issued", {
              date: new Intl.DateTimeFormat(report.language, { day: "numeric", month: "long", year: "numeric" }).format(
                new Date(report.issuedAt),
              ),
            })}
          </div>
        </div>
      </div>

      {report.isThin && (
        <div className="report-section mt-1.5 text-[11px] text-accent">
          {t("report.thin", {
            logged: report.dataCompleteness.daysLogged,
            total: report.dataCompleteness.daysTotal,
          })}
        </div>
      )}

      <ReportPatientBlock patient={report.patient} t={t} />

      {sections.map((section) => (
        <div key={section.key} className="report-section mt-5">
          <SectionHeader>{section.title}</SectionHeader>
          {section.bullets ? (
            <ul className="mt-2 list-disc space-y-0.5 ps-5 text-[11px] leading-[1.8]">
              {section.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11px] leading-relaxed">{section.body}</p>
          )}
        </div>
      ))}

      {/* ── FOOTER ── body prose, not a heading — no uppercase/letter-spacing.
          No signature block: narrative summaries aren't formally signed. */}
      <div className="report-section mt-6 border-t border-border pt-3">
        <p className="max-w-[80%] text-[10px] normal-case leading-snug tracking-normal text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.5px] text-muted-foreground">{children}</div>
  )
}
