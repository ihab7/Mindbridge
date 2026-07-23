import type { Locale } from "@/i18n/routing"

export function formatShortDate(locale: Locale, value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleDateString(locale, { month: "short", day: "numeric" })
}

export function formatDateTime(locale: Locale, value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleString(locale)
}

export function relativeTime(locale: Locale, value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value
  const diffMs = Date.now() - d.getTime()

  if (!Number.isFinite(diffMs)) return ""

  const diffSec = Math.round(diffMs / 1000)
  const absSec = Math.abs(diffSec)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (absSec < 60) return rtf.format(-diffSec, "second")

  const diffMin = Math.round(diffSec / 60)
  const absMin = Math.abs(diffMin)
  if (absMin < 60) return rtf.format(-diffMin, "minute")

  const diffHr = Math.round(diffMin / 60)
  const absHr = Math.abs(diffHr)
  if (absHr < 24) return rtf.format(-diffHr, "hour")

  const diffDay = Math.round(diffHr / 24)
  const absDay = Math.abs(diffDay)
  if (absDay < 30) return rtf.format(-diffDay, "day")

  const diffMonth = Math.round(diffDay / 30)
  const absMonth = Math.abs(diffMonth)
  if (absMonth < 12) return rtf.format(-diffMonth, "month")

  const diffYear = Math.round(diffMonth / 12)
  return rtf.format(-diffYear, "year")
}
