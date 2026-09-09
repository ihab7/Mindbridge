"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Pencil, Save } from "lucide-react"
import { useT } from "@/components/i18n-provider"

type SessionPrepApi = {
  sessionPrep: {
    id: number
    patient_id: number
    topics_to_discuss: string
    questions_for_therapist: string
    recent_concerns: string
    updated_at: string
  } | null
}

export type SessionPrepInitialData = {
  topics_to_discuss: string
  questions_for_therapist: string
  recent_concerns: string
  updated_at: string
} | null

const MAX_LEN = 1500
const COMPACT_TRUNCATE_LEN = 60
// Fade-out duration + the fade-in's own animation-delay (see the <style> block
// below) — the container needs to stay mounted with both states overlapping
// for this long before we drop the edit form for good.
const TRANSITION_MS = 450

function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delayMs: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useMemo(() => {
    return (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(...args), delayMs)
    }
  }, [callback, delayMs])
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

function formatLastUpdated(value: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function truncate(value: string, max = COMPACT_TRUNCATE_LEN) {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max).trimEnd() + "…"
}

function hasAnyContent(fields: { topicsToDiscuss: string; questionsForTherapist: string; recentConcerns: string }) {
  return Boolean(fields.topicsToDiscuss.trim() || fields.questionsForTherapist.trim() || fields.recentConcerns.trim())
}

function CompactField({ label, value }: { label: string; value: string }) {
  const trimmed = value.trim()
  if (!trimmed) return null
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-card-foreground">{truncate(trimmed)}</div>
    </div>
  )
}

