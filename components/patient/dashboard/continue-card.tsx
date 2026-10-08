"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Leaf, Moon, Route } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { composeProgramFromPlan } from "@/lib/program/composeProgram"
import { defaultProgramPlan } from "@/lib/program/sessionLibrary"
import { nextSession } from "@/lib/program/progress"
import type { PlanEntry, SessionProgressEntry } from "@/lib/program/types"
import { Mascot } from "@/components/mascot/Mascot"

type ProgramResponse = {
  hasAssignment: boolean
  practitionerName: string
  progress: SessionProgressEntry[]
  plan: PlanEntry[]
}

type Nudge = { show: boolean; reason: "drop" | "low"; thisWeekAvg: number; storySlug: string | null }

/**
 * One card, one row per destination — replaces the three full-width promo
 * cards (mindfulness, sleep stories, programme) that each cost ~200-900px of
 * scroll. The programme row carries the real "x/y" from the composed plan,
 * and the sleep-story nudge, when the API returns one, becomes this row's
 * subtitle instead of a separate banner.
 */
export function ContinueCard() {
  const t = useT()
  const { locale } = useI18n()
  const [program, setProgram] = useState<ProgramResponse | null>(null)
  const [nudge, setNudge] = useState<Nudge | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/patient/program")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ProgramResponse | null) => !cancelled && setProgram(json))
      .catch(() => !cancelled && setProgram(null))
    fetch("/api/patient/sleep-stories/nudge")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: Nudge | null) => !cancelled && setNudge(json))
      .catch(() => !cancelled && setNudge(null))
    return () => {
      cancelled = true
    }
  }, [])

  const hasProgram = Boolean(program?.hasAssignment)
  const composed = hasProgram
    ? composeProgramFromPlan(program!.plan.length > 0 ? program!.plan : defaultProgramPlan())
    : null
  const next = composed ? nextSession(composed, program!.progress) : null

  const sleepSubtitle =
    nudge?.show
      ? nudge.reason === "drop"
        ? t("sleepStories.nudge.drop", { avg: nudge.thisWeekAvg })
        : t("sleepStories.nudge.low", { avg: nudge.thisWeekAvg })
      : t("patient.dashboard.continue.sleepSubtitle")

  const rows = [
    {
      key: "mindfulness",
      href: "/mindfulness",
      icon: Leaf,
      label: t("nav.mindfulness"),
      subtitle: t("patient.dashboard.continue.mindfulnessSubtitle"),
    },
    {
      key: "sleep",
      href: nudge?.show && nudge.storySlug ? `/sleep-stories/${nudge.storySlug}` : "/sleep-stories",
      icon: Moon,
      mascot: true,
      label: t("nav.sleepStories"),
      subtitle: sleepSubtitle,
    },
    ...(hasProgram && composed
      ? [
          {
            key: "program",
            href: next ? `/patient/program?open=${next.session.id}` : "/patient/program",
            icon: Route,
            label: t("nav.myProgram"),
            subtitle: `${t("program.week.doneOfTotal", {
              done: program!.progress.length,
              total: composed.totalSessions,
            })}${next ? ` · ${next.session.title[locale as keyof typeof next.session.title] ?? next.session.title.fr}` : ""}`,
          },
        ]
      : []),
  ]

  return (
    <section aria-labelledby="continue-title" className="mb-card rounded-2xl border border-border bg-card p-2">
      <h2 id="continue-title" className="px-3 pb-1 pt-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        {t("patient.dashboard.continue.title")}
      </h2>
      <ul>
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <li key={row.key}>
              <Link
                href={row.href}
                className="mb-press flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 outline-none ring-ring hover:bg-muted/60 focus-visible:ring-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {"mascot" in row && row.mascot ? <Mascot size={24} /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-card-foreground">{row.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{row.subtitle}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
