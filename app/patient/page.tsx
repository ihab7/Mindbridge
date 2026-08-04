import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import { JournalForm } from "@/components/patient/journal-form"
import { MoodChart } from "@/components/patient/mood-chart"
import { MedicationChart } from "@/components/patient/medication-chart"
import { RecentEntries } from "@/components/patient/recent-entries"
import { MentalStatusBadge } from "@/components/mental-status-badge"
import { SessionPrepCard } from "@/components/patient/session-prep-card"
import { getServerI18n } from "@/lib/server-i18n"
import { PractitionerFeedbackCard } from "@/components/patient/practitioner-feedback-card"
import { DailyWellnessTasks } from "@/components/patient/daily-wellness-tasks"
import { ProgramWidget } from "@/components/patient/program-widget"
import { SleepNudgeBanner } from "@/components/sleep-stories/SleepNudgeBanner"

export default async function PatientDashboard() {
  const user = await getSession()
  if (!user) redirect("/login")

  const { t } = await getServerI18n()

  const sql = getSql()

  const entries = (await sql`
    SELECT * FROM journal_entries
    WHERE patient_id = ${user.id}
    ORDER BY created_at DESC
    LIMIT 14
  `) as Record<string, unknown>[]

  // Get practitioner info for this patient
  const practitioner = (await sql`
    SELECT u.id, u.name FROM users u
    JOIN patients p ON p.practitioner_id = u.id
    WHERE p.user_id = ${user.id}
    LIMIT 1
  `) as Record<string, unknown>[]

  const unreadMessages = (await sql`
    SELECT COUNT(*) as count FROM messages
    WHERE receiver_id = ${user.id} AND read = false
  `) as Record<string, unknown>[]

  const chartEntries = [...entries].reverse() as any

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {t("patient.dashboard.welcomeBack", { name: user.name.split(" ")[0] })}
          </h1>
          <MentalStatusBadge mood={entries.length > 0 ? Number(entries[0].mood) : null} size="lg" />
        </div>
        <p className="mt-1 text-muted-foreground">
          {practitioner.length > 0
            ? t("patient.dashboard.yourPractitioner", { name: String(practitioner[0].name) })
            : t("patient.dashboard.trackWellbeing")}
          {Number(unreadMessages[0]?.count) > 0 && (
            <>
              {" "}
              {t("common.unreadMessages", { count: Number(unreadMessages[0]?.count) })}
            </>
          )}
        </p>
      </div>

      <DailyWellnessTasks />

      <div className="max-w-2xl">
        <PractitionerFeedbackCard />
      </div>

      <ProgramWidget />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="order-1">
          <div className="flex flex-col gap-6">
            <JournalForm />
            <SessionPrepCard />
          </div>
        </div>
        <div className="order-2 flex flex-col gap-6">
          <MoodChart entries={chartEntries} />
          <SleepNudgeBanner />
          <MedicationChart entries={chartEntries} />
        </div>
      </div>

      <RecentEntries entries={entries.slice(0, 7) as any} />
    </div>
  )
}
