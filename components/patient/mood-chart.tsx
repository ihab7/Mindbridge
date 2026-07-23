"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useI18n, useT } from "@/components/i18n-provider"

type Entry = {
  mood: number
  anxiety: number
  created_at: string
}

export function MoodChart({ entries }: { entries: Entry[] }) {
  const { locale } = useI18n()
  const t = useT()

  const data = entries.map((e) => ({
    date: new Date(e.created_at).toLocaleDateString(locale, { month: "short", day: "numeric" }),
    mood: Number(e.mood),
    anxiety: Number(e.anxiety),
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">{t("patient.charts.mood.empty")}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-1 text-base font-semibold text-card-foreground">{t("patient.charts.mood.title")}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{t("patient.charts.lastEntries", { count: data.length })}</p>
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
            <YAxis
              domain={[1, 10]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
            />
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
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--chart-3))" }}
              name={t("patient.charts.mood.legend.anxiety")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
