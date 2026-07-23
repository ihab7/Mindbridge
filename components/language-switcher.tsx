"use client"

import React, { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/routing"
import { useI18n, useT } from "@/components/i18n-provider"

function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`
}

export function LanguageSwitcher() {
  const router = useRouter()
  const { locale: activeLocaleFromProvider } = useI18n()
  const t = useT()

  const activeLocale = useMemo<Locale>(() => {
    return isLocale(activeLocaleFromProvider) ? activeLocaleFromProvider : defaultLocale
  }, [activeLocaleFromProvider])

  function onSelect(next: Locale) {
    setLocaleCookie(next)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold">{activeLocale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => onSelect(loc)}
            className={loc === activeLocale ? "bg-accent" : undefined}
          >
            <span className="flex w-full items-center justify-between gap-3">
              <span>{t(`language.${loc}`)}</span>
              <span className="text-xs font-semibold text-muted-foreground">{loc.toUpperCase()}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
