import React, { Suspense } from "react"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Brain, Moon, Pill, TrendingUp, MessageCircle } from "lucide-react"
import { WellbeingPanelServer } from "@/components/practitioner/wellbeing-panel-server"
import { WellbeingPanelSkeleton } from "@/components/practitioner/WellbeingPanel"
import { ReportsSection } from "@/components/practitioner/reports/ReportsSection"
import { AlertList } from "@/components/practitioner/alert-list"
import { MentalStatusBadge } from "@/components/mental-status-badge"
import { PractitionerFeedbackForm } from "@/components/practitioner/feedback-form"
import { ClinicalRecordCard } from "@/components/practitioner/clinical-record-card"
import { SessionPrepViewer } from "@/components/practitioner/session-prep-viewer"
import { ProgramProgressCard } from "@/components/practitioner/program-progress-card"
import {
  parseSideEffectsFromDb,
  sideEffectsKeyToLabel,
} from "@/lib/side-effects"

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

  const patientRows = (await sql`SELECT id, name, email FROM users WHERE id = ${patientId}`) as Record<string, unknown>[]
  if (patientRows.length === 0) redirect("/practitioner/patients")
  const patient = patientRows[0] as { name: string; email: string }

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
      <div className="flex items-center gap-4">
        <Link
          href="/practitioner/patients"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
          aria-label="Back to patients"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{patient.email}</p>
        </div>
        <Link
          href={`/practitioner/messages?patient=${patientId}`}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4" />
          Message
        </Link>
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

      {/* Wellbeing panel — scannable clinical summary over full-precision chart */}
      <Suspense fallback={<WellbeingPanelSkeleton />}>
        <WellbeingPanelServer
          patientId={patientId}
          patientName={patient.name}
          messageHref={`/practitioner/messages?patient=${patientId}`}
        />
      </Suspense>

      {/* Printable clinical consultation letters */}
      <Suspense fallback={null}>
        <ReportsSection patientId={patientId} practitionerId={user.id} />
      </Suspense>

      {/* Alerts */}
      {openAlerts.length > 0 && (
        <AlertList alerts={openAlerts} />
      )}

      {/* Recent Entries Table */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">Journal Entries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Date</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Mood</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Anxiety</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Sleep</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Med</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Side effects</th>
                <th className="pb-3 font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 14).map((entry: Record<string, unknown>) => {
                const mood = Number(entry.mood)
                const moodClass = mood <= 3 ? "text-destructive" : mood <= 5 ? "text-amber-600 dark:text-amber-400" : "text-primary"

                const parsedSideEffects = parseSideEffectsFromDb(
                  entry.side_effects,
                  entry.side_effects_other,
                  entry.side_effects_legacy
                )

                return (
                  <tr key={String(entry.id)} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 text-card-foreground">
                      {new Date(String(entry.created_at)).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className={`py-3 pr-4 font-medium ${moodClass}`}>{mood}/10</td>
                    <td className="py-3 pr-4 text-card-foreground">{String(entry.anxiety)}/10</td>
                    <td className="py-3 pr-4 text-card-foreground">{String(entry.sleep_hours)}h</td>
                    <td className="py-3 pr-4">
                      <span className={entry.medication_taken ? "text-primary" : "text-destructive"}>
                        {entry.medication_taken ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {parsedSideEffects.sideEffects?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {parsedSideEffects.sideEffects.map((k) => {
                            if (k === "other") {
                              const detail = parsedSideEffects.sideEffectsOther?.trim()
                              return (
                                <span
                                  key={k}
                                  className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs text-card-foreground"
                                  title={detail ? `Other: ${detail}` : "Other"}
                                >
                                  {detail ? `Other: ${detail}` : "Other"}
                                </span>
                              )
                            }

                            return (
                              <span
                                key={k}
                                className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs text-card-foreground"
                              >
                                {sideEffectsKeyToLabel(k)}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <span>Not reported</span>
                      )}
                    </td>
                    <td className="max-w-xs truncate py-3 text-muted-foreground">
                      {String(entry.challenges || entry.achievements || "-")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
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
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-card-foreground">{value}</p>
    </div>
  )
}
