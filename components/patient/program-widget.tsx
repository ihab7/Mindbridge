"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { ANXIETY_PROGRAM } from "@/lib/program/content"
import { currentWeekNumber, nextSession, percentComplete } from "@/lib/program/progress"
import type { SessionProgressEntry } from "@/lib/program/types"

type ApiResponse = {
  hasAssignment: boolean
  practitionerName: string
  progress: SessionProgressEntry[]
}

export function ProgramWidget() {
  const { locale } = useI18n()
  const t = useT()
  const [data, setData] = useState<ApiResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/patient/program")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ApiResponse | null) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!data || !data.hasAssignment) return null

  const { progress } = data
  const pct = percentComplete(ANXIETY_PROGRAM, progress)
  const week = currentWeekNumber(ANXIETY_PROGRAM, progress)
  const next = nextSession(ANXIETY_PROGRAM, progress)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("program.widget.label")}</p>
      <h3 className="mt-1 text-base font-semibold text-card-foreground">{ANXIETY_PROGRAM.title[locale]}</h3>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#2a9d8f,#4ecdc4)", transition: "width 1s ease" }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {t("program.progress.percentWeek", { pct, week })} · {t("program.week.doneOfTotal", { done: progress.length, total: ANXIETY_PROGRAM.totalSessions })}
      </p>

      {next && (
        <p className="mt-3 text-sm text-card-foreground">
          {t("program.done.nextUp", { title: next.session.title[locale] })}
        </p>
      )}

      <Link
        href={next ? `/patient/program?open=${next.session.id}` : "/patient/program"}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t("program.widget.continue")}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
