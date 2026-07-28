"use client"

import { useMemo } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"

const COLORS = ["#2a9d8f", "#f59e0b", "#e63946", "#8b5cf6", "#4a8ab5"]

export function Confetti() {
  const reducedMotion = usePrefersReducedMotion()

  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: `${8 + ((i * 37) % 85)}%`,
        delay: `${(i % 10) * 0.05}s`,
        color: COLORS[i % COLORS.length],
      })),
    []
  )

  if (reducedMotion) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes programConfFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(140px) rotate(400deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 h-2 w-2 rounded-sm"
          style={{
            left: p.left,
            background: p.color,
            animation: `programConfFall 1.6s ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}
