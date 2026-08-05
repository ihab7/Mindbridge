import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Activity, Shield, MessageCircle, BarChart3, Bell, Heart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LocaleAutoDetect } from "@/components/locale-auto-detect"
import { PsychiatristFinder } from "@/components/psychiatrist/psychiatrist-finder"
import { getSession } from "@/lib/auth"
import { getServerI18n } from "@/lib/server-i18n"

export default async function LandingPage() {
  const user = await getSession()
  const { t } = await getServerI18n()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LocaleAutoDetect />
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MindBridge</span>
          </div>
          <nav className="flex items-center gap-3">
            <LanguageSwitcher compactOnMobile />
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("nav.getStarted")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-primary" />
              {t("landing.badge")}
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t("landing.heroTitle")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              {t("landing.heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-primary px-8 py-3 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                {t("landing.ctaPrimary")}
              </Link>
              <Link
                href="/login"
                className="w-full rounded-lg border border-border bg-card px-8 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                {t("landing.ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-balance text-3xl font-bold text-foreground">
                {t("landing.features.title")}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {t("landing.features.subtitle")}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<BarChart3 className="h-5 w-5" />}
                title={t("landing.features.journaling.title")}
                description={t("landing.features.journaling.description")}
                illustration="/images/cloud-illustration.png"
              />
              <FeatureCard
                icon={<Activity className="h-5 w-5" />}
                title={t("landing.features.analytics.title")}
                description={t("landing.features.analytics.description")}
              />
              <FeatureCard
                icon={<Bell className="h-5 w-5" />}
                title={t("landing.features.alerts.title")}
                description={t("landing.features.alerts.description")}
              />
              <FeatureCard
                icon={<MessageCircle className="h-5 w-5" />}
                title={t("landing.features.messaging.title")}
                description={t("landing.features.messaging.description")}
              />
              <FeatureCard
                icon={<Shield className="h-5 w-5" />}
                title={t("landing.features.access.title")}
                description={t("landing.features.access.description")}
              />
              <FeatureCard
                icon={<Heart className="h-5 w-5" />}
                title={t("landing.features.calm.title")}
                description={t("landing.features.calm.description")}
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <PsychiatristFinder isLoggedIn={Boolean(user)} />
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center md:p-12">
            <h2 className="text-balance text-2xl font-bold text-foreground">
              {t("landing.demo.title")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("landing.demo.subtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login?demo=practitioner"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("landing.demo.practitioner")}
              </Link>
              <Link
                href="/login?demo=patient"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                {t("landing.demo.patient")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-primary" />
            MindBridge
          </div>
          <Link href="/join" className="text-sm font-medium text-primary hover:underline">
            {t("landing.footer.psychiatristCta")}
          </Link>
          <p className="text-sm text-muted-foreground">
            {t("landing.footer.tagline")}
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  illustration,
}: {
  icon: React.ReactNode
  title: string
  description: string
  illustration?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background p-6">
      {illustration && (
        <div className="absolute -right-3 -top-3 h-36 w-36">
          <Image
            src={illustration}
            alt=""
            fill
            className="object-contain"
            aria-hidden
          />
        </div>
      )}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
