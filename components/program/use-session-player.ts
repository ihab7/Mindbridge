"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { BreathingPattern, ProgramSession } from "@/lib/program/types"
import { sessionAudio } from "@/lib/program/audio"

export type PlayerStep = "intro" | "learn" | "countdown" | "breathe" | "affirm" | "reflect" | "done"

export const STEP_ORDER: PlayerStep[] = ["intro", "learn", "countdown", "breathe", "affirm", "reflect", "done"]

export type BreathPhaseName = "inhale" | "hold" | "exhale"
export type BreathPhase = { name: BreathPhaseName; dur: number; scale: number; tone: "in" | "out" | null }

export const PATTERNS: Record<BreathingPattern, BreathPhase[]> = {
  box: [
    { name: "inhale", dur: 4, scale: 1.2, tone: "in" },
    { name: "hold", dur: 4, scale: 1.2, tone: null },
    { name: "exhale", dur: 4, scale: 0.82, tone: "out" },
    { name: "hold", dur: 4, scale: 0.82, tone: null },
  ],
  "478": [
    { name: "inhale", dur: 4, scale: 1.2, tone: "in" },
    { name: "hold", dur: 7, scale: 1.2, tone: null },
    { name: "exhale", dur: 8, scale: 0.8, tone: "out" },
  ],
  coherent: [
    { name: "inhale", dur: 5, scale: 1.18, tone: "in" },
    { name: "exhale", dur: 5, scale: 0.84, tone: "out" },
  ],
}

export type SessionCompletionPayload = {
  moodBefore: number | null
  moodAfter: number | null
  reflectionAnswer: string
  selectedTriggers: string[]
}

export function useSessionPlayer(session: ProgramSession, onComplete: (payload: SessionCompletionPayload) => void) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = STEP_ORDER[stepIndex]

  const [moodBefore, setMoodBefore] = useState<number | null>(null)
  const [moodAfter, setMoodAfter] = useState<number | null>(null)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [reflectionAnswer, setReflectionAnswer] = useState("")

  const [countdown, setCountdown] = useState(3)

  const pattern = useMemo(() => PATTERNS[session.breathing.pattern], [session.breathing.pattern])
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [secondsLeftInPhase, setSecondsLeftInPhase] = useState(pattern[0].dur)
  const [remaining, setRemaining] = useState(session.breathing.durationSec)
  const [breathingDone, setBreathingDone] = useState(false)
  const tickRef = useRef(0)
  const phaseIdxRef = useRef(0)

  function toggleTrigger(label: string) {
    setSelectedTriggers((prev) => (prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]))
    sessionAudio.sfx("select")
  }

  // Countdown: 3 → 2 → 1, auto-advances to the breathing step.
  useEffect(() => {
    if (step !== "countdown") return
    setCountdown(3)
    sessionAudio.sfx("tick")
    let n = 3
    const id = setInterval(() => {
      n -= 1
      if (n <= 0) {
        clearInterval(id)
        setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1))
      } else {
        setCountdown(n)
        sessionAudio.sfx("tick")
      }
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // Breathing loop: advances phases on a 1s tick, fires tones on phase change,
  // unlocks "Continue" once the full duration has elapsed.
  useEffect(() => {
    if (step !== "breathe") return

    tickRef.current = 0
    phaseIdxRef.current = 0
    setPhaseIdx(0)
    setSecondsLeftInPhase(pattern[0].dur)
    setRemaining(session.breathing.durationSec)
    setBreathingDone(false)

    if (pattern[0].tone) sessionAudio.playBreathTone(pattern[0].tone, pattern[0].dur)

    const id = setInterval(() => {
      tickRef.current += 1

      setRemaining((r) => {
        const next = r <= 1 ? 0 : r - 1
        if (next <= 0) {
          clearInterval(id)
          sessionAudio.sfx("chime")
          setBreathingDone(true)
        }
        return next
      })

      const current = pattern[phaseIdxRef.current]
      if (tickRef.current >= current.dur) {
        tickRef.current = 0
        phaseIdxRef.current = (phaseIdxRef.current + 1) % pattern.length
        const nextPhase = pattern[phaseIdxRef.current]
        setPhaseIdx(phaseIdxRef.current)
        setSecondsLeftInPhase(nextPhase.dur)
        if (nextPhase.tone) sessionAudio.playBreathTone(nextPhase.tone, nextPhase.dur)
      } else {
        setSecondsLeftInPhase(Math.max(current.dur - tickRef.current, 1))
      }
    }, 1000)

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pattern, session.breathing.durationSec])

  const canGoNext = useMemo(() => {
    if (step === "intro") return moodBefore !== null
    if (step === "breathe") return breathingDone
    return true
  }, [step, moodBefore, breathingDone])

  function next() {
    if (!canGoNext) return
    if (step === "reflect") {
      sessionAudio.sfx("complete")
      onComplete({ moodBefore, moodAfter, reflectionAnswer, selectedTriggers })
    } else {
      sessionAudio.sfx("tap")
    }
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1))
  }

  function back() {
    sessionAudio.sfx("tap")
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  return {
    step,
    stepIndex,
    totalSteps: STEP_ORDER.length,
    moodBefore,
    setMoodBefore,
    moodAfter,
    setMoodAfter,
    selectedTriggers,
    toggleTrigger,
    reflectionAnswer,
    setReflectionAnswer,
    countdown,
    breathing: {
      pattern,
      phaseIdx,
      phase: pattern[phaseIdx],
      secondsLeftInPhase,
      remaining,
      totalDuration: session.breathing.durationSec,
      done: breathingDone,
    },
    canGoNext,
    next,
    back,
  }
}
