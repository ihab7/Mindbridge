import React from "react"
import Link from "next/link"
import { Activity } from "lucide-react"
import {
  IconActivity,
  IconStethoscope,
  IconArrowRight,
  IconArrowLeft,
  IconPlayerPlay,
  IconShieldLock,
  IconDeviceMobile,
  IconLanguage,
} from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LocaleAutoDetect } from "@/components/locale-auto-detect"
import { PsychiatristFinder } from "@/components/psychiatrist/psychiatrist-finder"
import { Reveal } from "@/components/landing/reveal"
import { DashboardMockup } from "@/components/landing/dashboard-mockup"
import { FeaturesSection } from "@/components/landing/features-section"
import { JourneySection } from "@/components/landing/journey-section"
import { PatientPreviewSection } from "@/components/landing/patient-preview-section"
import { ReportsTabsSection } from "@/components/landing/reports-tabs-section"
import { CtaBanner } from "@/components/landing/cta-banner"
import { getSession } from "@/lib/auth"
import { getServerI18n } from "@/lib/server-i18n"
import { directionForLocale, isLocale } from "@/i18n/routing"

export default async function LandingPage() {
  const user = await getSession()
  const { t, locale } = await getServerI18n()
  const rtl = directionForLocale(isLocale(locale) ? locale : "fr") === "rtl"
  // The only glyph that must mirror: a "forward" arrow points the other way
  // in RTL. Logo, icons and the mockup keep their orientation.
  const ArrowForward = rtl ? IconArrowLeft : IconArrowRight

  const navLinks = [
    { href: "#top", label: t("landing.nav.home") },
    { href: "#features", label: t("landing.nav.features") },
    { href: "#pricing", label: t("landing.nav.pricing") },
    { href: "#about", label: t("landing.nav.about") },
    { href: "#faq", label: t("landing.nav.faq") },
  ]

  const trustItems = [
    { Icon: IconShieldLock, label: t("landing.hero.trust.encrypted") },
    { Icon: IconDeviceMobile, label: t("landing.hero.trust.devices") },
    { Icon: IconLanguage, label: t("landing.hero.trust.languages") },
  ]

  return (
    <div id="top" className="landingTints flex min-h-screen flex-col bg-background">
      <LocaleAutoDetect />

      {/* Landing-only animation rules. Kept here rather than in globals.css so
          nothing outside this page inherits them. prefers-reduced-motion
          neutralises the reveal, the lift and the press. */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .7s cubic-bezier(.16,1,.3,1),
                      transform .7s cubic-bezier(.16,1,.3,1);
        }
        .reveal.in { opacity: 1; transform: none; }
        .navLink::after {
          content: "";
          position: absolute;
          inset-inline-start: 0;
          bottom: -4px;
          height: 1.5px;
          width: 0;
          background: hsl(var(--primary));
          transition: width .25s ease;
        }
        .navLink:hover::after { width: 100%; }

        /* Icon tints used by the feature grid and the product mockups.
           Blue and violet have no theme token; they are declared once here
           so the dark theme can lighten them (and raise the fill alpha) in a
           single place instead of at every usage. Teal and amber come from
           --primary and --accent. */
        .landingTints {
          --tint-blue: 212 90% 55%;
          --tint-violet: 268 70% 60%;
          --tint-magenta: 322 72% 52%;
          --tint-alpha: 0.10;
        }
        .dark .landingTints {
          --tint-blue: 212 90% 68%;
          --tint-violet: 268 70% 72%;
          --tint-magenta: 322 78% 66%;
          --tint-alpha: 0.18;
        }



        .tabPanel { animation: tabFade .15s ease; }
        @keyframes tabFade { from { opacity: 0 } to { opacity: 1 } }

        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .navLink::after { transition: none; }
          .liftOnHover:hover { transform: none !important; }
          .pressable:active { transform: none !important; }
          .tabPanel { animation: none; }
        }
      `}</style>

      <header className="sticky top-0 z-20 border-b-[0.5px] border-border bg-card/[0.88] backdrop-blur-[12px]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-[18px] md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-[29px] w-[29px] items-center justify-center rounded-lg bg-primary">
              <IconActivity size={17} stroke={2} className="text-primary-foreground" />
            </span>
            <span className="text-base font-semibold text-foreground">MindBridge</span>
          </Link>

          <nav className="hidden items-center gap-7 min-[820px]:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="navLink relative text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher compactOnMobile />
            <Link
              href="/login"
              className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {t("landing.nav.login")}
            </Link>
            <Link
              href="/join"
              className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("landing.nav.start")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <div className="grid items-center gap-12 min-[820px]:grid-cols-[1fr_1.15fr]">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-[13px] py-1.5 text-xs font-medium text-primary">
                  <IconStethoscope size={14} stroke={2} />
                  {t("landing.hero.badge")}
                </span>

                <h1 className="mb-3.5 mt-4 text-[32px] font-semibold leading-[1.12] tracking-[-0.02em] text-foreground md:text-[42px]">
                  {t("landing.hero.titleLine1")}
                  <br />
                  {t("landing.hero.titleLine2")}
                </h1>

                <p className="max-w-[440px] text-[15px] leading-[1.65] text-muted-foreground">
                  {t("landing.hero.subtitle")}
                </p>

                <div className="mt-[26px] flex flex-wrap gap-3">
                  <Link
                    href="/join"
                    className="liftOnHover pressable inline-flex items-center gap-2 rounded-full bg-primary px-6 py-[13px] text-sm font-medium text-primary-foreground transition-all duration-[180ms] ease-[cubic-bezier(.34,1.4,.64,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_hsl(var(--primary)/0.32)] active:scale-[0.97]"
                  >
                    {t("landing.hero.ctaPrimary")}
                    <ArrowForward size={16} stroke={2} />
                  </Link>
                  <Link
                    href="#demo"
                    className="pressable inline-flex items-center gap-2 rounded-full border-[0.5px] border-border px-6 py-[13px] text-sm font-medium text-foreground transition-colors duration-[180ms] hover:border-primary hover:bg-primary/10 hover:text-primary active:scale-[0.97]"
                  >
                    {t("landing.hero.ctaSecondary")}
                    <IconPlayerPlay size={16} stroke={2} />
                  </Link>
                </div>

                <ul className="mt-8 flex flex-wrap gap-x-[26px] gap-y-4">
                  {trustItems.map(({ Icon, label }) => (
                    <li key={label} className="flex max-w-[150px] items-start gap-2">
                      <Icon size={17} stroke={1.75} className="mt-px shrink-0 text-primary" />
                      <span className="text-[11.5px] leading-[1.5] text-muted-foreground">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <DashboardMockup
                strings={{
                  practitionerBadge: t("landing.mockup.practitioner"),
                  greeting: t("landing.mockup.greeting"),
                  overview: t("landing.mockup.overview"),
                  navDashboard: t("nav.dashboard"),
                  navPatients: t("nav.patients"),
                  navAlerts: t("nav.alerts"),
                  navMessages: t("nav.messages"),
                  navSettings: t("nav.settings"),
                  kpiPatients: t("practitioner.dashboard.totalPatients"),
                  kpiAlerts: t("practitioner.dashboard.openAlerts"),
                  kpiCriticalMood: t("practitioner.dashboard.criticalMood"),
                  kpiActiveTracking: t("practitioner.dashboard.activeTracking"),
                  chartCaption: t("landing.mockup.chart"),
                }}
              />
            </div>
          </Reveal>
        </section>

        <FeaturesSection />

        <JourneySection />

        <PatientPreviewSection />

        <ReportsTabsSection
          strings={{
            badge: t("landing.reports.badge"),
            title: t("landing.reports.title"),
            tabClinical: t("landing.reports.tabClinical"),
            tabNarrative: t("landing.reports.tabNarrative"),
            clinical: [
              t("landing.reports.clinical1"),
              t("landing.reports.clinical2"),
              t("landing.reports.clinical3"),
              t("landing.reports.clinical4"),
            ],
            narrative: [
              t("landing.reports.narrative1"),
              t("landing.reports.narrative2"),
              t("landing.reports.narrative3"),
              t("landing.reports.narrative4"),
            ],
          }}
        />

        <section id="annuaire" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <PsychiatristFinder isLoggedIn={Boolean(user)} />
          </div>
        </section>

        <CtaBanner />

        <section id="demo" className="scroll-mt-20 px-6 py-20">
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
