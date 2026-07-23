"use client"

import React, { createContext, useContext, useMemo } from "react"
import type { Locale } from "@/i18n/routing"
import { interpolate } from "@/lib/i18n"

type I18nContextValue = {
  locale: Locale
  messages: Record<string, string>
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Record<string, string>
  children: React.ReactNode
}) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return ctx
}

export function useT() {
  const { messages } = useI18n()
  return (key: string, values?: Record<string, string | number>) => {
    const template = messages[key] ?? key
    return interpolate(template, values)
  }
}
