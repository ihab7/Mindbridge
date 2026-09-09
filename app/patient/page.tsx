import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import { JournalForm } from "@/components/patient/journal-form"
import { WeeklyWellbeing } from "@/components/wellbeing/weekly-wellbeing"
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

  // Patient-side wellbeing summary: a true rolling window by DATE, not by entry
  // count. 14 days so the weekly summary can compare this week to the prior one;
  // it renders only the last 7. Sparse data leaves days genuinely absent rather
  // than drawing a continuous line across a multi-month gap.
  const wellbeingEntries = (await sql`
    SELECT mood, anxiety, sleep_hours, medication_taken, created_at
    FROM journal_entries
    WHERE patient_id = ${user.id}
      AND created_at >= NOW() - INTERVAL '13 days'
    ORDER BY created_at ASC
  `) as any

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

  // Preloaded so SessionPrepCard can pick its initial edit/compact state on
  // first paint — no flash of the edit form before jumping to compact.
  const sessionPrepRows = (await sql`
    SELECT topics_to_discuss, questions_for_therapist, recent_concerns, updated_at
    FROM session_prep
    WHERE patient_id = ${user.id}
    LIMIT 1
  `) as Record<string, unknown>[]
  const sessionPrepInitialData = sessionPrepRows.length > 0
    ? {
        topics_to_discuss: String(sessionPrepRows[0].topics_to_discuss ?? ""),
        questions_for_therapist: String(sessionPrepRows[0].questions_for_therapist ?? ""),
        recent_concerns: String(sessionPrepRows[0].recent_concerns ?? ""),
        updated_at: String(sessionPrepRows[0].updated_at),
      }
    : null

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
          <div id="journal-form" className="flex flex-col gap-6 scroll-mt-20">
            <JournalForm />
            <SessionPrepCard initialData={sessionPrepInitialData} />
          </div>
        </div>
        <div className="order-2 flex flex-col gap-6">
          <WeeklyWellbeing entries={wellbeingEntries} />
          <SleepNudgeBanner />
        </div>
      </div>

      <RecentEntries entries={entries.slice(0, 7) as any} />
    </div>
  )
}
