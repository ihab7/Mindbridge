"use client"

import { Check, Lock, Play } from "lucide-react"
import type { ProgramSession } from "@/lib/program/types"
import type { Locale } from "@/i18n/routing"
import { useT } from "@/components/i18n-provider"

export type SessionRowStatus = "done" | "next" | "locked" | "available"

export function SessionRow({
  session,
  locale,
  status,
  onSelect,
}: {
  session: ProgramSession
  locale: Locale
  status: SessionRowStatus
  onSelect: () => void
}) {
  const t = useT()
  const locked = status === "locked"

  return (
    <div
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-disabled={locked}
      aria-label={locked ? `${session.title[locale]} — ${t("program.session.locked")}` : session.title[locale]}
      onClick={() => !locked && onSelect()}
      onKeyDown={(e) => {
        if (locked) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
        locked ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-muted hover:ps-4"
      }`}
    >
      <span
        className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
        style={{
          background: status === "done" ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
          color: status === "done" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
        }}
      >
        {status === "done" && <Check className="h-4 w-4" aria-hidden="true" />}
        {status === "locked" && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
        {(status === "next" || status === "available") && <Play className="h-3.5 w-3.5" aria-hidden="true" />}
        {status === "next" && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ animation: "programNextPulse 2s infinite" }}
          />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-card-foreground">{session.title[locale]}</p>
        <p className="truncate text-xs text-muted-foreground">
          {session.typeLabel[locale]} · {t("mindfulness.duration", { minutes: session.durationMin })}
        </p>
      </div>

      {status === "next" && (
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {t("program.session.start")}
        </span>
      )}

      <style>{`
        @keyframes programNextPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(42,157,143,.35); }
          50%      { box-shadow: 0 0 0 7px rgba(42,157,143,0); }
        }
      `}</style>
    </div>
  )
}
