import type { Translator } from "@/lib/server-i18n"
import { buildFooterText } from "@/lib/reports/consultationReport"
import type { NarrativeReport } from "@/lib/reports/narrativeReport"
import { ReportLetterhead } from "./ReportLetterhead"
import { ReportPatientBlock } from "./ReportPatientBlock"

// Renders the narrative summary at A4 proportions from a FROZEN snapshot —
// same letterhead + patient block + disclaimer as the clinical letter, but
// warm prose sections instead of an indicator table, and NO signature block:
// narrative summaries are notes, not formally signed documents.
const RISK_TONE: Record<"none" | "watch" | "significant", string> = {
  none: "text-muted-foreground",
  watch: "text-accent",
  significant: "text-destructive",
}

export function NarrativeReportSheet({ report, t }: { report: NarrativeReport; t: Translator }) {
  const dir = report.language === "ar" ? "rtl" : "ltr"
  const footer = buildFooterText(report.footerNote, t)
  // Reports generated before these fields existed have frozen snapshots
  // without them — default rather than crash when reopening an old report.
  const treatments = report.treatments ?? []
  const riskAssessment = report.riskAssessment ?? { level: "none" as const, detail: null }

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

      <ReportPatientBlock patient={report.patient} diagnosis={report.diagnosis} t={t} />

      {/* ── TRAITEMENT EN COURS ── always present, rows or not. */}
      <div className="report-section mt-5">
        <SectionHeader>{t("report.narrative.section.treatment")}</SectionHeader>
        {treatments.length > 0 ? (
          <ul className="mt-2 list-disc space-y-0.5 ps-5 text-[11px] leading-[1.8]">
            {treatments.map((tr, i) => (
              <li key={i}>
                {[tr.medicationName, tr.dosage, tr.frequency].filter(Boolean).join(" — ")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[11px] text-muted-foreground">{t("report.treatment.empty")}</p>
        )}
      </div>

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

      {/* ── ÉVALUATION DU RISQUE ── mandatory at generation, always present.
          Narrative has no Observations block, so immediately before the
          footer is the equivalent "last section" position. */}
      <div className="report-section mt-5">
        <SectionHeader>{t("report.section.risk")}</SectionHeader>
        <p className={`mt-2 whitespace-pre-wrap text-[11px] leading-relaxed font-medium ${RISK_TONE[riskAssessment.level]}`}>
          {t(`report.risk.sentence.${riskAssessment.level}`, { detail: riskAssessment.detail ?? "" })}
        </p>
      </div>

      {/* ── FOOTER ── body prose, not a heading — no uppercase/letter-spacing.
          No signature block: narrative summaries aren't formally signed. The
          mandatory disclaimer always renders first, in full; the practitioner's
          custom note (if any) is a second line, never merged into it. */}
      <div className="report-section mt-6 border-t border-border pt-3">
        <div className="max-w-[80%] text-[10px] normal-case leading-snug tracking-normal text-muted-foreground">
          <p>{footer.disclaimer}</p>
          {footer.customNote && <p className="mt-1">{footer.customNote}</p>}
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
