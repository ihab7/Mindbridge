"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Play, Pause } from "lucide-react"
import { useT } from "@/components/i18n-provider"
import { directionForLocale } from "@/i18n/routing"
import { StoryAudio } from "@/lib/sleep-stories/storyAudio"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { AudioMixerCompact } from "./AudioMixerCompact"
import { SleepTimerPicker } from "./SleepTimerPicker"
import { ComingSoonState } from "./ComingSoonState"
import type { SleepStory } from "@/lib/sleep-stories/stories"

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

export function StoryPlayer({ story }: { story: SleepStory }) {
  const t = useT()
  const router = useRouter()
  const reducedMotion = usePrefersReducedMotion()
  const dir = directionForLocale(story.language)
  const hasAudio = Boolean(story.audioSrc)

  const audioRef = useRef<StoryAudio | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(story.durationSec ?? 0)
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  const [narrationOn, setNarrationOn] = useState(true)
  const [narrationVolume, setNarrationVolume] = useState(0.8)
  const [ambientOn, setAmbientOn] = useState(story.ambientBed !== "none")
  const [ambientVolume, setAmbientVolume] = useState(0.4)
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null)

  useEffect(() => {
    if (!hasAudio) return undefined

    const engine = new StoryAudio()
    audioRef.current = engine
    engine.loadStory(story.audioSrc)
    engine.setAmbientBed(story.ambientBed)
    engine.setNarrationVolume(narrationVolume)
    engine.setAmbientVolume(ambientVolume)
    engine.onEnded(() => {
      setPlaying(false)
      void logPlay(true)
    })

    const interval = setInterval(() => {
      setCurrentTime(engine.getCurrentTime())
      const d = engine.getDuration()
      if (d > 0) setDuration(d)
    }, 250)

    return () => {
      clearInterval(interval)
      engine.destroy()
      audioRef.current = null
    }
    // Only re-run if the story itself changes -- volume/timer state is
    // applied imperatively through the ref, not by re-mounting the engine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.slug, hasAudio])

  async function logPlay(completed: boolean) {
    try {
      await fetch("/api/patient/sleep-stories/plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storySlug: story.slug, completed, timerMinutes }),
      })
    } catch {
      // best-effort logging only -- never block playback on this
    }
  }

  function handlePlayPause() {
    const engine = audioRef.current
    if (!engine) return
    if (playing) {
      engine.pause()
      setPlaying(false)
    } else {
      engine.play()
      setPlaying(true)
    }
  }

  function handleClose() {
    audioRef.current?.destroy()
    if (playing) void logPlay(false)
    router.push("/sleep-stories")
  }

  function handleSeek(sec: number) {
    audioRef.current?.seek(sec)
    setCurrentTime(sec)
  }

  function handleTimerChange(minutes: number | null) {
    setTimerMinutes(minutes)
    audioRef.current?.startSleepTimer(minutes)
  }

  const closeButton = (
    <button
      type="button"
      onClick={handleClose}
      aria-label={t("sleepStories.player.close")}
      className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-foreground/70 transition-colors hover:bg-black/20"
    >
      <X className="h-4 w-4" />
    </button>
  )

  if (!hasAudio) {
    return (
      <div className="relative mx-auto max-w-3xl px-6 py-10">
        {closeButton}
        <ComingSoonState story={story} />
      </div>
    )
  }

  return (
    <div dir={dir} className="relative mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-10 text-center">
      {closeButton}

      <div>
        <h1 className="text-2xl font-bold text-foreground">{story.title}</h1>
        {story.subtitle && <p className="mt-1 text-sm text-muted-foreground">{story.subtitle}</p>}
        {story.openerLine && <p className="mt-3 italic text-muted-foreground">{story.openerLine}</p>}
        {story.narratorName && <p className="mt-2 text-xs text-muted-foreground">{story.narratorName}</p>}
      </div>

      <div
        aria-hidden="true"
        className="flex h-40 w-40 items-center justify-center rounded-full"
        style={{
          background: story.coverGradient,
          animation: playing && !reducedMotion ? "sleep-story-orb-pulse 6s ease-in-out infinite" : "none",
        }}
      >
        <button
          type="button"
          onClick={handlePlayPause}
          aria-label={playing ? t("sleepStories.player.pause") : t("sleepStories.player.play")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 text-white transition-transform hover:scale-105"
        >
          {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 rtl:-scale-x-100" />}
        </button>
      </div>
      <style>{`
        @keyframes sleep-story-orb-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>

      <div className="w-full">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="w-full cursor-pointer accent-primary"
          aria-label={t("sleepStories.player.progress")}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <AudioMixerCompact
        narrationOn={narrationOn}
        narrationVolume={narrationVolume}
        onNarrationOnChange={(v) => {
          setNarrationOn(v)
          audioRef.current?.setNarrationOn(v)
        }}
        onNarrationVolumeChange={(v) => {
          setNarrationVolume(v)
          audioRef.current?.setNarrationVolume(v)
        }}
        ambientBed={story.ambientBed}
        ambientOn={ambientOn}
        ambientVolume={ambientVolume}
        onAmbientOnChange={(v) => {
          setAmbientOn(v)
          audioRef.current?.setAmbientOn(v)
        }}
        onAmbientVolumeChange={(v) => {
          setAmbientVolume(v)
          audioRef.current?.setAmbientVolume(v)
        }}
      />

      <SleepTimerPicker value={timerMinutes} onChange={handleTimerChange} />

      <div className="w-full">
        <button
          type="button"
          onClick={() => setTranscriptOpen((v) => !v)}
          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {transcriptOpen ? t("sleepStories.player.hideTranscript") : t("sleepStories.player.showTranscript")}
        </button>
        {transcriptOpen && (
          <p
            className={`mt-3 whitespace-pre-line text-sm leading-relaxed text-card-foreground ${
              dir === "rtl" ? "text-right" : "text-left"
            }`}
          >
            {story.scriptText}
          </p>
        )}
      </div>
    </div>
  )
}
