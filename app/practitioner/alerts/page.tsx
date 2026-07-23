import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import { AlertList } from "@/components/practitioner/alert-list"
import { CheckCircle2, Clock } from "lucide-react"

export default async function AlertsPage() {
  const user = await getSession()
  if (!user) redirect("/login")

  const sql = getSql()

  const openAlerts = await sql`
    SELECT a.*, u.name as patient_name
    FROM alerts a
    JOIN users u ON a.patient_id = u.id
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${user.id} AND a.status = 'open'
    ORDER BY a.created_at DESC
  `

  const resolvedAlerts = await sql`
    SELECT a.*, u.name as patient_name
    FROM alerts a
    JOIN users u ON a.patient_id = u.id
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${user.id} AND a.status = 'resolved'
    ORDER BY a.created_at DESC
    LIMIT 10
  `

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor and resolve patient alerts
        </p>
      </div>

      <AlertList alerts={openAlerts} showPatientName />

      {resolvedAlerts.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground">
              Recently Resolved
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {resolvedAlerts.map((alert: Record<string, unknown>) => (
              <div
                key={String(alert.id)}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 opacity-60"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-card-foreground">
                    <span className="font-medium">{String(alert.patient_name)}</span>
                    {" - "}
                    {String(alert.description)}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {new Date(String(alert.created_at)).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
