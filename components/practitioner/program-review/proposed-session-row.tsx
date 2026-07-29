"use client"

import { ArrowDown, ArrowUp, RotateCcw, Sparkles, X } from "lucide-react"
import { useT } from "@/components/i18n-provider"
import type { Locale } from "@/i18n/routing"
import type { LibrarySession } from "@/lib/program/types"

export function ProposedSessionRow({
  session,
  locale,
  index,
  rationale,
  removed,
  justAdded,
  disabledUp,
  disabledDown,
  onRemove,
  onRestore,
  onMoveUp,
  onMoveDown,
}: {
  session: LibrarySession
  locale: Locale
  index: number
  rationale: string | null
  removed: boolean
  justAdded: boolean
  disabledUp: boolean
  disabledDown: boolean
  onRemove: () => void
  onRestore: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const t = useT()

  return (
    <div
      role="group"
      aria-disabled={removed}
      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-muted/60 ${
        removed ? "opacity-40" : ""
      }`}
      style={justAdded ? { background: "hsl(var(--primary) / 0.12)", transition: "background 1.2s ease" } : undefined}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {index}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium text-card-foreground ${removed ? "line-through" : ""}`}>
          {session.title[locale]}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {t(`practitioner.review.category.${session.category}`)} · {t("mindfulness.duration", { minutes: session.durationMin })}
        </p>
        {rationale && (
          <p className="mt-1 flex items-start gap-1 text-xs text-[color:#8b5cf6]">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{rationale}</span>
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label={t("practitioner.review.moveUp")}
          disabled={disabledUp}
          onClick={onMoveUp}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label={t("practitioner.review.moveDown")}
          disabled={disabledDown}
          onClick={onMoveDown}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        {removed ? (
          <button
            type="button"
            aria-label={t("practitioner.review.restore")}
            onClick={onRestore}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={t("practitioner.review.remove")}
            onClick={onRemove}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
