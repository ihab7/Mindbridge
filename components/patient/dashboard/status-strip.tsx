"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Calendar, Check, MessageCircle, PenLine } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

export type NextSession = {
  /** ISO timestamp. */
  at: string
  /** "video" carries a real time; "appointment" is a date the practitioner typed (no time). */
  kind: "video" | "appointment"
  href: string
}

const CHIP =
  "mb-press mb-lift inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-medium text-card-foreground outline-none ring-ring hover:bg-muted focus-visible:ring-2"

/**
 * One scrollable row of real links under the header: next session, messages,
 * today's check-in. Nothing here is a placeholder — a chip is rendered only
 * when its data exists, and the unread count comes from messages.read.
 *
 * Sticky under the app header on mobile. The header's height is measured
 * rather than hardcoded: it has two rows on mobile, one on desktop, and the
 * nav row grows when a locale's labels wrap.
 */
export function StatusStrip({
  nextSession,
  unreadCount,
  checkedInToday,
}: {
  nextSession: NextSession | null
  unreadCount: number
  checkedInToday: boolean
}) {
  const t = useT()
  const { locale } = useI18n()
  const [headerH, setHeaderH] = useState(0)

  // The check draws itself in once, when the check-in flips to done while the
  // page is open (a save) — not when the page loads already done.
  const wasCheckedIn = useRef(checkedInToday)
  const [justDone, setJustDone] = useState(false)
  useEffect(() => {
    if (checkedInToday && !wasCheckedIn.current) setJustDone(true)
    wasCheckedIn.current = checkedInToday
  }, [checkedInToday])

  useEffect(() => {
    const header = document.querySelector("header")
    if (!header) return
    const update = () => setHeaderH(header.getBoundingClientRect().height)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  const sessionLabel = (() => {
    if (!nextSession) return null
    const d = new Date(nextSession.at)
    const day = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d)
    // The appointment date comes from a date input (no time of day), so only
    // the video source can honestly show an hour.
    if (nextSession.kind === "appointment") return t("patient.dashboard.strip.session", { value: day })
    const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(d)
    return t("patient.dashboard.strip.session", { value: `${day} · ${time}` })
  })()

  return (
    // No vertical padding: the chips are exactly 44px, which is both the
    // minimum touch target and the strip's maximum height.
    <div
      className="sticky z-30 -mx-4 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:static md:mx-0 md:px-0 md:backdrop-blur-none"
      style={{ top: headerH }}
    >
      <nav
        aria-label={t("patient.dashboard.strip.aria")}
        className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {nextSession && (
          <Link href={nextSession.href} className={CHIP}>
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {sessionLabel}
          </Link>
        )}

        <Link href="/patient/messages" className={CHIP}>
          <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {t("nav.messages")}
          {unreadCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link
          href="#journal-form"
          className={cn(CHIP, checkedInToday && "border-primary/30 bg-primary/5")}
          aria-live="polite"
        >
          {checkedInToday ? (
            <Check className={cn("h-4 w-4 shrink-0 text-primary", justDone && "mb-draw")} aria-hidden="true" />
          ) : (
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          )}
          {checkedInToday ? t("patient.dashboard.strip.checkInDone") : t("patient.dashboard.strip.checkInTodo")}
          <PenLine className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      </nav>
    </div>
  )
}
