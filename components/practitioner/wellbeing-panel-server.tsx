import { getSql } from "@/lib/db"
import type { ClinicalEntry } from "@/lib/wellbeing/clinicalSummary"
import { WellbeingPanel } from "./WellbeingPanel"

// Server component: fetches the patient's last 14 days by DATE (not entry
// count) and hands them to the client panel. Wrapped in <Suspense> by the page
// so the skeleton shows while this resolves.
export async function WellbeingPanelServer({
  patientId,
  patientName,
  messageHref,
  windowDays = 14,
}: {
  patientId: number
  patientName: string
  messageHref: string
  windowDays?: number
}) {
  const sql = getSql()

  const rows = (await sql`
    SELECT mood, anxiety, sleep_hours, medication_taken, challenges, achievements, created_at
    FROM journal_entries
    WHERE patient_id = ${patientId}
      AND created_at >= NOW() - INTERVAL '13 days'
    ORDER BY created_at ASC
  `) as Record<string, unknown>[]

  const entries: ClinicalEntry[] = rows.map((r) => ({
    mood: Number(r.mood),
    anxiety: Number(r.anxiety),
    sleep_hours: Number(r.sleep_hours),
    medication_taken: Boolean(r.medication_taken),
    challenges: r.challenges == null ? "" : String(r.challenges),
    achievements: r.achievements == null ? "" : String(r.achievements),
    created_at: String(r.created_at),
  }))

  return (
    <WellbeingPanel
      entries={entries}
      patientName={patientName}
      messageHref={messageHref}
      windowDays={windowDays}
    />
  )
}
