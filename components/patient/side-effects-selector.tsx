"use client"

import React from "react"
import {
  Activity,
  AlertCircle,
  Battery,
  Brain,
  CircleSlash2,
  Croissant,
  Moon,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useT } from "@/components/i18n-provider"

export type SideEffectOption = {
  key: string
  label: string
  icon?: React.ReactNode
}

const OPTIONS: SideEffectOption[] = [
  { key: "none", label: "sideEffects.none", icon: <CircleSlash2 className="h-4 w-4" /> },
  { key: "nausea", label: "sideEffects.nausea", icon: <AlertCircle className="h-4 w-4" /> },
  { key: "headache", label: "sideEffects.headache", icon: <Brain className="h-4 w-4" /> },
  { key: "dizziness", label: "sideEffects.dizziness", icon: <Activity className="h-4 w-4" /> },
  { key: "fatigue", label: "sideEffects.fatigue", icon: <Battery className="h-4 w-4" /> },
  { key: "insomnia", label: "sideEffects.insomnia", icon: <Moon className="h-4 w-4" /> },
  { key: "appetite_change", label: "sideEffects.appetite_change", icon: <Croissant className="h-4 w-4" /> },
  { key: "anxiety_increase", label: "sideEffects.anxiety_increase", icon: <Activity className="h-4 w-4" /> },
  { key: "other", label: "sideEffects.other", icon: <Sparkles className="h-4 w-4" /> },
]

function toggleSelection(current: string[], key: string): string[] {
  const set = new Set(current)
  const has = set.has(key)

  if (key === "none") {
    return has ? [] : ["none"]
  }

  if (has) {
    set.delete(key)
  } else {
    set.add(key)
  }

  set.delete("none")

  return Array.from(set)
}

export function SideEffectsSelector({
  value,
  onChange,
  otherValue,
  onOtherChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
  otherValue: string
  onOtherChange: (next: string) => void
}) {
  const t = useT()
  const selected = value ?? []
  const otherSelected = selected.includes("other")

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-card-foreground">{t("patient.checkin.sideEffects.label")}</label>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.key)

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(toggleSelection(selected, opt.key))}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              )}
              role="checkbox"
              aria-checked={isSelected}
            >
              {opt.icon}
              <span>{t(`patient.checkin.${opt.label}`)}</span>
            </button>
          )
        })}
      </div>

      {otherSelected && (
        <div className="mt-3">
          <label htmlFor="sideEffectsOther" className="mb-1.5 block text-sm font-medium text-card-foreground">
            {t("patient.checkin.sideEffects.otherLabel")}
          </label>
          <input
            id="sideEffectsOther"
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
            placeholder={t("patient.checkin.sideEffects.otherPlaceholder")}
          />
        </div>
      )}
    </div>
  )
}