export function SessionPrepCard({
  autosave = true,
  initialData = null,
}: {
  autosave?: boolean
  initialData?: SessionPrepInitialData
}) {
  const t = useT()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialData?.updated_at ?? null)

  const [topicsToDiscuss, setTopicsToDiscuss] = useState(initialData?.topics_to_discuss ?? "")
  const [questionsForTherapist, setQuestionsForTherapist] = useState(initialData?.questions_for_therapist ?? "")
  const [recentConcerns, setRecentConcerns] = useState(initialData?.recent_concerns ?? "")

  // Decided once, from server-preloaded data, so the first paint already shows
  // the right state — no edit-then-jump-to-compact flash.
  const [mode, setMode] = useState<"edit" | "compact">(
    hasAnyContent({
      topicsToDiscuss: initialData?.topics_to_discuss ?? "",
      questionsForTherapist: initialData?.questions_for_therapist ?? "",
      recentConcerns: initialData?.recent_concerns ?? "",
    })
      ? "compact"
      : "edit"
  )
  // True only during the brief window right after a manual save, while both
  // the exiting edit form and the entering compact card are mounted together.
  const [transitioning, setTransitioning] = useState(false)

  async function persist(next: {
    topicsToDiscuss: string
    questionsForTherapist: string
    recentConcerns: string
  }): Promise<boolean> {
    setIsSaving(true)
    setError(null)

    const payload = {
      topicsToDiscuss: next.topicsToDiscuss.trim().slice(0, MAX_LEN),
      questionsForTherapist: next.questionsForTherapist.trim().slice(0, MAX_LEN),
      recentConcerns: next.recentConcerns.trim().slice(0, MAX_LEN),
    }

    try {
      const res = await fetch("/api/patient/session-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const rawBody = await res.text()
        console.error("Session prep save failed:", { status: res.status, body: rawBody })
        throw new Error(t("patient.sessionPrep.errors.failedToSave"))
      }
      const data = (await res.json()) as SessionPrepApi
      setLastUpdated(data.sessionPrep?.updated_at ?? new Date().toISOString())
      return true
    } catch (err) {
      console.error("Session prep save error (client):", err)
      setError(t("patient.sessionPrep.errors.failedToSaveTryAgain"))
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Background autosave persists silently — it never drives the edit/compact
  // transition. Only an explicit click on "Save" does (see handleManualSave),
  // so the panel never collapses out from under someone mid-thought.
  const debouncedAutosave = useDebouncedCallback(
    (next: { topicsToDiscuss: string; questionsForTherapist: string; recentConcerns: string }) => {
      void persist(next)
    },
    1200
  )

  async function handleManualSave() {
    const next = { topicsToDiscuss, questionsForTherapist, recentConcerns }
    const ok = await persist(next)
    if (!ok || !hasAnyContent(next)) return

    if (prefersReducedMotion) {
      setMode("compact")
      return
    }
    setTransitioning(true)
    window.setTimeout(() => {
      setMode("compact")
      setTransitioning(false)
    }, TRANSITION_MS)
  }

  function handleEditClick() {
    setTransitioning(false)
    setMode("edit")
  }

  function onClear() {
    const next = {
      topicsToDiscuss: "",
      questionsForTherapist: "",
      recentConcerns: "",
    }
    setTopicsToDiscuss(next.topicsToDiscuss)
    setQuestionsForTherapist(next.questionsForTherapist)
    setRecentConcerns(next.recentConcerns)
    if (autosave) debouncedAutosave(next)
  }

  const lastUpdatedLabel = formatLastUpdated(lastUpdated)
  const showEdit = mode === "edit" || transitioning
  const showCompact = mode === "compact" || transitioning

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <style>{`
        .sessionPrepStack {
          display: grid;
        }
        .sessionPrepStack > * {
          grid-area: 1 / 1;
          min-width: 0;
        }
        @keyframes sessionPrepFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes sessionPrepFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .sessionPrepEdit--exit {
          animation: sessionPrepFadeOut 200ms ease-out forwards;
        }
        .sessionPrepCompact--enter {
          animation: sessionPrepFadeIn 200ms ease-in 250ms both;
        }
        @media (prefers-reduced-motion: reduce) {
          .sessionPrepEdit--exit,
          .sessionPrepCompact--enter {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-card-foreground">{t("patient.sessionPrep.title")}</h2>
        {isSaving && (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.saving")}
          </span>
        )}
      </div>

      <p className="mb-5 text-sm text-muted-foreground">{t("patient.sessionPrep.subtitle")}</p>

      <div className="sessionPrepStack">
        {showEdit && (
          <div className={`flex flex-col gap-4 ${transitioning ? "sessionPrepEdit--exit" : ""}`}>
            <div>
              <label htmlFor="topicsToDiscuss" className="mb-1.5 block text-sm font-medium text-card-foreground">
                {t("patient.sessionPrep.topics.label")}
              </label>
              <textarea
                id="topicsToDiscuss"
                value={topicsToDiscuss}
                onChange={(e) => {
                  const v = e.target.value.slice(0, MAX_LEN)
                  setTopicsToDiscuss(v)
                  if (autosave) debouncedAutosave({ topicsToDiscuss: v, questionsForTherapist, recentConcerns })
                }}
                rows={3}
                maxLength={MAX_LEN}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
                placeholder={t("patient.sessionPrep.topics.placeholder")}
              />
              <div className="mt-1 text-right text-xs text-muted-foreground">{topicsToDiscuss.length}/{MAX_LEN}</div>
            </div>

            <div>
              <label htmlFor="questionsForTherapist" className="mb-1.5 block text-sm font-medium text-card-foreground">
                {t("patient.sessionPrep.questions.label")}
              </label>
              <textarea
                id="questionsForTherapist"
                value={questionsForTherapist}
                onChange={(e) => {
                  const v = e.target.value.slice(0, MAX_LEN)
                  setQuestionsForTherapist(v)
                  if (autosave) debouncedAutosave({ topicsToDiscuss, questionsForTherapist: v, recentConcerns })
                }}
                rows={3}
                maxLength={MAX_LEN}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
                placeholder={t("patient.sessionPrep.questions.placeholder")}
              />
              <div className="mt-1 text-right text-xs text-muted-foreground">{questionsForTherapist.length}/{MAX_LEN}</div>
            </div>

            <div>
              <label htmlFor="recentConcerns" className="mb-1.5 block text-sm font-medium text-card-foreground">
                {t("patient.sessionPrep.concerns.label")}
              </label>
              <textarea
                id="recentConcerns"
                value={recentConcerns}
                onChange={(e) => {
                  const v = e.target.value.slice(0, MAX_LEN)
                  setRecentConcerns(v)
                  if (autosave) debouncedAutosave({ topicsToDiscuss, questionsForTherapist, recentConcerns: v })
                }}
                rows={3}
                maxLength={MAX_LEN}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
                placeholder={t("patient.sessionPrep.concerns.placeholder")}
              />
              <div className="mt-1 text-right text-xs text-muted-foreground">{recentConcerns.length}/{MAX_LEN}</div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {lastUpdatedLabel ? <span>{t("common.lastUpdated", { value: lastUpdatedLabel })}</span> : <span />}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isSaving}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
                >
                  {t("common.clear")}
                </button>
                <button
                  type="button"
                  onClick={() => void handleManualSave()}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {t("common.save")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showCompact && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleEditClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleEditClick()
              }
            }}
            className={`flex cursor-pointer flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50 ${
              transitioning ? "sessionPrepCompact--enter" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-3">
                <CompactField label={t("patient.sessionPrep.topics.label")} value={topicsToDiscuss} />
                <CompactField label={t("patient.sessionPrep.questions.label")} value={questionsForTherapist} />
                <CompactField label={t("patient.sessionPrep.concerns.label")} value={recentConcerns} />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditClick()
                }}
                aria-label={t("patient.sessionPrep.compact.editAria")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            {lastUpdatedLabel && (
              <div className="text-xs text-muted-foreground">{t("common.lastUpdated", { value: lastUpdatedLabel })}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
