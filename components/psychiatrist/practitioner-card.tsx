"use client"

import { CheckCircle2 } from "lucide-react"
import { isOpenNow } from "@/lib/directory"
import type { PractitionerWithDistance } from "@/hooks/use-practitioners"

export function PractitionerCard({
  practitioner,
  isSelected,
  onClick,
}: {
  practitioner: PractitionerWithDistance
  isSelected: boolean
  onClick: () => void
}) {
  const isPremium = practitioner.plan === "premium"
  const openNow = isOpenNow(practitioner.opening_hours)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-colors duration-200 ${
        isSelected
          ? isPremium
            ? "border-accent bg-accent/[0.08]"
            : "border-primary bg-primary/[0.06]"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      {isPremium && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/[0.15] px-2 py-0.5 text-[10px] font-semibold text-accent-foreground/80">
          ⭐ Featured
        </span>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
            isPremium ? "bg-accent" : "bg-primary"
          }`}
        >
          {practitioner.full_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate pr-14 text-sm font-semibold text-foreground">{practitioner.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{practitioner.specialty}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {practitioner.experience_years != null && <span>{practitioner.experience_years}y experience</span>}
        {practitioner.distanceKm != null && <span>{practitioner.distanceKm.toFixed(1)} km away</span>}
        {openNow && (
          <span className="flex items-center gap-1 text-[#22c55e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" /> Open now
          </span>
        )}
      </div>

      {practitioner.is_verified && (
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-primary/30 bg-primary/[0.15] px-2 py-0.5 text-[10px] font-medium text-primary">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      )}
    </button>
  )
}
