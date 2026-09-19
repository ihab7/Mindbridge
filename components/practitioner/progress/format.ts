"use client"

import { useMemo } from "react"
import { useI18n, useT } from "@/components/i18n-provider"

/**
 * Locale-aware formatting for the progress section. Day keys are formatted as
 * UTC midnights on purpose: a "YYYY-MM-DD" clinic day must print as the same
 * day on the server render and in every browser, whatever its time zone.
 */
export function useProgressFormat() {
  const { locale } = useI18n()
  const t = useT()
  return useMemo(() => {
    const one = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    const signed = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "exceptZero" })
    const signedInt = new Intl.NumberFormat(locale, { maximumFractionDigits: 0, signDisplay: "exceptZero" })
    const int = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
    const dayMonth = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" })
    const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" })
    const numericDay = new Intl.DateTimeFormat(locale, { day: "numeric", month: "numeric", timeZone: "UTC" })
    const long = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
    const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`)

    return {
      /** 7.25 → "7,3" (fr) */
      score: (n: number | null) => (n == null ? "—" : one.format(n)),
      /** 1.4 → "+1,4" */
      signed: (n: number) => signed.format(n),
      signedInt: (n: number) => signedInt.format(n),
      int: (n: number) => int.format(n),
      dayMonth: (iso: string) => dayMonth.format(asDate(iso)),
      weekday: (iso: string) => weekday.format(asDate(iso)),
      // Bidi marks (Arabic inserts U+200F) scramble the label inside the LTR chart SVG ("7/9" → "79/").
      axisDay: (iso: string) => numericDay.format(asDate(iso)).replace(/[‎‏؜]/g, ""),
      longDay: (iso: string) => long.format(asDate(iso)),
      /** Consecutive dates → "6–8 sept." ; single → "6 sept." ; scattered → "6 sept., 9 sept." */
      dates: (list: string[]) => {
        if (list.length === 0) return ""
        if (list.length === 1) return dayMonth.format(asDate(list[0]))
        const consecutive = list.every((d, i) => i === 0 || asDate(d).getTime() - asDate(list[i - 1]).getTime() === 86400000)
        if (consecutive) return `${dayMonth.format(asDate(list[0]))}–${dayMonth.format(asDate(list[list.length - 1]))}`
        const shown = list.slice(0, 4).map((d) => dayMonth.format(asDate(d))).join(", ")
        return list.length > 4 ? `${shown}…` : shown
      },
      /** "aujourd'hui" / "hier" / "il y a 3 jours" */
      whenAgo: (daysAgo: number) =>
        daysAgo <= 0
          ? t("practitioner.progress.when.today")
          : daysAgo === 1
            ? t("practitioner.progress.when.yesterday")
            : t("practitioner.progress.when.daysAgo", { count: daysAgo }),
    }
  }, [locale, t])
}

export type ProgressFormat = ReturnType<typeof useProgressFormat>
