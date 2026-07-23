"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useI18n, useT } from "@/components/i18n-provider"

type Entry = {
  medication_taken: boolean
  sleep_hours: number
  created_at: string
}

export function MedicationChart({ entries }: { entries: Entry[] }) {
  const { locale } = useI18n()
  const t = useT()

  const data = entries.map((e) => ({
    date: new Date(e.created_at).toLocaleDateString(locale, { month: "short", day: "numeric" }),
    sleep: Number(e.sleep_hours),
    medTaken: e.medication_taken,
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">{t("patient.charts.sleepMedication.empty")}</p>
      </div>
    )
  }

  const adherenceRate = entries.length > 0
    ? Math.round((entries.filter((e) => e.medication_taken).length / entries.length) * 100)
    : 0

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="mb-1 text-base font-semibold text-card-foreground">{t("patient.charts.sleepMedication.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("patient.charts.sleepMedication.subtitle")}</p>
        </div>
        <div className="rounded-lg bg-primary/10 px-3 py-1.5 text-center">
          <p className="text-lg font-bold text-primary">{adherenceRate}%</p>
          <p className="text-[10px] text-muted-foreground">{t("patient.charts.sleepMedication.adherence")}</p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{ value: t("common.hoursAbbrev"), angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, _name: string, item: any) => [
                t("patient.charts.sleepMedication.tooltip.sleepHours", {
                  hours: value,
                  medStatus: item?.payload?.medTaken ? "" : t("patient.entries.medMissed"),
                }),
                t("patient.charts.sleepMedication.tooltip.sleep"),
              ]}
            />
            <Bar dataKey="sleep" radius={[4, 4, 0, 0]} name={t("patient.charts.sleepMedication.bar.sleepHours")}>
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.medTaken ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
          {t("patient.entries.medTaken")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--destructive))" }} />
          {t("patient.entries.medMissed")}
        </div>
      </div>
    </div>
  )
}
