"use client"

import { directionForLocale } from "@/i18n/routing"
import type { SleepStory } from "@/lib/sleep-stories/stories"

function formatDuration(sec: number | undefined): string {
  if (!sec) return "—"
  const min = Math.round(sec / 60)
  return `${min} min`
}

export function StoryCard({ story, onSelect }: { story: SleepStory; onSelect: () => void }) {
  const dir = directionForLocale(story.language)

  return (
    <button
      type="button"
      onClick={onSelect}
      dir={dir}
      className="group relative flex h-44 w-40 shrink-0 flex-col justify-between overflow-hidden rounded-2xl p-4 text-left shadow-sm transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ background: story.coverGradient }}
    >
      <div>
        <p className={`text-base font-semibold leading-snug text-white ${dir === "rtl" ? "text-right" : "text-left"}`}>
          {story.title}
        </p>
        {story.narratorName && <p className="mt-1 text-xs text-white/75">{story.narratorName}</p>}
      </div>

      <span className="w-fit rounded-full bg-black/20 px-2 py-0.5 text-xs font-medium text-white/90">
        {formatDuration(story.durationSec)}
      </span>
    </button>
  )
}
