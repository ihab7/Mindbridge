"use client"

import { useEffect, useState } from "react"
import type { DayWeather } from "@/lib/wellbeing/weeklySummary"

// Hidden until a day is tapped. Fades + slides in on each change (150ms).
// prefers-reduced-motion skips the transform via the motion-reduce utilities.
export function DayReflectionCard({ day }: { day: DayWeather | null }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!day) return
    setShown(false)
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [day?.date])

  if (!day) return null

  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`}
    >
      <p className="text-[13px] text-muted-foreground">{day.dayFull}</p>
      <p className="mt-1 text-[15px] font-medium text-card-foreground">{day.reflection}</p>
    </div>
  )
}
