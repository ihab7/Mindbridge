"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

// Same visual language as StoryCard.tsx (the existing clickable-card
// precedent in this app): shadow + hover elevation + focus ring. A real
// <Link> (not a <button>) so cmd/ctrl-click, screen-reader "link" semantics,
// and open-in-new-tab keep working — with an explicit Space handler added
// since native <a> only activates on Enter.
export function DashboardStatCard({
  href,
  icon,
  label,
  value,
  ariaLabel,
  variant = "default",
}: {
  href: string
  icon: ReactNode
  label: string
  value: string
  ariaLabel: string
  variant?: "default" | "warning" | "danger"
}) {
  const router = useRouter()

  const iconBg =
    variant === "danger"
      ? "bg-destructive/10 text-destructive"
      : variant === "warning"
        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
        : "bg-primary/10 text-primary"

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === " ") {
          e.preventDefault()
          router.push(href)
        }
      }}
      className="block cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Link>
  )
}
