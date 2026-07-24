"use client"

import { useCallback, useEffect, useState } from "react"
import {
  AlertTriangle,
  Check,
  ClipboardList,
  HelpCircle,
  Loader2,
  MessageSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type SessionPrep = {
  topics_to_discuss: string
  questions_for_therapist: string
  recent_concerns: string
  updated_at: string
  reviewed_at: string | null
}

type ApiResponse = { sessionPrep: SessionPrep | null }

function formatTimestamp(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function Section({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-primary">
        {icon}
        {label}
      </div>
      <div className="rounded-md border-l-4 border-primary bg-muted/60 px-3 py-2.5 text-sm text-foreground">
        {value.trim() ? (
          value
        ) : (
          <span className="italic text-muted-foreground">Patient hasn&apos;t added anything yet.</span>
        )}
      </div>
    </div>
  )
}

export function SessionPrepViewer({
  patientId,
  patientName,
  feedbackAnchorId,
}: {
  patientId: number
  patientName: string
  /** id of the element to scroll to when "Add to care plan" is clicked (the existing feedback form) */
  feedbackAnchorId?: string
}) {
  const [prep, setPrep] = useState<SessionPrep | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [error, setError] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/session-prep`)
      if (!res.ok) throw new Error("failed")
      const data = (await res.json()) as ApiResponse
      setPrep(data.sessionPrep)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [patientId])

  useEffect(() => {
    void load()
  }, [load])

  async function markReviewed() {
    setReviewing(true)
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/session-prep`, { method: "POST" })
      if (!res.ok) throw new Error("failed")
      const data = (await res.json()) as ApiResponse
      setPrep(data.sessionPrep)
    } catch {
      setError(true)
    } finally {
      setReviewing(false)
    }
  }

  function goToCarePlan() {
    if (!feedbackAnchorId) return
    document.getElementById(feedbackAnchorId)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const hasContent = Boolean(
    prep && (prep.topics_to_discuss.trim() || prep.questions_for_therapist.trim() || prep.recent_concerns.trim())
  )
  const isReviewed = Boolean(prep?.reviewed_at) && (!prep?.updated_at || new Date(prep.reviewed_at!) >= new Date(prep.updated_at))
  const isNew = hasContent && !isReviewed

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Session Preparation</h2>
            {isReviewed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Check className="h-3 w-3" />
                Reviewed
              </span>
            )}
            {isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Sparkles className="h-3 w-3" />
                New
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            What {patientName} wants to discuss in the next session
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={loading || refreshing}
          aria-label="Refresh"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {formatTimestamp(prep?.updated_at ?? null) && (
        <p className="mb-4 text-xs text-muted-foreground">
          Last updated: {formatTimestamp(prep!.updated_at)}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="py-6 text-sm text-destructive">Couldn&apos;t load session prep. Try refreshing.</p>
      ) : !hasContent ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No session notes yet. The patient hasn&apos;t prepared for the next session.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Section
            icon={<MessageSquare className="h-3.5 w-3.5" />}
            label="Things they want to discuss"
            value={prep!.topics_to_discuss}
          />
          <Section
            icon={<HelpCircle className="h-3.5 w-3.5" />}
            label="Their questions for you"
            value={prep!.questions_for_therapist}
          />
          <Section
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            label="Recent concerns"
            value={prep!.recent_concerns}
          />

          <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void markReviewed()}
              disabled={reviewing || isReviewed}
            >
              {reviewing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {isReviewed ? "Reviewed" : "Mark as reviewed"}
            </Button>
            {feedbackAnchorId && (
              <Button type="button" size="sm" onClick={goToCarePlan}>
                Add to care plan
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
