"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Draws its path on scroll-in: measure the length, hide it entirely, force a
 * reflow so the browser commits that start state, then transition the offset
 * back to 0. Same technique as the hero mockup — extracted here because two
 * sections now need it.
 */
export function AnimatedCurve({
  d,
  viewBox,
  className = "",
  strokeWidth = 2,
  durationMs = 1200,
  points = [],
}: {
  d: string
  viewBox: string
  className?: string
  strokeWidth?: number
  durationMs?: number
  points?: [number, number][]
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [run, setRun] = useState(false)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setRun(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRun(true)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!run) return
    const path = pathRef.current
    if (!path) return

    const length = path.getTotalLength()
    path.style.strokeDasharray = `${length}`

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      path.style.strokeDashoffset = "0"
      return
    }

    path.style.strokeDashoffset = `${length}`
    path.getBoundingClientRect()
    path.style.transition = `stroke-dashoffset ${durationMs}ms cubic-bezier(.16,1,.3,1) .15s`
    path.style.strokeDashoffset = "0"
  }, [run, durationMs])

  return (
    <svg ref={svgRef} viewBox={viewBox} preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="hsl(var(--primary))" />
      ))}
    </svg>
  )
}
