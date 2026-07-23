import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer"
import type { ConsultationReportDraft } from "./types"

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottom: "1 solid #d1d5db",
    paddingBottom: 16,
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f766e",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 4,
  },
  meta: {
    textAlign: "right",
    fontSize: 9.5,
    color: "#6b7280",
  },
  infoRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  infoBlock: {
    flexDirection: "column",
  },
  infoLabel: {
    fontSize: 8.5,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 700,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0f766e",
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1f2937",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    fontSize: 10,
    lineHeight: 1.4,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 8,
  },
})

function formatDate(value: string | null): string {
  if (!value) return "Not scheduled"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not scheduled"
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body || "Not documented."}</Text>
    </View>
  )
}

export function ConsultationReportPdf({
  report,
  practitionerName,
}: {
  report: ConsultationReportDraft
  practitionerName: string
}) {
  const { patientInfo, sections, recommendations, nextAppointment } = report

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>MindBridge</Text>
            <Text style={styles.title}>Consultation Report</Text>
          </View>
          <View style={styles.meta}>
            <Text>Prepared by {practitionerName}</Text>
            <Text>Generated {formatDate(new Date().toISOString())}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Patient</Text>
            <Text style={styles.infoValue}>{patientInfo.name}</Text>
          </View>
          {patientInfo.age ? (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{patientInfo.age}</Text>
            </View>
          ) : null}
          {patientInfo.gender ? (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{patientInfo.gender}</Text>
            </View>
          ) : null}
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Consultation Date</Text>
            <Text style={styles.infoValue}>{formatDate(patientInfo.consultationDate)}</Text>
          </View>
        </View>

        <Section title="Mood Summary" body={sections.moodSummary} />
        <Section title="Medication Adherence" body={sections.medicationSummary} />
        <Section title="Sleep Analysis" body={sections.sleepSummary} />
        <Section title="Mindfulness & Breathing" body={sections.mindfulnessSummary} />
        <Section title="Journal Analysis" body={sections.journalSummary} />
        <Section title="Side Effects" body={sections.sideEffectsSummary} />
        <Section title="Overall Progress" body={sections.overallProgress} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {recommendations.map((rec, i) => (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletDot}>{"•"}</Text>
              <Text style={styles.bulletText}>{rec}</Text>
            </View>
          ))}
        </View>

        <Section title="Next Appointment" body={formatDate(nextAppointment)} />

        <Text style={styles.footer} fixed>
          MindBridge Mental Health Monitoring Platform — Confidential Consultation Report
        </Text>
      </Page>
    </Document>
  )
}

export async function renderConsultationReportPdf(
  report: ConsultationReportDraft,
  practitionerName: string
): Promise<Buffer> {
  return renderToBuffer(<ConsultationReportPdf report={report} practitionerName={practitionerName} />)
}
