"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { defaultLocale, type Locale } from "@/i18n/routing"

function detectBrowserLocale(): Locale {
  const lang = navigator.language?.toLowerCase() ?? ""
  if (lang.startsWith("fr")) return "fr"
  if (lang.startsWith("ar")) return "ar"
  return defaultLocale
}

function hasStoredLocale() {
  return document.cookie.split("; ").some((entry) => entry.startsWith("NEXT_LOCALE="))
}

/** Picks a locale from the browser on a visitor's first hit and persists it via the
 *  same NEXT_LOCALE cookie the language switcher uses, so it's a no-op afterwards. */
export function LocaleAutoDetect() {
  const router = useRouter()

  useEffect(() => {
    if (hasStoredLocale()) return

    const detected = detectBrowserLocale()
    document.cookie = `NEXT_LOCALE=${detected}; path=/; max-age=31536000; samesite=lax`
    if (detected !== defaultLocale) router.refresh()
  }, [router])

  return null
}
