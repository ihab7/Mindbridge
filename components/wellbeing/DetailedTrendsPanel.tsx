"use client"

import { useEffect, useState } from "react"
import { IconChevronDown } from "@tabler/icons-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useI18n, useT } from "@/components/i18n-provider"

type Entry = {
  mood: number
  anxiety: number
  created_at: string
}

const STORAGE_KEY = "mb_trends_expanded"

// Opt-in detailed view for patients who want the raw lines. Mood uses the teal
// token; anxiety uses a neutral grey — never orange or red. Collapsed by
// default; the chart stays mounted and is flipped via `hidden` so toggling is a
// synchronous CSS display change. Preference persists in localStorage.
export function DetailedTrendsPanel({ entries }: { entries: Entry[] }) {
  const { locale } = useI18n()
  const t = useT()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(STORAGE_KEY) === "true")
    } catch {
      /* ignore storage errors */
    }
  }, [])

  function toggle() {
    setOpen((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* ignore storage errors */
      }
      return next
    })
  }

  const data = entries.map((e) => ({
    date: new Date(e.created_at).toLocaleDateString(locale, { month: "short", day: "numeric" }),
    mood: Number(e.mood),
    anxiety: Number(e.anxiety),
  }))

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-5 py-4 text-sm font-medium text-card-foreground"
      >
        <span>{open ? t("wellbeing.trends.hide") : t("wellbeing.trends.show")}</span>
        <IconChevronDown
          size={18}
          stroke={1.75}
          aria-hidden
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={open ? "px-5 pb-5" : "hidden"}>
        {data.length === 0 ? (
          <p className="pb-2 text-sm text-muted-foreground">{t("patient.charts.mood.empty")}</p>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                {/* Y-axis kept for scaling but hidden, and no tooltip: the
                    lines show trend shape only. Per the patient-view rule, no
                    numeric mood value is ever exposed — not on an axis, not in a
                    tooltip. */}
                <YAxis domain={[1, 10]} hide />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--chart-1))" }}
                  name={t("patient.charts.mood.legend.mood")}
                />
                <Line
                  type="monotone"
                  dataKey="anxiety"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--muted-foreground))" }}
                  name={t("patient.charts.mood.legend.anxiety")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
