import React, { Suspense } from "react"
import { getSession } from "@/lib/auth"
import { UserAvatar } from "@/components/user-avatar"
import { avatarUrl } from "@/lib/avatars-shared"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Brain, Moon, Pill, TrendingUp, MessageCircle } from "lucide-react"
import { PatientProgressServer } from "@/components/practitioner/progress/patient-progress-server"
import { PatientProgressSkeleton } from "@/components/practitioner/progress/patient-progress"
import { ReportsSection } from "@/components/practitioner/reports/ReportsSection"
import { AlertList } from "@/components/practitioner/alert-list"
import { MentalStatusBadge } from "@/components/mental-status-badge"
import { PractitionerFeedbackForm } from "@/components/practitioner/feedback-form"
import { ClinicalRecordCard } from "@/components/practitioner/clinical-record-card"
import { VideoConsultationDialog } from "@/components/practitioner/video-consultation-dialog"
import { SessionPrepViewer } from "@/components/practitioner/session-prep-viewer"
import { ProgramProgressCard } from "@/components/practitioner/program-progress-card"
import { markLinksSeen } from "@/lib/linking/codes"

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSession()
  if (!user) redirect("/login")

  const sql = getSql()

  const { id } = await params
  const patientId = parseInt(id)

  // Verify ownership
  const authorized = (await sql`
    SELECT 1 FROM patients WHERE user_id = ${patientId} AND practitioner_id = ${user.id}
  `) as Record<string, unknown>[]
  if (authorized.length === 0) redirect("/practitioner/patients")

  // Opening a newly linked patient's page acknowledges the "new patient
  // linked" notice for them. Best-effort: never blocks the page.
  await markLinksSeen(sql, user.id, patientId).catch(() => {})

  const patientRows = (await sql`SELECT id, name, email, avatar_id::text AS avatar_id FROM users WHERE id = ${patientId}`) as Record<string, unknown>[]
  if (patientRows.length === 0) redirect("/practitioner/patients")
  const patient = patientRows[0] as { name: string; email: string; avatar_id: string | null }

  const entries = (await sql`
    SELECT * FROM journal_entries
    WHERE patient_id = ${patientId}
    ORDER BY created_at DESC
    LIMIT 30
  `) as Record<string, unknown>[]

  const alerts = (await sql`
    SELECT * FROM alerts
    WHERE patient_id = ${patientId}
    ORDER BY created_at DESC
  `) as Record<string, unknown>[]

  // Analytics
  const totalEntries = entries.length
  const medTakenCount = entries.filter((e: Record<string, unknown>) => e.medication_taken).length
  const adherenceRate = totalEntries > 0 ? Math.round((medTakenCount / totalEntries) * 100) : 0
  const avgMood = totalEntries > 0
    ? (entries.reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.mood), 0) / totalEntries).toFixed(1)
    : "N/A"
  const avgSleep = totalEntries > 0
    ? (entries.reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.sleep_hours), 0) / totalEntries).toFixed(1)
    : "N/A"
  const avgAnxiety = totalEntries > 0
    ? (entries.reduce((sum: number, e: Record<string, unknown>) => sum + Number(e.anxiety), 0) / totalEntries).toFixed(1)
    : "N/A"

  const openAlerts = alerts.filter((a: Record<string, unknown>) => a.status === "open") as any

  return (
    <div className="flex flex-col gap-6">
      {/* Wraps on phones so the action buttons never widen the page (which would
          also stretch fixed overlays such as the day-detail sheet). */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Link
          href="/practitioner/patients"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
          aria-label="Back to patients"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <UserAvatar
          src={avatarUrl(patient.avatar_id)}
          name={patient.name}
          decorative
          className="h-12 w-12 bg-primary/10 text-lg font-semibold text-primary"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-foreground">{patient.name}</h1>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{patient.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <VideoConsultationDialog patientId={patientId} patientName={patient.name} />
          <Link
            href={`/practitioner/messages?patient=${patientId}`}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MiniStat icon={<Brain className="h-4 w-4" />} label="Avg Mood" value={avgMood} />
        <MiniStat icon={<TrendingUp className="h-4 w-4" />} label="Avg Anxiety" value={avgAnxiety} />
        <MiniStat icon={<Moon className="h-4 w-4" />} label="Avg Sleep" value={`${avgSleep}h`} />
        <MiniStat icon={<Pill className="h-4 w-4" />} label="Med Adherence" value={`${adherenceRate}%`} />
        <MiniStat label="Total Entries" value={String(totalEntries)} />
      </div>

      <div className="max-w-3xl">
        <SessionPrepViewer
          patientId={patientId}
          patientName={patient.name}
          feedbackAnchorId="practitioner-feedback"
        />
      </div>

      <div className="max-w-3xl">
        <ProgramProgressCard patientId={patientId} patientName={patient.name} />
      </div>

      <div id="practitioner-feedback" className="max-w-3xl scroll-mt-20">
        <PractitionerFeedbackForm patientId={patientId} />
      </div>

      <div className="max-w-3xl">
        <ClinicalRecordCard patientId={patientId} />
      </div>

      {/* Patient progress — current state, trend, what changed, signals, day by day */}
      <Suspense fallback={<PatientProgressSkeleton />}>
        <PatientProgressServer patientId={patientId} messageHref={`/practitioner/messages?patient=${patientId}`} />
      </Suspense>

      {/* Printable clinical consultation letters */}
      <Suspense fallback={null}>
        <ReportsSection patientId={patientId} practitionerId={user.id} />
      </Suspense>

      {/* Alerts */}
      {openAlerts.length > 0 && (
        <AlertList alerts={openAlerts} />
      )}
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="mb-card rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-card-foreground">{value}</p>
    </div>
  )
}
