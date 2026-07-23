import { defaultLocale, isLocale, type Locale } from "@/i18n/routing"

export async function loadMessages(requestLocale?: string): Promise<{ locale: Locale; messages: Record<string, string> }> {
  const locale: Locale = requestLocale && isLocale(requestLocale) ? requestLocale : defaultLocale
  const messages = (await import(`../locales/${locale}.json`)).default as Record<string, string>
  return { locale, messages }
}
