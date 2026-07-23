import React from "react"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Bell, TrendingDown, Pill } from "lucide-react"
import { MentalStatusBadge } from "@/components/mental-status-badge"
import { ConsultationReportWidget } from "@/components/practitioner/consultation-report/report-widget"

export default async function PractitionerDashboard() {
  const user = await getSession()
  if (!user) redirect("/login")

  const sql = getSql()

  const patients = await sql`
    SELECT u.id, u.name,
      (SELECT mood FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as latest_mood,
      (SELECT created_at FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as last_entry_at
    FROM users u
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${user.id}
    ORDER BY u.name ASC
  `

  const openAlerts = await sql`
    SELECT a.*, u.name as patient_name
    FROM alerts a
    JOIN users u ON a.patient_id = u.id
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${user.id} AND a.status = 'open'
    ORDER BY a.created_at DESC
    LIMIT 5
  `

  const totalPatients = patients.length
  const totalOpenAlerts = openAlerts.length
  const criticalPatients = patients.filter(
    (p: Record<string, unknown>) => Number(p.latest_mood) <= 3
  ).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here is an overview of your patients today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Patients"
          value={String(totalPatients)}
        />
        <StatCard
          icon={<Bell className="h-5 w-5" />}
          label="Open Alerts"
          value={String(totalOpenAlerts)}
          variant={totalOpenAlerts > 0 ? "warning" : "default"}
        />
        <StatCard
          icon={<TrendingDown className="h-5 w-5" />}
          label="Critical Mood"
          value={String(criticalPatients)}
          variant={criticalPatients > 0 ? "danger" : "default"}
        />
        <StatCard
          icon={<Pill className="h-5 w-5" />}
          label="Active Tracking"
          value={`${patients.filter((p: Record<string, unknown>) => p.last_entry_at).length}/${totalPatients}`}
        />
      </div>

      <ConsultationReportWidget />

      {/* Open Alerts */}
      {openAlerts.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Active Alerts</h2>
            <Link
              href="/practitioner/alerts"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {openAlerts.map((alert: Record<string, unknown>) => (
              <div
                key={String(alert.id)}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <Bell className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {String(alert.patient_name)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {String(alert.description)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(String(alert.created_at)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Link
                  href={`/practitioner/patients/${alert.patient_id}`}
                  className="shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Patient Overview */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Patients</h2>
          <Link
            href="/practitioner/patients"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient: Record<string, unknown>) => (
              <Link
                key={String(patient.id)}
                href={`/practitioner/patients/${patient.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {String(patient.name).charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-card-foreground">
                      {String(patient.name)}
                    </p>
                    <MentalStatusBadge mood={patient.latest_mood ? Number(patient.latest_mood) : null} size="sm" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {patient.last_entry_at
                      ? `Last entry: ${new Date(String(patient.last_entry_at)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "No entries yet"}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ReactNode
  label: string
  value: string
  variant?: "default" | "warning" | "danger"
}) {
  const iconBg =
    variant === "danger"
      ? "bg-destructive/10 text-destructive"
      : variant === "warning"
        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
        : "bg-primary/10 text-primary"

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}
