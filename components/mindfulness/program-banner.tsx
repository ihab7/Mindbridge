"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardList, ArrowRight } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { ANXIETY_PROGRAM } from "@/lib/program/content"
import { currentWeekNumber, nextSession } from "@/lib/program/progress"
import type { SessionProgressEntry } from "@/lib/program/types"

type ApiResponse = {
  hasAssignment: boolean
  practitionerName: string
  progress: SessionProgressEntry[]
}

export function ProgramBanner() {
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

  const week = currentWeekNumber(ANXIETY_PROGRAM, data.progress)
  const next = nextSession(ANXIETY_PROGRAM, data.progress)
  if (!next) return null

  return (
    <Link
      href={`/patient/program?open=${next.session.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm transition-colors hover:bg-primary/10"
    >
      <span className="flex min-w-0 items-center gap-2 text-foreground">
        <ClipboardList className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate">
          {t("program.banner.text", { week, title: next.session.title[locale] })}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 font-medium text-primary">
        {t("program.banner.cta")}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}
