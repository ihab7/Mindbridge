import { cookies } from "next/headers"
import { defaultLocale, isLocale, type Locale } from "@/i18n/routing"
import { interpolate } from "@/lib/i18n"

export type Translator = (key: string, values?: Record<string, string | number>) => string

/**
 * Build a translator bound to a SPECIFIC locale, independent of the viewer's
 * current cookie. Used by the printable consultation report so a report issued
 * in French renders in French even when reopened by a viewer whose UI is set to
 * another language.
 */
export async function getI18nForLocale(locale: Locale): Promise<Translator> {
  const messages = (await import(`../locales/${locale}.json`)).default as Record<string, string>
  return (key: string, values?: Record<string, string | number>) => {
    const template = messages[key] ?? key
    return interpolate(template, values)
  }
}

export async function getServerI18n(): Promise<{
  locale: Locale
  t: (key: string, values?: Record<string, string | number>) => string
}> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value
  const locale: Locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale

  const messages = (await import(`../locales/${locale}.json`)).default as Record<string, string>

  function t(key: string, values?: Record<string, string | number>) {
    const template = messages[key] ?? key
    return interpolate(template, values)
  }

  return { locale, t }
}
