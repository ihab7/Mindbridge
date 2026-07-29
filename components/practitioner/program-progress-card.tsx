"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardList, Loader2, MessageCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n, useT } from "@/components/i18n-provider"
import { formatShortDate } from "@/lib/time"
import { composeProgramFromPlan } from "@/lib/program/composeProgram"
import { defaultProgramPlan } from "@/lib/program/sessionLibrary"
import {
  aggregateTriggers,
  completedCount,
  dayStreak,
  moodTrend,
  recentReflections,
} from "@/lib/program/progress"
import type { PlanEntry, ProposalSource, SessionProgressEntry } from "@/lib/program/types"
import { AssignProgramModal } from "./assign-program-modal"

type ProgramApiResponse = {
  assignment: {
    programId: string
    practitionerNote: string
    status: "active" | "completed"
    assignedAt: string
    source: ProposalSource
    plan: PlanEntry[]
  } | null
  progress?: SessionProgressEntry[]
}

export function ProgramProgressCard({ patientId, patientName }: { patientId: number; patientName: string }) {
  const { locale } = useI18n()
  const t = useT()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ProgramApiResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/program`)
      if (!res.ok) throw new Error("failed")
      const json = (await res.json()) as ProgramApiResponse
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("common.loading")}
      </div>
    )
  }

  if (!data?.assignment) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("program.practitioner.noAssignment", { name: patientName })}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Link
              href={`/practitioner/patients/${patientId}/program-review`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t("program.practitioner.draftWithAi")}
            </Link>
            <Button type="button" variant="outline" onClick={() => setModalOpen(true)}>
              {t("program.practitioner.assignDefault")}
            </Button>
          </div>
        </div>
        <AssignProgramModal open={modalOpen} onOpenChange={setModalOpen} patientId={patientId} onAssigned={load} />
      </div>
    )
  }

  const progress = data.progress ?? []
  const program = composeProgramFromPlan(data.assignment.plan.length > 0 ? data.assignment.plan : defaultProgramPlan())
  const done = new Set(progress.map((p) => p.sessionId))
  const streak = dayStreak(progress)
  const trend = moodTrend(progress)
  const reflections = recentReflections(progress, 3)
  const triggers = aggregateTriggers(progress).slice(0, 8)

  const trendLabel =
    trend === "up" ? t("program.stats.trendUp") : trend === "down" ? t("program.stats.trendDown") : t("program.stats.trendFlat")

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">{program.title[locale]}</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("program.practitioner.assignedOn", { date: formatShortDate(locale, data.assignment.assignedAt) })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/practitioner/patients/${patientId}/program-review`}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("program.practitioner.revisePlan")}
          </Link>
          <Link
            href={`/practitioner/messages?patient=${patientId}`}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {t("program.practitioner.messageAboutThis")}
          </Link>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {t("program.practitioner.summaryLine", {
          done: completedCount(progress),
          total: program.totalSessions,
          streak,
          trend: trendLabel,
        })}
      </p>

      <div className="mb-5 grid grid-cols-4 gap-2">
        {program.weeks.map((week) => {
          const weekDone = week.sessions.filter((s) => done.has(s.id)).length
          const pct = Math.round((weekDone / week.sessions.length) * 100)
          return (
            <div key={week.weekNumber}>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: week.color }} />
              </div>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {t("program.week.label", { number: week.weekNumber })}
              </p>
            </div>
          )
        })}
      </div>

      {triggers.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("program.practitioner.triggersTitle")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {triggers.map((tr) => (
              <Badge key={tr.label} variant="secondary" className="font-normal">
                {tr.label} ×{tr.count}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {reflections.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("program.practitioner.reflectionsTitle")}
          </p>
          <div className="flex flex-col gap-2">
            {reflections.map((r) => (
              <div key={r.sessionId} className="rounded-md border-l-4 border-primary bg-muted/60 px-3 py-2 text-sm text-foreground">
                <p>{r.reflectionAnswer}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatShortDate(locale, r.completedAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
