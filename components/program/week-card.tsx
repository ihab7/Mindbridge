"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useT } from "@/components/i18n-provider"
import type { Locale } from "@/i18n/routing"
import type { ProgramWeek } from "@/lib/program/types"
import { SessionRow, type SessionRowStatus } from "./session-row"

export function WeekCard({
  week,
  locale,
  completed,
  nextSessionId,
  defaultOpen,
  onSelectSession,
}: {
  week: ProgramWeek
  locale: Locale
  completed: Set<string>
  nextSessionId: string | null
  defaultOpen: boolean
  onSelectSession: (sessionId: string) => void
}) {
  const t = useT()

  const doneCount = week.sessions.filter((s) => completed.has(s.id)).length
  const totalMinutes = week.sessions.reduce((sum, s) => sum + s.durationMin, 0)

  function statusFor(sessionId: string): SessionRowStatus {
    if (completed.has(sessionId)) return "done"
    if (sessionId === nextSessionId) return "next"
    const order = week.sessions.map((s) => s.id)
    const idx = order.indexOf(sessionId)
    if (idx === 0) return "available"
    return completed.has(order[idx - 1]) ? "available" : "locked"
  }

  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? `week-${week.weekNumber}` : undefined}>
      <AccordionItem value={`week-${week.weekNumber}`} className="rounded-xl border border-border bg-card px-4 last:border-b">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex flex-1 items-center gap-3 text-left">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: week.color }}
            >
              {week.weekNumber}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-card-foreground">{week.theme[locale]}</p>
              <p className="text-xs text-muted-foreground">
                {t("program.week.sessionsCount", { done: doneCount, total: week.sessions.length, min: totalMinutes })}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-1">
            {week.sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                locale={locale}
                status={statusFor(session.id)}
                onSelect={() => onSelectSession(session.id)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
