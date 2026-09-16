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
import { VideoCallCard } from "@/components/patient/video-call-card"

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

  // Recent-entries card. Counted in SQL rather than from `entries` above:
  // that one is LIMIT 14, so it cannot answer "how many days this month"
  // once someone logs more than 14 days. All three scalars come from the
  // same statement so the month boundary, the last-entry date and "today"
  // are all read off one clock.
  const entriesStatsRows = (await sql`
    SELECT
      COUNT(DISTINCT created_at::date)
        FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS days_this_month,
      MAX(created_at::date)::text AS last_entry_date,
      CURRENT_DATE::text AS today
    FROM journal_entries
    WHERE patient_id = ${user.id}
  `) as Record<string, unknown>[]
  const entriesStats = entriesStatsRows[0] ?? {}

  // One row per calendar day (the latest that day), newest first — the
  // expanded list never shows the same day twice.
  const recentDayRows = (await sql`
    SELECT DISTINCT ON (created_at::date)
      created_at::date::text AS entry_date, mood, sleep_hours, medication_taken
    FROM journal_entries
    WHERE patient_id = ${user.id}
    ORDER BY created_at::date DESC, created_at DESC
    LIMIT 10
  `) as Record<string, unknown>[]

  // Cast to text in SQL above rather than reading the driver's Date object:
  // neon hydrates date/timestamptz columns into JS Dates, and stringifying
  // one yields "Thu Sep 14 2026 …", not an ISO day.
  const toDateOnly = (v: unknown) => String(v)

  // Today's check-in, in the clinic's own calendar day (entry_date already
  // carries that — see migrate.sql). Preloaded the same way as SessionPrep
  // below: the card picks compact-vs-form on first paint, no flash.
  const todayEntryRows = (await sql`
    SELECT id, mood, anxiety, sleep_hours::text AS sleep_hours, medication_taken,
           side_effects, side_effects_other, challenges, achievements
    FROM journal_entries
    WHERE patient_id = ${user.id}
      AND entry_date = ((now() AT TIME ZONE 'Africa/Tunis')::date)
    LIMIT 1
  `) as Record<string, unknown>[]
  const todayEntry = todayEntryRows.length > 0
    ? {
        mood: Number(todayEntryRows[0].mood),
        anxiety: Number(todayEntryRows[0].anxiety),
        sleepHours: String(todayEntryRows[0].sleep_hours),
        medicationTaken: Boolean(todayEntryRows[0].medication_taken),
        sideEffects: Array.isArray(todayEntryRows[0].side_effects) ? (todayEntryRows[0].side_effects as string[]) : [],
        sideEffectsOther: todayEntryRows[0].side_effects_other == null ? "" : String(todayEntryRows[0].side_effects_other),
        challenges: String(todayEntryRows[0].challenges ?? ""),
        achievements: String(todayEntryRows[0].achievements ?? ""),
      }
    : null

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
      <VideoCallCard patientName={user.name} />

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
            <JournalForm todayEntry={todayEntry} />
            <SessionPrepCard initialData={sessionPrepInitialData} />
          </div>
        </div>
        <div className="order-2 flex flex-col gap-6">
          <WeeklyWellbeing entries={wellbeingEntries} />
          <SleepNudgeBanner />
        </div>
      </div>

      <RecentEntries
        daysThisMonth={Number(entriesStats.days_this_month ?? 0)}
        lastEntryDate={entriesStats.last_entry_date ? toDateOnly(entriesStats.last_entry_date) : null}
        todayDate={toDateOnly(entriesStats.today)}
        entries={recentDayRows.map((r) => ({
          date: toDateOnly(r.entry_date),
          mood: Number(r.mood),
          sleepHours: Number(r.sleep_hours),
          medicationTaken: Boolean(r.medication_taken),
        }))}
      />
    </div>
  )
}
