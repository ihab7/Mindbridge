"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { X, Volume2, VolumeX, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/components/i18n-provider"
import { AmbientPlayerCompact } from "@/components/AmbientPlayerCompact"
import type { SoundId } from "@/components/AmbientPlayer"
import { SOUND_GRADIENTS, BREATHING_THEMES, DEFAULT_THEME } from "@/lib/soundThemes"

type Phase = "inhale" | "hold" | "exhale"

type Pattern = { inhale: number; hold: number; exhale: number }

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function phaseLabelKey(phase: Phase) {
  if (phase === "inhale") return "mindfulness.session.inhale"
  if (phase === "hold") return "mindfulness.session.hold"
  return "mindfulness.session.exhale"
}

const EXERCISE_AMBIENT: Record<string, { sound: SoundId; timer: number }> = {
  one_minute:   { sound: "wind",   timer: 1 },
  three_minute: { sound: "rain",   timer: 3 },
  calm_down:    { sound: "forest", timer: 3 },
  sleep:        { sound: "night",  timer: 4 },
}

async function persistSession(payload: {
  exerciseType: string
  durationSeconds: number
}) {
  try {
    const res = await fetch("/api/patient/breathing-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { id?: string }
    return data.id ?? null
  } catch {
    return null
  }
}

async function persistRating(payload: { id: string; rating: number }) {
  try {
    await fetch("/api/patient/breathing-sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  } catch {
    // ignore
  }
}

export function BreathingSession({
  exerciseType,
  durationSeconds,
  pattern,
  title,
  onClose,
}: {
  exerciseType: string
  durationSeconds: number
  pattern: Pattern
  title: string
  onClose: () => void
}) {
  const t = useT()

  const [soundOn, setSoundOn]   = useState(false)
  const [remaining, setRemaining] = useState(durationSeconds)
  const [completed, setCompleted] = useState(false)
  const [rating, setRating]     = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [paused, setPaused]     = useState(false)
  const [activeSound, setActiveSound] = useState<SoundId | null>(
    EXERCISE_AMBIENT[exerciseType]?.sound ?? null,
  )

  // Phase label cross-fade state (Step 5)
  const [displayedPhase, setDisplayedPhase] = useState<Phase>("inhale")
  const [labelFading, setLabelFading]       = useState(false)
  const [labelEntering, setLabelEntering]   = useState(false)

  const audioCtxRef  = useRef<AudioContext | null>(null)
  const prevPhaseRef = useRef<Phase | null>(null)

  // ─── Phase computation ───────────────────────────────────────────────────────

  const phases = useMemo(() => {
    const arr: Array<{ phase: Phase; seconds: number }> = [
      { phase: "inhale", seconds: pattern.inhale },
      { phase: "hold",   seconds: pattern.hold   },
      { phase: "exhale", seconds: pattern.exhale  },
    ]
    return arr.filter((p) => p.seconds > 0)
  }, [pattern.exhale, pattern.hold, pattern.inhale])

  const cycleSeconds = useMemo(
    () => phases.reduce((sum, p) => sum + p.seconds, 0),
    [phases],
  )

  const phase = useMemo<Phase>(() => {
    if (completed) return "exhale"
    const elapsed = durationSeconds - remaining
    const within  = cycleSeconds > 0 ? elapsed % cycleSeconds : 0
    let cursor = 0
    for (const p of phases) {
      cursor += p.seconds
      if (within < cursor) return p.phase
    }
    return phases[0]?.phase ?? "inhale"
  }, [completed, cycleSeconds, durationSeconds, phases, remaining])

  const phaseDuration = useMemo(() => {
    const found = phases.find(p => p.phase === phase)
    return found?.seconds ?? 4
  }, [phase, phases])

  // ─── Effects ─────────────────────────────────────────────────────────────────

  // Countdown timer
  useEffect(() => {
    if (completed || paused) return
    const id = window.setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [completed, paused])

  // Completion trigger
  useEffect(() => {
    if (!completed && remaining === 0) {
      setCompleted(true)
      void persistSession({ exerciseType, durationSeconds }).then((id) => {
        if (id) setSessionId(id)
      })
    }
  }, [completed, durationSeconds, exerciseType, remaining])

  // Tone cue on phase change
  useEffect(() => {
    if (!soundOn || paused) return
    const prev = prevPhaseRef.current
    if (prev === phase) return
    prevPhaseRef.current = phase
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx  = audioCtxRef.current
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = phase === "inhale" ? 440 : phase === "hold" ? 330 : 220
      gain.gain.value = 0.0001
      osc.connect(gain); gain.connect(ctx.destination)
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
      osc.start(now); osc.stop(now + 0.2)
    } catch {
      // ignore audio errors
    }
  }, [paused, phase, soundOn])

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      try { audioCtxRef.current?.close() } catch { /* ignore */ }
      audioCtxRef.current = null
    }
  }, [])

  // Phase label cross-fade (Step 5)
  useEffect(() => {
    setLabelFading(true)
    const tid = setTimeout(() => {
      setLabelFading(false)
      setLabelEntering(true)
      setDisplayedPhase(phase)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setLabelEntering(false))
      })
    }, 480)
    return () => clearTimeout(tid)
  }, [phase])

  // ─── Theme resolution ─────────────────────────────────────────────────────────

  const activeBg =
    (activeSound ? SOUND_GRADIENTS[activeSound] : null) ??
    BREATHING_THEMES[exerciseType] ??
    DEFAULT_THEME

  // ─── Circle scale per phase (Step 4) ─────────────────────────────────────────

  const circleScale = completed
    ? { outer: 1, mid: 1, core: 1 }
    : phase === "exhale"
      ? { outer: 0.84, mid: 0.86, core: 0.88 }
      : { outer: 1.18, mid: 1.15, core: 1.12 }   // inhale + hold

  const circleTransition = `transform ${phaseDuration}s cubic-bezier(0.45,0.05,0.55,0.95), background 2.5s ease`

  // Rewrite rgba alpha so circle layers feel lighter against the gradient
  function reduceAlpha(rgba: string, alpha: number): string {
    return rgba.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`)
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[60] backdrop-blur-sm"
      style={{
        background: phase === "exhale" ? activeBg.exhale : activeBg.inhale,
        transition: "background 3s ease",
      }}
    >
      {/* CSS for phase label animation + glow keyframe */}
      <style>{`
        @keyframes glowOut {
          0%   { transform: translate(-50%,-50%) scale(1.0); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0;   }
        }
        .phase-lbl, .phase-sub {
          transition: color 2.5s ease, opacity 0.45s ease, transform 0.45s ease;
        }
        .fading   { opacity: 0; transform: translateY(-6px); }
        .entering { opacity: 0; transform: translateY(6px);  }
      `}</style>

      {/* Dark overlay fades in on exhale */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.10)",
          opacity:    phase === "exhale" ? 1 : 0,
          transition: "opacity 3s ease",
        }}
      />

      {/* ── Main content wrapper — 3-part flex column ── */}
      <div
        style={{
          width:          "100%",
          maxWidth:       "48rem",
          margin:         "0 auto",
          minHeight:      "480px",
          maxHeight:      "100vh",
          overflow:       "hidden",
          boxSizing:      "border-box",
          padding:        "20px 24px 28px",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "space-between",
        }}
      >
        {/* ── TOP: title left, controls right ── */}
        <div
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            width:          "100%",
            flexShrink:     0,
          }}
        >
          <div className="min-w-0">
            <p
              className="truncate text-sm font-medium"
              style={{ color: activeBg.text, transition: "color 2.5s ease" }}
            >
              {title}
            </p>
            <p
              className="text-xs"
              style={{ color: activeBg.sub, transition: "color 2.5s ease" }}
            >
              {formatTime(remaining)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!completed && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPaused((v) => !v)}
                aria-label={paused ? t("mindfulness.session.resume") : t("mindfulness.session.pause")}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSoundOn((v) => !v)}
              aria-label={t("mindfulness.session.sound")}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={t("mindfulness.session.exit")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── MIDDLE: circle + phase label / completed UI ── */}
        <div
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            flex:           1,
            gap:            "16px",
          }}
        >
          {/* 3-layer breathing circle + glow */}
          <div className="relative flex items-center justify-center" aria-hidden="true">

            {/* Glow ring — key resets keyframe on each phase change */}
            <div
              key={`glow-${phase}`}
              className="pointer-events-none absolute rounded-full"
              style={{
                width:      200,
                height:     200,
                left:       "50%",
                top:        "50%",
                transform:  "translate(-50%,-50%)",
                background: reduceAlpha(activeBg.glow, 0.25),
                animation:  phase === "inhale"
                  ? `glowOut ${phaseDuration}s ease-out forwards`
                  : "none",
              }}
            />

            {/* Outer ring — 160 × 160 */}
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width:           160,
                height:          160,
                background:      reduceAlpha(activeBg.ring, 0.30),
                transform:       `scale(${circleScale.outer})`,
                transition:      circleTransition,
                transformOrigin: "center",
              }}
            >
              {/* Mid ring — 115 × 115 */}
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width:           115,
                  height:          115,
                  background:      reduceAlpha(activeBg.mid, 0.44),
                  transform:       `scale(${circleScale.mid})`,
                  transition:      circleTransition,
                  transformOrigin: "center",
                }}
              >
                {/* Core — 76 × 76 */}
                <div
                  className="rounded-full"
                  style={{
                    width:           76,
                    height:          76,
                    background:      reduceAlpha(activeBg.core, 0.62),
                    transform:       `scale(${circleScale.core})`,
                    transition:      circleTransition,
                    transformOrigin: "center",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Phase label / completed UI */}
          {!completed ? (
            <div className="text-center">
              <p
                className={`phase-lbl text-xl font-semibold ${labelFading ? "fading" : ""} ${labelEntering ? "entering" : ""}`}
                style={{ color: activeBg.text }}
              >
                {t(phaseLabelKey(displayedPhase))}
              </p>
              <p
                className={`phase-sub mt-1 text-sm ${labelFading ? "fading" : ""} ${labelEntering ? "entering" : ""}`}
                style={{ color: activeBg.sub }}
              >
                {formatTime(remaining)}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <div className="text-center">
                <p className="text-xl font-semibold text-foreground">
                  {t("mindfulness.session.completed")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("mindfulness.session.howDoYouFeel")}
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={rating === n ? "default" : "outline"}
                    className="h-10 w-10 px-0"
                    onClick={() => setRating(n)}
                  >
                    {t(`mindfulness.session.scale.${n}`)}
                  </Button>
                ))}
              </div>

              <div className="flex justify-center gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("mindfulness.session.exit")}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (sessionId && rating !== null) {
                      void persistRating({ id: sessionId, rating })
                    }
                    onClose()
                  }}
                  disabled={rating === null}
                >
                  {t("mindfulness.session.save")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM: ambient sound strip ── */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "10px",
            width:         "100%",
            flexShrink:    0,
          }}
        >
          {!completed && (
            <AmbientPlayerCompact
              defaultSound={EXERCISE_AMBIENT[exerciseType]?.sound}
              defaultTimer={EXERCISE_AMBIENT[exerciseType]?.timer}
              breathingPhase={phase}
              activeSound={activeSound}
              onSoundChange={setActiveSound}
              accentColor={activeBg.core}
            />
          )}
        </div>
      </div>
    </div>
  )
}
