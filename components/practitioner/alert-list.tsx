"use client"

import React, { useState } from "react"
import { Bell, CheckCircle2, Loader2 } from "lucide-react"

type Alert = {
  id: number
  patient_id: number
  alert_type: string
  description: string
  status: string
  created_at: string
  patient_name?: string
}

function alertTypeLabel(type: string) {
  switch (type) {
    case "mood_drop": return "Mood Drop"
    case "medication_missed": return "Medication Missed"
    case "sleep_critical": return "Critical Sleep"
    case "anxiety_spike": return "Anxiety Spike"
    default: return type
  }
}

function alertTypeColor(type: string) {
  switch (type) {
    case "mood_drop": return "bg-destructive/10 text-destructive"
    case "medication_missed": return "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
    case "sleep_critical": return "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
    case "anxiety_spike": return "bg-destructive/10 text-destructive"
    default: return "bg-muted text-muted-foreground"
  }
}

export function AlertList({ alerts: initialAlerts, showPatientName = false }: { alerts: Alert[]; showPatientName?: boolean }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [resolving, setResolving] = useState<number | null>(null)

  async function handleResolve(alertId: number) {
    setResolving(alertId)
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, { method: "POST" })
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      }
    } catch {
      alert("Failed to resolve alert")
    } finally {
      setResolving(null)
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-primary" />
        <p className="font-medium text-card-foreground">All clear</p>
        <p className="mt-1 text-sm text-muted-foreground">No open alerts</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-destructive" />
        <h3 className="text-lg font-semibold text-card-foreground">
          Open Alerts ({alerts.length})
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
          >
            <div className={`mt-0.5 shrink-0 rounded-md px-2 py-1 text-xs font-medium ${alertTypeColor(alert.alert_type)}`}>
              {alertTypeLabel(alert.alert_type)}
            </div>
            <div className="flex-1">
              {showPatientName && alert.patient_name && (
                <p className="text-sm font-medium text-card-foreground">{alert.patient_name}</p>
              )}
              <p className="text-sm text-muted-foreground">{alert.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(alert.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              onClick={() => handleResolve(alert.id)}
              disabled={resolving === alert.id}
              className="shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {resolving === alert.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Resolve"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
