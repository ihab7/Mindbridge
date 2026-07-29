"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useT } from "@/components/i18n-provider"
import type { Locale } from "@/i18n/routing"
import type { LibrarySession, SessionCategory } from "@/lib/program/types"

const CATEGORY_CHIP_THRESHOLD = 20
const CATEGORIES: SessionCategory[] = ["education", "breathing", "grounding", "cbt", "reflection", "planning", "somatic"]

export function LibraryPicker({
  sessions,
  locale,
  onAdd,
}: {
  sessions: LibrarySession[]
  locale: Locale
  onAdd: (id: string) => void
}) {
  const t = useT()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<SessionCategory | null>(null)

  const showFilters = sessions.length > CATEGORY_CHIP_THRESHOLD

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (category && s.category !== category) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        if (!s.title[locale].toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [sessions, category, query, locale])

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("practitioner.review.libraryTitle")}
      </p>

      {showFilters && (
        <div className="mb-3 flex flex-col gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("practitioner.review.libraryFilterPlaceholder")}
            className="h-8 text-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                category === null ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {t("practitioner.review.categoryAll")}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory((prev) => (prev === c ? null : c))}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {t(`practitioner.review.category.${c}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">{t("practitioner.review.libraryEmpty")}</p>
      ) : (
        <div className="grid max-h-72 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
          {filtered.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onAdd(session.id)}
              className="flex flex-col items-start rounded-lg px-3 py-2 text-start transition-colors hover:bg-muted"
            >
              <span className="truncate text-sm font-medium text-card-foreground">
                <Plus className="me-1 inline h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {session.title[locale]}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {t(`practitioner.review.category.${session.category}`)} · {t("mindfulness.duration", { minutes: session.durationMin })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
