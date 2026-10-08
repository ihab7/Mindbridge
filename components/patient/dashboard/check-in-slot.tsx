"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, PenLine } from "lucide-react"
import { JournalForm } from "@/components/patient/journal-form"
import { Mascot } from "@/components/mascot/Mascot"
import { useT } from "@/components/i18n-provider"

type TodayEntry = React.ComponentProps<typeof JournalForm>["todayEntry"]

const CHEER_MS = 1500

/**
 * The check-in slot in the two-up row. Nothing about the form itself changes:
 * when today's entry exists JournalForm already renders its own compact
 * "saved · edit" state, so it is mounted directly. When it does not, the full
 * form (the tallest block on the dashboard) stays behind a CTA until asked
 * for — the form is the same component either way, so saving, validation and
 * the upsert are untouched.
 *
 * After a save, JournalForm calls router.refresh(), which hands this slot a
 * new todayEntry. That change (not the values in it) is the trigger for the
 * mascot's one-time cheer — so it reacts to the act of saving, never to how
 * the patient said they feel, and never fires on a plain page load.
 */
export function CheckInSlot({ todayEntry }: { todayEntry: TodayEntry }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [celebration, setCelebration] = useState<"cheer" | "calm" | null>(null)

  const entryKey = todayEntry ? JSON.stringify(todayEntry) : null
  const lastKey = useRef(entryKey)

  useEffect(() => {
    if (entryKey === lastKey.current) return
    lastKey.current = entryKey
    if (!entryKey) return
    setCelebration("cheer")
    const timer = window.setTimeout(() => setCelebration("calm"), CHEER_MS)
    return () => window.clearTimeout(timer)
  }, [entryKey])

  const openForm = useCallback(() => setOpen(true), [])

  // The status-strip chip and the weekly card both link to #journal-form;
  // follow the anchor by opening the form, not just scrolling to the CTA.
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#journal-form") setOpen(true)
    }
    openFromHash()
    window.addEventListener("hashchange", openFromHash)
    return () => window.removeEventListener("hashchange", openFromHash)
  }, [])

  if (todayEntry || open) {
    return (
      <div id="journal-form" className="flex h-full scroll-mt-28 flex-col [&>*:last-child]:flex-1">
        {/* Always occupies the same child slot (false when hidden), so the
            form below is never remounted when this appears. */}
        {celebration && (
          <div role="status" className="mb-enter mb-3 flex items-center gap-3">
            <Mascot pose={celebration} size={56} className="shrink-0" />
            <p className="text-sm font-medium text-foreground">{t("patient.dashboard.checkIn.saved")}</p>
          </div>
        )}
        <JournalForm todayEntry={todayEntry} />
      </div>
    )
  }

  return (
    <div id="journal-form" className="h-full scroll-mt-28">
      {/* Stacked rather than one row: in the two-up grid this card is ~170px
          wide on a phone, where an icon + text + arrow row would wrap to one
          word per line. */}
      <button
        type="button"
        onClick={openForm}
        className="mb-card mb-press mb-lift flex h-full w-full flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-4 text-start outline-none ring-ring hover:bg-muted/40 focus-visible:ring-2"
      >
        <span className="flex w-full items-center justify-between gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PenLine className="h-4 w-4" aria-hidden="true" />
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
        </span>
        <span className="flex flex-col gap-1">
          <span className="block text-[15px] font-semibold leading-snug text-card-foreground">
            {t("patient.checkin.title")}
          </span>
          <span className="block text-[13px] leading-snug text-muted-foreground">
            {t("patient.dashboard.checkIn.ctaSubtitle")}
          </span>
        </span>
      </button>
    </div>
  )
}
