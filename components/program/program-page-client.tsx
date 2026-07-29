"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ClipboardList, Loader2 } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { allSessionIds, findSession } from "@/lib/program/content"
import { composeProgramFromPlan } from "@/lib/program/composeProgram"
import { defaultProgramPlan } from "@/lib/program/sessionLibrary"
import { isSessionUnlocked, nextSession as computeNextSession } from "@/lib/program/progress"
import type { PlanEntry, Program, SessionProgressEntry } from "@/lib/program/types"
import { ProgramHero } from "./program-hero"
import { WeekCard } from "./week-card"
import { SessionPlayer } from "./session-player"
import type { SessionCompletionPayload } from "./use-session-player"

function findSessionAfter(program: Program, sessionId: string) {
  const order = allSessionIds(program)
  const idx = order.indexOf(sessionId)
  if (idx === -1 || idx === order.length - 1) return null
  return findSession(program, order[idx + 1])
}

type ApiResponse = {
  hasAssignment: boolean
  practitionerName: string
  progress: SessionProgressEntry[]
  plan: PlanEntry[]
}

export function ProgramPageClient() {
  const { locale } = useI18n()
  const t = useT()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const appliedOpenParam = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/patient/program")
      if (!res.ok) throw new Error("failed")
      const json = (await res.json()) as ApiResponse
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // "Continue" links from the dashboard widget / mindfulness banner pass ?open=<sessionId>
  // to jump straight into that session once the assignment has loaded.
  useEffect(() => {
    if (appliedOpenParam.current || !data?.hasAssignment) return
    const openId = searchParams.get("open")
    if (!openId) return
    appliedOpenParam.current = true
    const program = composeProgramFromPlan(data.plan.length > 0 ? data.plan : defaultProgramPlan())
    if (isSessionUnlocked(program, data.progress, openId)) {
      setActiveSessionId(openId)
    }
  }, [data, searchParams])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("common.loading")}
      </div>
    )
  }

  if (!data || !data.hasAssignment) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-16 text-center">
        <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t("program.empty")}</p>
      </div>
    )
  }

  const { progress, practitionerName } = data
  const program = composeProgramFromPlan(data.plan.length > 0 ? data.plan : defaultProgramPlan())
  const done = new Set(progress.map((p) => p.sessionId))
  const next = computeNextSession(program, progress)

  async function handleComplete(payload: SessionCompletionPayload): Promise<boolean> {
    if (!activeSessionId) return false
    const sessionId = activeSessionId
    const previous = progress

    const optimisticEntry: SessionProgressEntry = {
      sessionId,
      moodBefore: payload.moodBefore,
      moodAfter: payload.moodAfter,
      reflectionAnswer: payload.reflectionAnswer,
      selectedTriggers: payload.selectedTriggers,
      completedAt: new Date().toISOString(),
    }
    setData((d) => (d ? { ...d, progress: [...d.progress.filter((p) => p.sessionId !== sessionId), optimisticEntry] } : d))

    try {
      const res = await fetch("/api/patient/program/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...payload }),
      })
      if (!res.ok) throw new Error("failed")
      const json = (await res.json()) as { progress: SessionProgressEntry[] }
      setData((d) => (d ? { ...d, progress: json.progress } : d))
      return true
    } catch {
      setData((d) => (d ? { ...d, progress: previous } : d))
      return false
    }
  }

  const activeSession = activeSessionId ? findSession(program, activeSessionId) : null
  const upcoming = activeSessionId ? findSessionAfter(program, activeSessionId) : null

  return (
    <div className="flex flex-col gap-6">
      <ProgramHero program={program} progress={progress} practitionerName={practitionerName} locale={locale} />

      <div className="flex flex-col gap-3">
        {program.weeks.map((week) => (
          <WeekCard
            key={week.weekNumber}
            week={week}
            locale={locale}
            completed={done}
            nextSessionId={next?.session.id ?? null}
            defaultOpen={week.weekNumber === (next?.week.weekNumber ?? 1)}
            onSelectSession={(sessionId) => {
              if (!isSessionUnlocked(program, progress, sessionId)) return
              setActiveSessionId(sessionId)
            }}
          />
        ))}
      </div>

      {activeSession && (
        <SessionPlayer
          session={activeSession.session}
          practitionerName={practitionerName}
          nextSessionTitle={upcoming ? upcoming.session.title[locale] : null}
          onClose={() => setActiveSessionId(null)}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
