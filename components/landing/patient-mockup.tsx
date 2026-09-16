"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconActivity,
  IconLayoutDashboard,
  IconUsers,
  IconBell,
  IconMessage,
  IconSettings,
  IconAlertTriangle,
  IconMoodSmile,
  IconWaveSine,
  IconMoon,
  IconPill,
} from "@tabler/icons-react"

export type PatientMockupStrings = {
  practitioner: string
  patientBadge: string
  followedSince: string
  mood: string
  anxiety: string
  sleep: string
  adherence: string
  chartTitle: string
  attention: string
  alert: string
  seeDetails: string
  currentState: string
  seeReport: string
  navDashboard: string
  navPatients: string
  navAlerts: string
  navMessages: string
  navSettings: string
}

const COUNTER_FRAMES = 18

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Counts 0 → target, then hands the raw number to a formatter. */
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
      setValue((target * frame) / COUNTER_FRAMES)
      if (frame < COUNTER_FRAMES) raf = requestAnimationFrame(tick)
      else setValue(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run])

  return value
}

function formatMinutes(totalMinutes: number) {
  const m = Math.round(totalMinutes)
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`
}

function Metric({
  label,
  value,
  delta,
  up,
  tint,
  Icon,
}: {
  label: string
  value: string
  delta: string
  up: boolean
  /* Tints are CSS custom properties declared on the landing wrapper, so the
     dark theme can lighten them in one place instead of per usage. */
  tint: string
  Icon: typeof IconMoodSmile
}) {
  return (
    <div className="rounded-lg border-[0.5px] border-border p-2">
      <div className="flex items-center gap-1">
        <Icon size={9} stroke={2} style={{ color: `hsl(var(${tint}))` }} />
        <span className="text-[8px] leading-none text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-[14px] font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-[8px] leading-none" style={{ color: `hsl(var(${tint}))` }}>
        {up ? "↑" : "↓"} {delta}
      </p>
    </div>
  )
}

export function PatientMockup({ strings }: { strings: PatientMockupStrings }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [run, setRun] = useState(false)

  const mood = useCounter(7.2, run)
  const anxiety = useCounter(3.1, run)
  const sleepMin = useCounter(7 * 60 + 24, run)
  const adherence = useCounter(92, run)

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

  useEffect(() => {
    if (!run) return
    const path = pathRef.current
    if (!path) return
    const length = path.getTotalLength()
    path.style.strokeDasharray = `${length}`

    if (prefersReducedMotion()) {
      path.style.strokeDashoffset = "0"
      return
    }
    path.style.strokeDashoffset = `${length}`
    path.getBoundingClientRect() // commit the start state before transitioning
    path.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1) .2s"
    path.style.strokeDashoffset = "0"
  }, [run])

  const navItems = [
    { label: strings.navDashboard, Icon: IconLayoutDashboard, active: true },
    { label: strings.navPatients, Icon: IconUsers, active: false },
    { label: strings.navAlerts, Icon: IconBell, active: false },
    { label: strings.navMessages, Icon: IconMessage, active: false },
    { label: strings.navSettings, Icon: IconSettings, active: false },
  ]

  return (
    <div ref={rootRef} aria-hidden="true" className="relative">
      {/* Desktop window */}
      <div className="overflow-hidden rounded-[14px] border-[0.5px] border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b-[0.5px] border-border px-3.5 py-2.5">
          <span className="flex items-center gap-1.5">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-primary">
              <IconActivity size={11} stroke={2} className="text-primary-foreground" />
            </span>
            <span className="text-[10px] font-semibold text-foreground">MindBridge</span>
          </span>
          <span className="text-[9.5px] text-muted-foreground">{strings.practitioner}</span>
        </div>

        <div className="grid grid-cols-[92px_1fr] sm:grid-cols-[108px_1fr]">
          <div className="flex flex-col gap-0.5 border-e-[0.5px] border-border p-2">
            {navItems.map(({ label, Icon, active }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] ${
                  active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={12} stroke={1.75} />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>

          <div className="px-[15px] py-[13px]">
            <div className="flex items-center gap-2">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-primary/[0.12] text-[10px] font-semibold text-primary">
                AB
              </span>
              <div>
                <span className="flex items-center gap-1.5">
                  <span className="text-[11.5px] font-semibold text-foreground">Ahmed Ben Ali</span>
                  <span className="rounded-full bg-muted px-1.5 py-px text-[8.5px] text-muted-foreground">
                    {strings.patientBadge}
                  </span>
                </span>
                <p className="text-[9px] text-muted-foreground">{strings.followedSince}</p>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-[7px]">
              <Metric label={strings.mood} value={`${mood.toFixed(1)}/10`} delta="18%" up tint="--primary" Icon={IconMoodSmile} />
              <Metric label={strings.anxiety} value={`${anxiety.toFixed(1)}/10`} delta="24%" up={false} tint="--tint-violet" Icon={IconWaveSine} />
              <Metric label={strings.sleep} value={formatMinutes(sleepMin)} delta="1h12m" up tint="--tint-blue" Icon={IconMoon} />
              <Metric label={strings.adherence} value={`${Math.round(adherence)}%`} delta="7%" up tint="--primary" Icon={IconPill} />
            </div>

            <div className="mt-2 grid grid-cols-[1.4fr_1fr] gap-2">
              <div className="rounded-lg border-[0.5px] border-border p-2">
                <p className="text-[9px] leading-none text-muted-foreground">{strings.chartTitle}</p>
                <svg viewBox="0 0 160 40" preserveAspectRatio="none" className="mt-1 h-[38px] w-full">
                  <path
                    ref={pathRef}
                    d="M4 33 L43 27 L82 22 L121 14 L156 7"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {[
                    [4, 33],
                    [43, 27],
                    [82, 22],
                    [121, 14],
                    [156, 7],
                  ].map(([cx, cy]) => (
                    <circle key={`${cx}`} cx={cx} cy={cy} r="2.5" fill="hsl(var(--primary))" />
                  ))}
                </svg>
                <div className="flex justify-between text-[7px] text-muted-foreground">
                  <span>J1</span>
                  <span>J7</span>
                  <span>J14</span>
                  <span>J21</span>
                  <span>J30</span>
                </div>
              </div>

              <div className="rounded-lg border-[0.5px] border-border p-2">
                <p className="mb-1 text-[9px] leading-none text-muted-foreground">{strings.attention}</p>
                <div
                  className="rounded-[7px] border-[0.5px] px-2 py-[7px]"
                  style={{
                    backgroundColor: "hsl(var(--accent) / 0.08)",
                    borderColor: "hsl(var(--accent) / 0.25)",
                  }}
                >
                  <IconAlertTriangle size={11} stroke={2} style={{ color: "hsl(var(--accent))" }} />
                  <p className="mt-1 text-[9px] leading-snug text-foreground">{strings.alert}</p>
                </div>
                <p className="mt-1.5 text-[8.5px] text-primary">{strings.seeDetails}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping mobile card — hidden under 900px, where it would spill
          outside the column. inset-inline-end flips it to the left in RTL. */}
      <div className="absolute bottom-[-26px] z-[2] hidden w-[132px] rounded-xl border-[0.5px] border-border bg-card p-[11px] shadow-2xl [inset-inline-end:-18px] min-[900px]:block">
        <div className="flex items-center gap-1.5">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-primary/[0.12] text-[8px] font-semibold text-primary">
            AB
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-foreground">Ahmed Ben Ali</p>
            <p className="text-[8px] text-muted-foreground">{strings.patientBadge}</p>
          </div>
        </div>

        <p className="mb-[5px] mt-2 text-[8.5px] text-muted-foreground">{strings.currentState}</p>

        {[
          { Icon: IconMoodSmile, label: strings.mood, value: "7.3/10", delta: "↑ 16%", tint: "--primary" },
          { Icon: IconWaveSine, label: strings.anxiety, value: "3.1/10", delta: "↓ 26%", tint: "--tint-violet" },
          { Icon: IconMoon, label: strings.sleep, value: "7h12m", delta: "↑ 11%", tint: "--tint-blue" },
          { Icon: IconPill, label: strings.adherence, value: "92%", delta: "↑ 7%", tint: "--primary" },
        ].map(({ Icon, label, value, delta, tint }) => (
          <div key={label} className="flex items-center justify-between py-[3px] text-[9px]">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Icon size={10} stroke={2} style={{ color: `hsl(var(${tint}))` }} />
              {label}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-foreground">{value}</span>
              <span style={{ color: `hsl(var(${tint}))` }}>{delta}</span>
            </span>
          </div>
        ))}

        <div className="mt-2 flex h-[26px] items-center justify-center rounded-md bg-primary text-[9px] font-medium text-primary-foreground">
          {strings.seeReport}
        </div>
      </div>
    </div>
  )
}
