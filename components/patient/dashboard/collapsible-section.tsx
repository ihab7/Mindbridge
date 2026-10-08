"use client"

import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"

/**
 * Collapsed-by-default wrapper, styled like the existing "Entrées récentes"
 * summary. Used for the dashboard blocks that are not part of the top
 * priority order but must stay reachable: the wellness tasks and the weekly
 * wellbeing summary. Children render only once opened, so a collapsed
 * section costs one row of scroll.
 */
export function CollapsibleSection({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string
  summary?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <section className="mb-card rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="mb-press flex w-full items-center gap-3 rounded-xl p-4 text-start outline-none ring-ring focus-visible:ring-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-card-foreground">{title}</span>
          {summary && <span className="mt-0.5 block text-[13px] text-muted-foreground">{summary}</span>}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={id} className="px-4 pb-4">
          {children}
        </div>
      )}
    </section>
  )
}
