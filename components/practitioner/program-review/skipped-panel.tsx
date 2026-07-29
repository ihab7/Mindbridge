"use client"

import { X } from "lucide-react"
import { useT } from "@/components/i18n-provider"
import type { Locale } from "@/i18n/routing"
import { findLibrarySession } from "@/lib/program/sessionLibrary"

export function SkippedPanel({
  skipped,
  locale,
  onAddAnyway,
}: {
  skipped: { id: string; reason: string }[]
  locale: Locale
  onAddAnyway: (id: string) => void
}) {
  const t = useT()

  if (skipped.length === 0) return null

  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("practitioner.review.skippedTitle")}
      </p>
      <div className="flex flex-col gap-2">
        {skipped.map(({ id, reason }) => {
          const session = findLibrarySession(id)
          if (!session) return null
          return (
            <div key={id} className="flex items-center justify-between gap-3 text-sm">
              <p className="min-w-0 flex-1 text-muted-foreground">
                <X className="me-1.5 inline h-3.5 w-3.5 text-destructive/70" aria-hidden="true" />
                <span className="text-card-foreground">{session.title[locale]}</span> — {reason}
              </p>
              <button
                type="button"
                onClick={() => onAddAnyway(id)}
                className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                {t("practitioner.review.addAnyway")}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
