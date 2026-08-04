"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useT, useI18n } from "@/components/i18n-provider"
import { StoryCard } from "./StoryCard"
import { getAvailableLanguages, type SleepStory } from "@/lib/sleep-stories/stories"

type StoryLanguage = SleepStory["language"]

const SHELF_CATEGORIES: Array<{ key: SleepStory["category"]; labelKey: string }> = [
  { key: "hekaya", labelKey: "sleepStories.category.hekaya" },
  { key: "classic", labelKey: "sleepStories.category.classic" },
]

const LANGUAGES: StoryLanguage[] = ["ar", "en", "fr"]

// Computed once from the static story list -- no DB, no fetch needed just to
// know which languages have content, so the filter can default correctly
// even before the API response for the actual cards comes back.
const AVAILABLE_LANGUAGES = getAvailableLanguages()

function defaultLanguage(uiLocale: StoryLanguage): StoryLanguage {
  if (AVAILABLE_LANGUAGES.includes(uiLocale)) return uiLocale
  return AVAILABLE_LANGUAGES[0] ?? uiLocale
}

export function StoryLibraryPage() {
  const t = useT()
  const { locale } = useI18n()
  const router = useRouter()

  const [stories, setStories] = useState<SleepStory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLanguages, setActiveLanguages] = useState<Set<StoryLanguage>>(
    () => new Set([defaultLanguage(locale)])
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/sleep-stories", { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load sleep stories: ${res.status}`)
        const data = (await res.json()) as { stories: SleepStory[] }
        if (cancelled) return
        console.log(
          "[sleep-stories] languages present in API response:",
          Array.from(new Set(data.stories.map((s) => s.language)))
        )
        setStories(data.stories)
      } catch (err) {
        console.error("[sleep-stories] failed to load stories:", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function toggleLanguage(lang: StoryLanguage) {
    console.log("[sleep-stories] language filter button clicked:", lang)
    setActiveLanguages((prev) => {
      const next = new Set(prev)
      if (next.has(lang)) {
        if (next.size > 1) next.delete(lang) // keep at least one language active
      } else {
        next.add(lang)
      }
      return next
    })
  }

  const filteredStories = useMemo(
    () => stories.filter((s) => activeLanguages.has(s.language)),
    [stories, activeLanguages]
  )

  const shelves = SHELF_CATEGORIES.map((shelf) => ({
    ...shelf,
    stories: filteredStories.filter((s) => s.category === shelf.key),
  })).filter((shelf) => shelf.stories.length > 0)

  const isEmpty = !loading && shelves.length === 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("sleepStories.library.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("sleepStories.library.subtitle")}</p>
        </div>
        <div className="flex gap-1.5" role="group" aria-label={t("sleepStories.library.languageFilter")}>
          {LANGUAGES.map((lang) => {
            const active = activeLanguages.has(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {t(`language.${lang}`)}
              </button>
            )
          })}
        </div>
      </div>

      {isEmpty && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {t("sleepStories.library.empty")}
        </div>
      )}

      {shelves.map((shelf) => (
        <section key={shelf.key} aria-label={t(shelf.labelKey)}>
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t(shelf.labelKey)}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {shelf.stories.map((story) => (
              <StoryCard key={story.slug} story={story} onSelect={() => router.push(`/sleep-stories/${story.slug}`)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
