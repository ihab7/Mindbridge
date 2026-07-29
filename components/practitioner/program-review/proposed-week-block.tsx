"use client"

import { useT } from "@/components/i18n-provider"
import type { Locale } from "@/i18n/routing"
import { findLibrarySession } from "@/lib/program/sessionLibrary"
import type { EditableSessionWithIndex } from "./use-program-proposal"
import { ProposedSessionRow } from "./proposed-session-row"

const WEEK_COLORS: Record<number, string> = { 1: "#2a9d8f", 2: "#4a8ab5", 3: "#8b5cf6", 4: "#d97706" }

export function ProposedWeekBlock({
  weekNumber,
  sessions,
  locale,
  lastGlobalIndex,
  onRemove,
  onRestore,
  onMoveUp,
  onMoveDown,
}: {
  weekNumber: number
  sessions: EditableSessionWithIndex[]
  locale: Locale
  lastGlobalIndex: number
  onRemove: (id: string) => void
  onRestore: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}) {
  const t = useT()

  const activeCount = sessions.filter((s) => !s.removed).length
  const totalMinutes = sessions
    .filter((s) => !s.removed)
    .reduce((sum, s) => sum + (findLibrarySession(s.id)?.durationMin ?? 0), 0)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
          style={{ background: WEEK_COLORS[weekNumber] ?? "#2a9d8f" }}
        >
          {weekNumber}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-card-foreground">{t("program.week.label", { number: weekNumber })}</p>
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {t("practitioner.review.weekSummary", { count: activeCount, min: totalMinutes })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {sessions.map((s) => {
          const session = findLibrarySession(s.id)
          if (!session) return null
          return (
            <ProposedSessionRow
              key={s.id}
              session={session}
              locale={locale}
              index={sessions.indexOf(s) + 1}
              rationale={s.rationale}
              removed={s.removed}
              justAdded={s.justAdded}
              disabledUp={s.globalIndex === 0}
              disabledDown={s.globalIndex === lastGlobalIndex}
              onRemove={() => onRemove(s.id)}
              onRestore={() => onRestore(s.id)}
              onMoveUp={() => onMoveUp(s.id)}
              onMoveDown={() => onMoveDown(s.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
