"use client"

import { useEffect, useState } from "react"
import { X, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useI18n, useT } from "@/components/i18n-provider"
import { useToast } from "@/hooks/use-toast"
import { sessionAudio } from "@/lib/program/audio"
import { PLAYER_SOUND_THEMES } from "@/lib/program/theme"
import type { ProgramSession, ProgramSoundId } from "@/lib/program/types"
import { useSessionPlayer, type SessionCompletionPayload } from "./use-session-player"
import { BreathingCircle } from "./breathing-circle"
import { AudioMixer } from "./audio-mixer"
import { MoodPicker } from "./mood-picker"
import { TriggerChips } from "./trigger-chips"
import { Confetti } from "./confetti"

const NAV_STEPS = new Set(["intro", "learn", "breathe", "affirm", "reflect"])
const BACK_STEPS = new Set(["learn", "breathe", "affirm", "reflect"])

export function SessionPlayer({
  session,
  practitionerName,
  nextSessionTitle,
  onClose,
  onComplete,
}: {
  session: ProgramSession
  practitionerName: string
  nextSessionTitle: string | null
  onClose: () => void
  onComplete: (payload: SessionCompletionPayload) => Promise<boolean>
}) {
  const { locale } = useI18n()
  const t = useT()
  const { toast } = useToast()
  const isRtl = locale === "ar"

  const [audioReady, setAudioReady] = useState(false)
  const [activeSound, setActiveSound] = useState<ProgramSoundId>(session.breathing.defaultSound)
  const [muted, setMuted] = useState(false)
  const [saving, setSaving] = useState(false)

  const player = useSessionPlayer(session, (payload: SessionCompletionPayload) => {
    setSaving(true)
    void onComplete(payload).then((ok) => {
      setSaving(false)
      if (!ok) {
        toast({
          title: t("program.error.saveFailedTitle"),
          description: t("program.error.saveFailedDescription"),
          variant: "destructive",
        })
      }
    })
  })

  useEffect(() => {
    return () => {
      sessionAudio.destroy()
    }
  }, [])

  function ensureAudio() {
    if (audioReady) return
    sessionAudio.init()
    sessionAudio.switchSound(activeSound)
    sessionAudio.setNatureOn(true)
    sessionAudio.startNature()
    setAudioReady(true)
  }

  function toggleMute() {
    const next = !muted
    setMuted(next)
    sessionAudio.setMasterMuted(next)
  }

  function handleClose() {
    sessionAudio.destroy()
    onClose()
  }

  const theme = PLAYER_SOUND_THEMES[activeSound]
  const showNav = NAV_STEPS.has(player.step)
  const showBack = BACK_STEPS.has(player.step)

  const paragraphs = session.learn.paragraphs[locale]
  const triggerOptions = session.triggerChips?.options[locale] ?? []

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-sm"
      style={{ background: theme.gradient, transition: "background 2.5s ease" }}
    >
      <style>{`
        @keyframes programStepIn {
          from { opacity: 0; transform: translateY(14px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes programCountPop {
          0%   { transform: scale(0.6); opacity: 0; }
          40%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="flex h-full w-full max-w-2xl flex-col px-6 py-5">
        <div
          className="flex items-center justify-center gap-1.5"
          aria-label={`${player.stepIndex + 1} / ${player.totalSteps}`}
        >
          {Array.from({ length: player.totalSteps }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: i === player.stepIndex ? 22 : 6,
                background:
                  i === player.stepIndex ? "white" : i < player.stepIndex ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)",
                transition: "all .35s cubic-bezier(0.34,1.4,0.64,1)",
              }}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium" style={{ color: theme.text, transition: "color 2.5s ease" }}>
            {session.title[locale]}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={t("mindfulness.session.sound")}
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label={t("mindfulness.session.exit")}
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          key={player.step}
          className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto py-4"
          style={{ animation: "programStepIn .45s cubic-bezier(0.34,1.2,0.64,1)" }}
        >
          {player.step === "intro" && (
            <div className="w-full max-w-sm space-y-5 text-center">
              <p className="text-lg font-medium" style={{ color: theme.text }}>
                {t("program.player.moodBefore")}
              </p>
              <MoodPicker value={player.moodBefore} onChange={player.setMoodBefore} label={t("program.player.moodBefore")} />
            </div>
          )}

          {player.step === "learn" && (
            <div className="w-full max-w-md space-y-4">
              <span
                className="block text-center text-xs font-semibold uppercase tracking-wide"
                style={{ color: theme.text, opacity: 0.7 }}
              >
                {session.typeLabel[locale]}
              </span>

              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-[15px] leading-relaxed"
                  style={{ color: theme.text, animation: `programStepIn .5s ${i * 0.18}s both cubic-bezier(0.34,1.2,0.64,1)` }}
                >
                  {p}
                </p>
              ))}

              {session.triggerChips && (
                <div className="space-y-2 pt-1">
                  <p className="text-center text-sm font-medium" style={{ color: theme.text }}>
                    {session.triggerChips.prompt[locale]}
                  </p>
                  <TriggerChips
                    options={triggerOptions}
                    selected={player.selectedTriggers}
                    onToggle={player.toggleTrigger}
                    textColor={theme.text}
                  />
                </div>
              )}

              <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: `${theme.text}33` }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.text, opacity: 0.7 }}>
                  {t("program.player.whyThisWorks")}
                </p>
                <p className="mt-1 text-sm" style={{ color: theme.text }}>
                  {session.whyThisWorks[locale]}
                </p>
              </div>
            </div>
          )}

          {player.step === "countdown" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm" style={{ color: theme.text }}>
                {t("program.player.countdownHint")}
              </p>
              <span
                key={player.countdown}
                className="text-6xl font-bold"
                style={{ color: theme.text, animation: "programCountPop .9s cubic-bezier(0.34,1.5,0.64,1)" }}
              >
                {player.countdown}
              </span>
            </div>
          )}

          {player.step === "breathe" && (
            <div className="flex w-full max-w-sm flex-col items-center gap-8">
              <BreathingCircle
                phase={player.breathing.phase}
                secondsLeft={player.breathing.secondsLeftInPhase}
                elapsedSec={player.breathing.totalDuration - player.breathing.remaining}
                totalSec={player.breathing.totalDuration}
                theme={theme}
              />
              <AudioMixer defaultSound={activeSound} onSoundChange={setActiveSound} />
            </div>
          )}

          {player.step === "affirm" && (
            <p className="max-w-sm text-center font-serif text-2xl italic" style={{ color: theme.text }}>
              &ldquo;{session.affirmation[locale]}&rdquo;
            </p>
          )}

          {player.step === "reflect" && (
            <div className="w-full max-w-md space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium" style={{ color: theme.text }}>
                  {session.reflection.question[locale]}
                </p>
                <Textarea
                  value={player.reflectionAnswer}
                  onChange={(e) => player.setReflectionAnswer(e.target.value)}
                  placeholder={t("program.player.reflectPlaceholder", { name: practitionerName || "" })}
                  className="min-h-[110px] border-white/40 bg-white/20 placeholder:text-white/60"
                  style={{ color: theme.text }}
                />
              </div>
              <div>
                <p className="mb-2 text-center text-sm font-medium" style={{ color: theme.text }}>
                  {t("program.player.moodAfter")}
                </p>
                <MoodPicker value={player.moodAfter} onChange={player.setMoodAfter} label={t("program.player.moodAfter")} />
              </div>
            </div>
          )}

          {player.step === "done" && (
            <div className="relative w-full max-w-sm space-y-4 text-center">
              <Confetti />
              <p className="text-2xl font-semibold" style={{ color: theme.text }}>
                {t("program.done.title")}
              </p>
              {player.moodBefore !== null && player.moodAfter !== null && player.moodAfter > player.moodBefore && (
                <p className="text-sm" style={{ color: theme.text }}>
                  {t("program.done.moodLifted")}
                </p>
              )}
              <p className="text-sm" style={{ color: theme.text }}>
                {t("program.done.shared", { name: practitionerName || "" })}
              </p>
              {nextSessionTitle && (
                <p className="text-sm font-medium" style={{ color: theme.text }}>
                  {t("program.done.nextUp", { title: nextSessionTitle })}
                </p>
              )}
              <Button type="button" onClick={handleClose} className="mt-2">
                {t("mindfulness.session.exit")}
              </Button>
            </div>
          )}
        </div>

        {showNav && (
          <div className="mt-2 flex items-center justify-between">
            <div>
              {showBack && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={player.back}
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  {t("program.player.back")}
                </Button>
              )}
            </div>
            <Button
              type="button"
              onClick={() => {
                if (player.step === "intro") ensureAudio()
                player.next()
              }}
              disabled={!player.canGoNext || (player.step === "reflect" && saving)}
            >
              {player.step === "intro" && t("program.player.begin")}
              {(player.step === "learn" || player.step === "affirm") && t("program.player.continue")}
              {player.step === "breathe" && t("program.player.finishBreathing")}
              {player.step === "reflect" && t("program.player.complete")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
