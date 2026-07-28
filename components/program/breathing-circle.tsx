"use client"

import { useEffect, useState } from "react"
import type { BreathPhase } from "./use-session-player"
import type { PlayerSoundTheme } from "@/lib/program/theme"
import { useT } from "@/components/i18n-provider"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

const RADIUS = 78
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function phaseLabelKey(name: BreathPhase["name"]) {
  if (name === "inhale") return "program.phase.inhale"
  if (name === "hold") return "program.phase.hold"
  return "program.phase.exhale"
}

export function BreathingCircle({
  phase,
  secondsLeft,
  elapsedSec,
  totalSec,
  theme,
}: {
  phase: BreathPhase
  secondsLeft: number
  elapsedSec: number
  totalSec: number
  theme: PlayerSoundTheme
}) {
  const t = useT()
  const reducedMotion = usePrefersReducedMotion()

  const [displayedName, setDisplayedName] = useState(phase.name)
  const [labelHidden, setLabelHidden] = useState(false)

  useEffect(() => {
    setLabelHidden(true)
    const id = setTimeout(() => {
      setDisplayedName(phase.name)
      setLabelHidden(false)
    }, 380)
    return () => clearTimeout(id)
  }, [phase.name])

  const progress = totalSec > 0 ? Math.min(elapsedSec / totalSec, 1) : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const scale = reducedMotion ? 1 : phase.scale
  const circleTransition = reducedMotion
    ? "background 2s ease"
    : `transform ${phase.dur}s cubic-bezier(0.45,0.05,0.55,0.95), background 2s ease`

  return (
    <div className="relative flex h-[170px] w-[170px] items-center justify-center" aria-hidden="true">
      <svg
        width={170}
        height={170}
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx={85} cy={85} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={4} />
        <circle
          cx={85}
          cy={85}
          r={RADIUS}
          fill="none"
          stroke={theme.ring}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>

      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 112,
          height: 112,
          background: theme.circleOuter,
          transform: `scale(${scale})`,
          transition: circleTransition,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 66,
            height: 66,
            background: theme.circleInner,
            transform: `scale(${scale * 0.98})`,
            transition: circleTransition,
          }}
        >
          <span className="text-xl font-medium text-white" style={{ transition: "opacity .4s ease" }}>
            {secondsLeft}
          </span>
        </div>
      </div>

      <p
        aria-live="polite"
        className="absolute -bottom-9 left-1/2 w-max -translate-x-1/2 text-[17px] font-medium"
        style={{
          color: theme.text,
          opacity: labelHidden ? 0 : 1,
          transform: labelHidden ? "translateY(-4px)" : "translateY(0)",
          transition: "opacity .4s ease, transform .4s ease, color 2s ease",
        }}
      >
        {t(phaseLabelKey(displayedName))}
      </p>
    </div>
  )
}
