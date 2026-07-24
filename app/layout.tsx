import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { cookies } from "next/headers"

import './globals.css'
import 'leaflet/dist/leaflet.css'
import { directionForLocale, defaultLocale, isLocale, type Locale } from '@/i18n/routing'
import { I18nProvider } from "@/components/i18n-provider"
import { ThemeProvider } from "@/components/theme-provider"

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'MindBridge - Mental Health Monitoring Platform',
  description: 'Secure mental health monitoring connecting practitioners and patients for continuous care between consultations.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value
  const locale: Locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale

  const messages = (await import(`../locales/${locale}.json`)).default as Record<string, string>

  return (
    <html lang={locale} dir={directionForLocale(locale)} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <I18nProvider locale={locale} messages={messages}>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
