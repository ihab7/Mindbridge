import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Brain, Moon, Pill, ChevronRight, Sparkles } from "lucide-react"
import { MentalStatusBadge } from "@/components/mental-status-badge"

export default async function PatientsListPage() {
  const user = await getSession()
  if (!user) redirect("/login")

  const sql = getSql()

  const patients = await sql`
    SELECT u.id, u.name, u.email, p.created_at as enrolled_at,
      (SELECT COUNT(*) FROM journal_entries j WHERE j.patient_id = u.id) as entry_count,
      (SELECT COUNT(*) FROM alerts a WHERE a.patient_id = u.id AND a.status = 'open') as open_alerts,
      (SELECT mood FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as latest_mood,
      (SELECT anxiety FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as latest_anxiety,
      (SELECT sleep_hours FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as latest_sleep,
      (SELECT medication_taken FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as latest_med,
      (SELECT created_at FROM journal_entries j WHERE j.patient_id = u.id ORDER BY j.created_at DESC LIMIT 1) as last_entry_at,
      (SELECT (topics_to_discuss != '' OR questions_for_therapist != '' OR recent_concerns != '')
         AND (reviewed_at IS NULL OR reviewed_at < updated_at)
       FROM session_prep sp WHERE sp.patient_id = u.id) as has_new_prep
    FROM users u
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${user.id}
    ORDER BY u.name ASC
  `

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patients</h1>
        <p className="mt-1 text-muted-foreground">
          {patients.length} patient{patients.length !== 1 ? "s" : ""} in your care
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {patients.map((patient: Record<string, unknown>) => {
          const mood = patient.latest_mood ? Number(patient.latest_mood) : null
          const hasAlerts = Number(patient.open_alerts) > 0

          return (
            <Link
              key={String(patient.id)}
              href={`/practitioner/patients/${patient.id}`}
              className={`group flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:bg-muted ${
                hasAlerts ? "border-destructive/30" : "border-border"
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {String(patient.name).charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-card-foreground">{String(patient.name)}</p>
                  <MentalStatusBadge mood={mood} />
                  {hasAlerts && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      {String(patient.open_alerts)} alert{Number(patient.open_alerts) !== 1 ? "s" : ""}
                    </span>
                  )}
                  {Boolean(patient.has_new_prep) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                      <Sparkles className="h-2.5 w-2.5" />
                      New session prep
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{String(patient.email)}</p>
                {mood != null && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Mood {mood}/10
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Moon className="h-3 w-3" />
                      {String(patient.latest_sleep)}h sleep
                    </span>
                    <span className={`inline-flex items-center gap-1 ${patient.latest_med ? "text-primary" : "text-destructive"}`}>
                      <Pill className="h-3 w-3" />
                      {patient.latest_med ? "Med taken" : "Med missed"}
                    </span>
                    <span className="text-muted-foreground">
                      {String(patient.entry_count)} entries
                    </span>
                  </div>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
