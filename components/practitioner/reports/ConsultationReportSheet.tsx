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

const RISK_TONE: Record<"none" | "watch" | "significant", string> = {
  none: "text-muted-foreground",
  watch: "text-accent",
  significant: "text-destructive",
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
  const priorHeader =
    report.comparisonMode === "inclusion" ? t("report.table.prior.inclusion") : t("report.table.prior.previousPeriod")
  // Reports generated before these fields existed have frozen snapshots
  // without them — default rather than crash when reopening an old report.
  const treatments = report.treatments ?? []
  const riskAssessment = report.riskAssessment ?? { level: "none" as const, detail: null }

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

      <ReportPatientBlock patient={report.patient} diagnosis={report.diagnosis} t={t} />

      {/* ── SYNTHÈSE CLINIQUE ── */}
      <div className="report-section mt-5">
        <SectionHeader>{t("report.section.synthese")}</SectionHeader>
        <table className="mt-2 w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-border text-start text-muted-foreground">
              <th className="py-1 pe-2 text-start font-medium">{t("report.table.indicator")}</th>
              <th className="py-1 pe-2 text-start font-medium">{t("report.table.period")}</th>
              <th className="py-1 pe-2 text-start font-medium">{priorHeader}</th>
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

      {/* ── TRAITEMENT EN COURS ── always present, rows or not. */}
      <div className="report-section mt-5">
        <SectionHeader>{t("report.section.treatment")}</SectionHeader>
        {treatments.length > 0 ? (
          <table className="mt-2 w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-border text-start text-muted-foreground">
                <th className="py-1 pe-2 text-start font-medium">{t("report.treatment.medication")}</th>
                <th className="py-1 pe-2 text-start font-medium">{t("report.treatment.dosage")}</th>
                <th className="py-1 pe-2 text-start font-medium">{t("report.treatment.frequency")}</th>
                <th className="py-1 text-start font-medium">{t("report.treatment.since")}</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((tr, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-1.5 pe-2 font-medium">{tr.medicationName}</td>
                  <td className="py-1.5 pe-2 text-muted-foreground">{tr.dosage ?? "—"}</td>
                  <td className="py-1.5 pe-2 text-muted-foreground">{tr.frequency ?? "—"}</td>
                  <td className="py-1.5 text-muted-foreground">{tr.startDate ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-2 text-[11px] text-muted-foreground">{t("report.treatment.empty")}</p>
        )}
      </div>

      {/* ── PROGRAMME ASSIGNÉ ── */}
      {report.programSummary && (
        <div className="report-section mt-5">
          <SectionHeader>{t("report.section.program")}</SectionHeader>
          <p className="mt-2 text-[11px] leading-relaxed">{report.programSummary}</p>
        </div>
      )}

      {/* ── ÉVALUATION DU RISQUE ── mandatory at generation, always present.
          Rendered BEFORE Observations: the practitioner's free-text notes
          often comment on the risk assessment, so risk is stated first. */}
      <div className="report-section mt-5">
        <SectionHeader>{t("report.section.risk")}</SectionHeader>
        <p className={`mt-2 whitespace-pre-wrap text-[11px] leading-relaxed font-medium ${RISK_TONE[riskAssessment.level]}`}>
          {t(`report.risk.sentence.${riskAssessment.level}`, { detail: riskAssessment.detail ?? "" })}
        </p>
      </div>

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
          SectionHeader styling. The mandatory disclaimer always renders first,
          in full, on its own line; the practitioner's custom note (if any)
          renders exactly as typed on a SECOND line — it is never merged into
          or shortens the disclaimer. */}
      <div className="report-section mt-6 flex items-end justify-between gap-6 border-t border-border pt-3">
        <div className="max-w-[58%] text-[10px] normal-case leading-snug tracking-normal text-muted-foreground">
          <p>{footer.disclaimer}</p>
          {footer.customNote && <p className="mt-1">{footer.customNote}</p>}
        </div>
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
