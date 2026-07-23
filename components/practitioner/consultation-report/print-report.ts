import type { ConsultationReportDraft } from "@/lib/consultation-report/types"

function formatDate(value: string | null): string {
  if (!value) return "Not scheduled"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not scheduled"
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function section(title: string, body: string): string {
  return `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body) || "Not documented."}</p></section>`
}

export function printReport(report: ConsultationReportDraft, practitionerName: string) {
  const { patientInfo, sections, recommendations, nextAppointment } = report

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Consultation Report — ${escapeHtml(patientInfo.name)}</title>
<style>
  @page { size: A4; margin: 24mm 20mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1f2937; line-height: 1.5; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
  .brand { font-size: 20px; font-weight: 700; color: #0f766e; }
  .title { font-size: 15px; margin-top: 2px; }
  .meta { text-align: right; font-size: 11px; color: #6b7280; }
  .patient-info { display: flex; gap: 32px; margin-bottom: 20px; }
  .patient-info div { font-size: 13px; }
  .patient-info .label { font-size: 10px; text-transform: uppercase; color: #6b7280; }
  section { margin-bottom: 14px; }
  h2 { font-size: 13px; color: #0f766e; margin: 0 0 4px; }
  p { font-size: 12px; margin: 0; }
  ul { margin: 4px 0 0; padding-left: 18px; }
  li { font-size: 12px; margin-bottom: 3px; }
  footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 9px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
  <header>
    <div>
      <div class="brand">MindBridge</div>
      <div class="title">Consultation Report</div>
    </div>
    <div class="meta">
      <div>Prepared by ${escapeHtml(practitionerName)}</div>
      <div>Generated ${formatDate(new Date().toISOString())}</div>
    </div>
  </header>

  <div class="patient-info">
    <div><div class="label">Patient</div>${escapeHtml(patientInfo.name)}</div>
    ${patientInfo.age ? `<div><div class="label">Age</div>${patientInfo.age}</div>` : ""}
    ${patientInfo.gender ? `<div><div class="label">Gender</div>${escapeHtml(patientInfo.gender)}</div>` : ""}
    <div><div class="label">Consultation Date</div>${formatDate(patientInfo.consultationDate)}</div>
  </div>

  ${section("Mood Summary", sections.moodSummary)}
  ${section("Medication Adherence", sections.medicationSummary)}
  ${section("Sleep Analysis", sections.sleepSummary)}
  ${section("Mindfulness & Breathing", sections.mindfulnessSummary)}
  ${section("Journal Analysis", sections.journalSummary)}
  ${section("Side Effects", sections.sideEffectsSummary)}
  ${section("Overall Progress", sections.overallProgress)}

  <section>
    <h2>Recommendations</h2>
    <ul>${recommendations.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
  </section>

  ${section("Next Appointment", formatDate(nextAppointment))}

  <footer>MindBridge Mental Health Monitoring Platform — Confidential Consultation Report</footer>
</body>
</html>`

  const printWindow = window.open("", "_blank")
  if (!printWindow) return
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}
