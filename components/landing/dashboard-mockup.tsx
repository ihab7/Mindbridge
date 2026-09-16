"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconLayoutDashboard,
  IconUsers,
  IconBell,
  IconMessage,
  IconSettings,
} from "@tabler/icons-react"

export type MockupStrings = {
  practitionerBadge: string
  greeting: string
  overview: string
  navDashboard: string
  navPatients: string
  navAlerts: string
  navMessages: string
  navSettings: string
  kpiPatients: string
  kpiAlerts: string
  kpiCriticalMood: string
  kpiActiveTracking: string
  chartCaption: string
}

const COUNTER_FRAMES = 18

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Counts 0 → target over ~18 frames once `run` flips true. */
function useCounter(target: number, run: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!run) return
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }

    let frame = 0
    let raf = 0
    const tick = () => {
      frame += 1
      setValue(Math.round((target * frame) / COUNTER_FRAMES))
      if (frame < COUNTER_FRAMES) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run])

  return value
}

function Kpi({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  /* Amber and destructive are deliberate here and ONLY here: they mirror the
     real practitioner dashboard's DashboardStatCard variants, so the mockup
     shows the product as it actually looks. The rest of the landing stays
     primary-only. */
  tone?: "default" | "warning" | "danger"
}) {
  const valueTone =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-foreground"

  return (
    <div className="rounded-[9px] border-[0.5px] border-border px-2.5 py-[9px]">
      <p className="text-[9.5px] leading-none text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-[17px] font-semibold leading-none ${valueTone}`}>{value}</p>
    </div>
  )
}

export function DashboardMockup({ strings }: { strings: MockupStrings }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathARef = useRef<SVGPathElement>(null)
  const pathBRef = useRef<SVGPathElement>(null)
  const [run, setRun] = useState(false)

  const patients = useCounter(12, run)
  const alerts = useCounter(3, run)
  const critical = useCounter(2, run)
  const active = useCounter(9, run)

  useEffect(() => {
    const el = rootRef.current
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

  // Stroke-drawing: measure, hide the whole length, force a reflow so the
  // browser commits that starting point, then transition the offset to 0.
  useEffect(() => {
    if (!run) return
    const reduced = prefersReducedMotion()

    for (const ref of [pathARef, pathBRef]) {
      const path = ref.current
      if (!path) continue
      const length = path.getTotalLength()
      path.style.strokeDasharray = `${length}`

      if (reduced) {
        path.style.strokeDashoffset = "0"
        continue
      }

      path.style.strokeDashoffset = `${length}`
      path.getBoundingClientRect() // reflow, otherwise the offset never animates
      path.style.transition = "stroke-dashoffset 1.5s cubic-bezier(.16,1,.3,1) .2s"
      path.style.strokeDashoffset = "0"
    }
  }, [run])

  const navItems = [
    { label: strings.navDashboard, Icon: IconLayoutDashboard, active: true },
    { label: strings.navPatients, Icon: IconUsers, active: false },
    { label: strings.navAlerts, Icon: IconBell, active: false },
    { label: strings.navMessages, Icon: IconMessage, active: false },
    { label: strings.navSettings, Icon: IconSettings, active: false },
  ]

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="overflow-hidden rounded-[14px] border-[0.5px] border-border bg-card shadow-2xl"
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b-[0.5px] border-border px-3.5 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-[9px] w-[9px] rounded-full bg-muted-foreground/30" />
          <span className="h-[9px] w-[9px] rounded-full bg-muted-foreground/30" />
          <span className="h-[9px] w-[9px] rounded-full bg-muted-foreground/30" />
        </div>
        <span className="text-[10.5px] text-muted-foreground">{strings.practitionerBadge}</span>
      </div>

      {/* Grid flips on its own in RTL — no start/end overrides needed. */}
      <div className="grid grid-cols-[112px_1fr] sm:grid-cols-[132px_1fr]">
        <div className="flex flex-col gap-0.5 border-e-[0.5px] border-border p-2.5">
          {navItems.map(({ label, Icon, active: isActive }) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-[7px] px-2.5 py-[7px] text-[11.5px] ${
                isActive ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={14} stroke={1.75} />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        <div className="p-3.5">
          <p className="text-[13px] font-semibold text-foreground">{strings.greeting}</p>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">{strings.overview}</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Kpi label={strings.kpiPatients} value={String(patients)} />
            <Kpi label={strings.kpiAlerts} value={String(alerts)} tone="warning" />
            <Kpi label={strings.kpiCriticalMood} value={String(critical)} tone="danger" />
            <Kpi label={strings.kpiActiveTracking} value={`${active}/12`} />
          </div>

          <div className="mt-2 h-[62px] rounded-[9px] border-[0.5px] border-border px-2.5 py-2">
            <p className="text-[10px] leading-none text-muted-foreground">{strings.chartCaption}</p>
            <svg viewBox="0 0 300 34" preserveAspectRatio="none" className="mt-1.5 h-[34px] w-full">
              <path
                ref={pathARef}
                d="M0 28 L50 25 L100 20 L150 21 L200 14 L250 10 L300 5"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                ref={pathBRef}
                d="M0 8 L50 11 L100 10 L150 16 L200 19 L250 24 L300 27"
                fill="none"
                stroke="hsl(var(--muted-foreground) / 0.5)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
