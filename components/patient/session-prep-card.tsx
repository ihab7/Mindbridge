"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Save } from "lucide-react"
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

const MAX_LEN = 1500

function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delayMs: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useMemo(() => {
    return (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(...args), delayMs)
    }
  }, [callback, delayMs])
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

export function SessionPrepCard({
  autosave = true,
}: {
  autosave?: boolean
}) {
  const t = useT()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const [topicsToDiscuss, setTopicsToDiscuss] = useState("")
  const [questionsForTherapist, setQuestionsForTherapist] = useState("")
  const [recentConcerns, setRecentConcerns] = useState("")

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/patient/session-prep")
      if (!res.ok) throw new Error(t("patient.sessionPrep.errors.failedToLoad"))
      const data = (await res.json()) as SessionPrepApi

      const prep = data.sessionPrep
      setTopicsToDiscuss(prep?.topics_to_discuss ?? "")
      setQuestionsForTherapist(prep?.questions_for_therapist ?? "")
      setRecentConcerns(prep?.recent_concerns ?? "")
      setLastUpdated(prep?.updated_at ?? null)
    } catch {
      setError(t("patient.sessionPrep.errors.failedToLoadTryAgain"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function save(next?: {
    topicsToDiscuss: string
    questionsForTherapist: string
    recentConcerns: string
  }) {
    setSaving(true)
    setError(null)
    setSaved(false)

    const payload = {
      topicsToDiscuss: (next?.topicsToDiscuss ?? topicsToDiscuss).trim().slice(0, MAX_LEN),
      questionsForTherapist: (next?.questionsForTherapist ?? questionsForTherapist).trim().slice(0, MAX_LEN),
      recentConcerns: (next?.recentConcerns ?? recentConcerns).trim().slice(0, MAX_LEN),
    }

    try {
      const res = await fetch("/api/patient/session-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(t("patient.sessionPrep.errors.failedToSave"))
      const data = (await res.json()) as SessionPrepApi

      setLastUpdated(data.sessionPrep?.updated_at ?? new Date().toISOString())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError(t("patient.sessionPrep.errors.failedToSaveTryAgain"))
    } finally {
      setSaving(false)
    }
  }

  const debouncedAutosave = useDebouncedCallback(
    (next: { topicsToDiscuss: string; questionsForTherapist: string; recentConcerns: string }) => {
      void save(next)
    },
    1200
  )

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

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-card-foreground">{t("patient.sessionPrep.title")}</h2>
        {saving && (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.saving")}
          </span>
        )}
      </div>

      <p className="mb-5 text-sm text-muted-foreground">
        {t("patient.sessionPrep.subtitle")}
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading")}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
              {saved ? (
                <span className="font-medium text-primary">{t("common.saved")}</span>
              ) : lastUpdatedLabel ? (
                <span>{t("common.lastUpdated", { value: lastUpdatedLabel })}</span>
              ) : (
                <span />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClear}
                disabled={saving}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {t("common.clear")}
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
