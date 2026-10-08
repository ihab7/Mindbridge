import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import { WeeklyWellbeing } from "@/components/wellbeing/weekly-wellbeing"
import { RecentEntries } from "@/components/patient/recent-entries"
import { MentalStatusBadge } from "@/components/mental-status-badge"
import { SessionPrepCard } from "@/components/patient/session-prep-card"
import { getServerI18n } from "@/lib/server-i18n"
import { PractitionerFeedbackCard } from "@/components/patient/practitioner-feedback-card"
import { DailyWellnessTasks } from "@/components/patient/daily-wellness-tasks"
import { VideoCallCard } from "@/components/patient/video-call-card"
import { LinkPractitionerCard } from "@/components/patient/link-practitioner-card"
import { UserAvatar } from "@/components/user-avatar"
import { avatarUrl } from "@/lib/avatars-shared"
import { StatusStrip, type NextSession } from "@/components/patient/dashboard/status-strip"
import { CheckInSlot } from "@/components/patient/dashboard/check-in-slot"
import { ContinueCard } from "@/components/patient/dashboard/continue-card"
import { CollapsibleSection } from "@/components/patient/dashboard/collapsible-section"
import { Mascot } from "@/components/mascot/Mascot"

export default async function PatientDashboard() {
  const user = await getSession()
  if (!user) redirect("/login")

  const { t, locale } = await getServerI18n()

  const sql = getSql()

  // Not linked to a practitioner yet (signed up without a code): the linking
  // step replaces the dashboard until they enter one.
  const linkRows = (await sql`SELECT 1 FROM patients WHERE user_id = ${user.id}`) as Record<string, unknown>[]
  if (linkRows.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t("patient.dashboard.welcomeBack", { name: user.name.split(" ")[0] })}
        </h1>
        <div className="mx-auto -mb-2 flex w-full max-w-lg justify-center">
          <Mascot pose="wave" size={96} />
        </div>
        <LinkPractitionerCard />
      </div>
    )
  }

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
  // are all read off one clock — the clinic's (Africa/Tunis), not the
  // database session's GMT, so 00:00–01:00 Tunis counts as the new day.
  const entriesStatsRows = (await sql`
    SELECT
      COUNT(DISTINCT entry_date)
        FILTER (WHERE entry_date >= date_trunc('month', (now() AT TIME ZONE 'Africa/Tunis'))::date) AS days_this_month,
      MAX(entry_date)::text AS last_entry_date,
      ((now() AT TIME ZONE 'Africa/Tunis')::date)::text AS today
    FROM journal_entries
    WHERE patient_id = ${user.id}
  `) as Record<string, unknown>[]
  const entriesStats = entriesStatsRows[0] ?? {}

  // One row per clinic day, newest first. entry_date is unique per patient
  // (journal_entries_one_per_day), so no de-duplication is needed.
  const recentDayRows = (await sql`
    SELECT entry_date::text AS entry_date, mood, sleep_hours, medication_taken
    FROM journal_entries
    WHERE patient_id = ${user.id}
    ORDER BY entry_date DESC
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
  // Status strip — next session. Two sources exist; the scheduled video call
  // wins because it carries a real time and a way to join. The practitioner's
  // next_appointment_at is a date typed into a date input (no time of day),
  // so the chip shows a date only for that source — see NextSession.kind.
  const nextVideoRows = (await sql`
    SELECT scheduled_at
    FROM video_consultations
    WHERE patient_id = ${user.id}
      AND mode = 'scheduled'
      AND status IN ('pending', 'active')
      AND scheduled_at > NOW()
    ORDER BY scheduled_at ASC
    LIMIT 1
  `) as Record<string, unknown>[]
  const nextApptRows = (await sql`
    SELECT next_appointment_at
    FROM practitioner_feedback
    WHERE patient_id = ${user.id} AND next_appointment_at > NOW()
    ORDER BY next_appointment_at ASC
    LIMIT 1
  `) as Record<string, unknown>[]
  const nextSession: NextSession | null = nextVideoRows.length > 0
    ? { at: new Date(String(nextVideoRows[0].scheduled_at)).toISOString(), kind: "video", href: "#video-call" }
    : nextApptRows.length > 0
      ? { at: new Date(String(nextApptRows[0].next_appointment_at)).toISOString(), kind: "appointment", href: "#guidance" }
      : null

  const avatarRows = (await sql`SELECT avatar_id::text AS avatar_id FROM users WHERE id = ${user.id}`) as Record<string, unknown>[]

  const sessionPrepInitialData = sessionPrepRows.length > 0
    ? {
        topics_to_discuss: String(sessionPrepRows[0].topics_to_discuss ?? ""),
        questions_for_therapist: String(sessionPrepRows[0].questions_for_therapist ?? ""),
        recent_concerns: String(sessionPrepRows[0].recent_concerns ?? ""),
        updated_at: String(sessionPrepRows[0].updated_at),
      }
    : null

  const today = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Tunis" })
    .format(new Date())

  const recentEntriesCard = (
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
  )

  return (
    <div className="flex flex-col gap-4">
      {/* An active call outranks everything, and the next-session chip links here. */}
      <div id="video-call" className="scroll-mt-28 empty:hidden">
        <VideoCallCard patientName={user.name} />
      </div>

      {/* Greeting: avatar | name over (date · mood badge) | compact mascot.
          Stacked text keeps the row a single line on every width, instead of
          the badge and date wrapping under the name on phones. */}
      <div className="flex items-center gap-3">
        <UserAvatar
          src={avatarUrl(avatarRows[0]?.avatar_id as string | null)}
          name={user.name}
          decorative
          className="h-10 w-10 shrink-0 bg-primary/10 text-sm font-semibold text-primary"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-tight text-foreground">
            {t("patient.dashboard.greeting", { name: user.name.split(" ")[0] })}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm text-muted-foreground">{today}</p>
            <MentalStatusBadge mood={entries.length > 0 ? Number(entries[0].mood) : null} />
          </div>
        </div>
        <Mascot size={32} className="shrink-0" />
      </div>

      <StatusStrip
        nextSession={nextSession}
        unreadCount={Number(unreadMessages[0]?.count ?? 0)}
        checkedInToday={todayEntry !== null}
      />

      {/* One grid, one instance of every card. Below lg the two column
          wrappers are `display: contents`, so their children lay themselves
          out in this grid: check-in and guidance share row 1 from 360px and
          everything else spans the full width, ordered by priority. From lg
          the wrappers become the two real columns. */}
      <div className="grid gap-4 min-[360px]:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          {/* While the full form is open it takes the whole row on phones
              (guidance drops below); the CTA and the saved summary stay half-width. */}
          <div className="order-1 min-w-0 has-[form]:col-span-full lg:order-none">
            <CheckInSlot todayEntry={todayEntry} />
          </div>
          <div className="order-3 col-span-full lg:order-none lg:col-auto">
            <SessionPrepCard initialData={sessionPrepInitialData} />
          </div>
          <div className="order-4 col-span-full lg:order-none lg:col-auto">{recentEntriesCard}</div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <div id="guidance" className="order-2 min-w-0 scroll-mt-28 lg:order-none">
            <PractitionerFeedbackCard compact />
          </div>
          <div className="order-5 col-span-full lg:order-none lg:col-auto">
            <ContinueCard />
          </div>

          {/* Kept, one tap away: not part of the priority order, but nothing is lost. */}
          <div className="order-6 col-span-full lg:order-none lg:col-auto">
            <CollapsibleSection title={t("patient.wellness.title")} summary={t("patient.dashboard.more.tasksSummary")}>
              <DailyWellnessTasks />
            </CollapsibleSection>
          </div>
          <div className="order-7 col-span-full lg:order-none lg:col-auto">
            <CollapsibleSection title={t("patient.dashboard.more.week")} summary={t("patient.dashboard.more.weekSummary")}>
              <WeeklyWellbeing entries={wellbeingEntries} />
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  )
}
