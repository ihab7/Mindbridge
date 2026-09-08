import type { Translator } from "@/lib/server-i18n"
import {
  buildFooterText,
  formatReportDate,
  type ConsultationReport,
  type ReportIndicator,
} from "@/lib/reports/consultationReport"
import { ReportLetterhead } from "./ReportLetterhead"
import { ReportPatientBlock } from "./ReportPatientBlock"

const DELTA_TONE: Record<ReportIndicator["tone"], string> = {
  danger: "text-destructive",
  warning: "text-accent",
  good: "text-muted-foreground",
  neutral: "text-muted-foreground",
}

// Renders the clinical letter at A4 proportions from a FROZEN snapshot. All
// static labels come from `t` bound to the report's own language, so a French
// report stays French regardless of who reopens it.
export function ConsultationReportSheet({
  report,
  t,
}: {
  report: ConsultationReport
  t: Translator
}) {
  const dir = report.language === "ar" ? "rtl" : "ltr"
  const footer = buildFooterText(report.footerNote, t)

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
          <div className="text-[14px] font-medium">{t("report.docTitle")}</div>
          <div className="text-[11px] text-muted-foreground">{report.period.label}</div>
        </div>
        <div className="text-end text-[11px] text-muted-foreground">
          <div>{t("report.meta.ref", { reference: report.reference })}</div>
          <div>{t("report.meta.issued", { date: formatReportDate(report.issuedAt, report.language) })}</div>
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

      {/* ── SYNTHÈSE CLINIQUE ── */}
      <div className="report-section mt-5">
        <SectionHeader>{t("report.section.synthese")}</SectionHeader>
        <table className="mt-2 w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-border text-start text-muted-foreground">
              <th className="py-1 pe-2 text-start font-medium">{t("report.table.indicator")}</th>
              <th className="py-1 pe-2 text-start font-medium">{t("report.table.period")}</th>
              <th className="py-1 pe-2 text-start font-medium">{t("report.table.prior")}</th>
              <th className="py-1 text-start font-medium">{t("report.table.evolution")}</th>
            </tr>
          </thead>
          <tbody>
            {report.indicators.map((ind) => (
              <tr key={ind.key} className="border-b border-border/60">
                <td className="py-1.5 pe-2">{ind.label}</td>
                <td className="py-1.5 pe-2 font-medium">{ind.current}</td>
                <td className="py-1.5 pe-2 text-muted-foreground">{ind.prior ?? "—"}</td>
                <td className={`py-1.5 font-medium ${ind.delta ? DELTA_TONE[ind.tone] : "text-muted-foreground"}`}>
                  {ind.delta ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ÉLÉMENTS NOTABLES ── */}
      <div className="report-section mt-5">
        <SectionHeader>{t("report.section.notable")}</SectionHeader>
        {report.notableEvents.length > 0 ? (
          <ul className="mt-2 list-disc space-y-0.5 ps-5 text-[11px] leading-[1.8]">
            {report.notableEvents.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[11px] text-muted-foreground">{t("report.notable.empty")}</p>
        )}
      </div>

      {/* ── PROGRAMME ASSIGNÉ ── */}
      {report.programSummary && (
        <div className="report-section mt-5">
          <SectionHeader>{t("report.section.program")}</SectionHeader>
          <p className="mt-2 text-[11px] leading-relaxed">{report.programSummary}</p>
        </div>
      )}

      {/* ── OBSERVATIONS DU PRATICIEN ── */}
      <div className="report-section mt-5">
        <SectionHeader>{t("report.section.observations")}</SectionHeader>
        {report.observations ? (
          <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed">{report.observations}</p>
        ) : (
          <div className="mt-2 min-h-[52px] rounded border border-dashed border-border" />
        )}
      </div>

      {/* ── FOOTER ──
          Body prose, NOT a heading: no uppercase, no letter-spacing, no
          SectionHeader styling. The practitioner's custom note must render
          exactly as typed — only the mandatory disclaimer text is appended
          when missing, never a case transform. */}
      <div className="report-section mt-6 flex items-end justify-between gap-6 border-t border-border pt-3">
        <p className="max-w-[58%] text-[10px] normal-case leading-snug tracking-normal text-muted-foreground">
          {footer}
        </p>
        <div className="text-end">
          <div className="h-8 w-[150px] border-b border-border" />
          <div className="mt-1 text-[10px] text-muted-foreground">{t("report.footer.signature")}</div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.5px] text-muted-foreground">{children}</div>
  )
}
