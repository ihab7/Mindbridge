"use client"

import { useEffect, useRef, useState } from "react"
import { IconUser, IconChartLine, IconBell, IconCalendarCheck } from "@tabler/icons-react"

export type TimelineStep = { title: string; desc: string }

const ICONS = [IconUser, IconChartLine, IconBell, IconCalendarCheck]

/**
 * The connecting line is a ::before on the container (see the landing
 * <style> block) rather than a border on each row, so it runs continuously
 * from the first circle's centre to the last. It is positioned with
 * inset-inline-start, which puts it on the right in RTL without a second
 * rule.
 */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`tlLine relative ${shown ? "in" : ""}`}>
      {steps.map((step, index) => {
        const Icon = ICONS[index]
        const isLast = index === steps.length - 1
        return (
          <div
            key={step.title}
            className={`reveal ${shown ? "in" : ""} flex gap-4 ${isLast ? "" : "pb-[26px]"}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <span className="relative z-[1] flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-primary/[0.08]">
              <Icon size={19} stroke={1.75} className="text-primary" />
            </span>
            <div className="pt-1">
              <p className="mb-1 text-sm font-semibold text-foreground">{step.title}</p>
              <p className="text-[12.5px] leading-[1.55] text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
