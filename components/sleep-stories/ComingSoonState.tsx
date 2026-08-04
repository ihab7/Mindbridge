"use client"

import { directionForLocale } from "@/i18n/routing"
import { useT } from "@/components/i18n-provider"
import type { SleepStory } from "@/lib/sleep-stories/stories"

/**
 * Rendered instead of a broken player whenever a story has no recorded
 * audio yet (audio_url is null) -- never a silent failure. Full transcript
 * stays readable so the content isn't hidden just because narration isn't
 * ready.
 */
export function ComingSoonState({ story }: { story: SleepStory }) {
  const t = useT()
  const dir = directionForLocale(story.language)

  return (
    <div dir={dir} className="mx-auto flex max-w-xl flex-col gap-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">{story.title}</h1>
      {story.openerLine && <p className="italic text-muted-foreground">{story.openerLine}</p>}

      <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3">
        <p className="text-sm font-medium text-foreground">{t("sleepStories.comingSoon.playerNotice")}</p>
      </div>

      <div className={dir === "rtl" ? "text-right" : "text-left"}>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("sleepStories.player.transcript")}
        </h2>
        <p className="whitespace-pre-line text-base leading-relaxed text-card-foreground">{story.scriptText}</p>
      </div>
    </div>
  )
}
