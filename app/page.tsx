import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Activity, Shield, MessageCircle, BarChart3, Bell, Heart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { PsychiatristFinder } from "@/components/psychiatrist/psychiatrist-finder"
import { getSession } from "@/lib/auth"

export default async function LandingPage() {
  const user = await getSession()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MindBridge</span>
          </div>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Continuous mental health monitoring
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Bridge the gap between consultations
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              MindBridge connects psychiatrists and psychologists with their patients for daily mental health tracking, real-time alerts, and secure messaging -- all in one calm, focused platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-primary px-8 py-3 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="w-full rounded-lg border border-border bg-card px-8 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-balance text-3xl font-bold text-foreground">
                Everything you need for continuous care
              </h2>
              <p className="mt-3 text-muted-foreground">
                Simple, secure tools for both practitioners and patients.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<BarChart3 className="h-5 w-5" />}
                title="Daily Journaling"
                description="Patients log mood, sleep, anxiety, and medication daily with an intuitive, low-friction form."
                illustration="/images/cloud-illustration.png"
              />
              <FeatureCard
                icon={<Activity className="h-5 w-5" />}
                title="Visual Analytics"
                description="Practitioners see mood trends, sleep patterns, and medication adherence in clear, actionable charts."
              />
              <FeatureCard
                icon={<Bell className="h-5 w-5" />}
                title="Smart Alerts"
                description="Automatic alerts when mood drops, medication is missed, or sleep becomes critically low."
              />
              <FeatureCard
                icon={<MessageCircle className="h-5 w-5" />}
                title="Secure Messaging"
                description="Direct messaging between practitioner and patient for quick check-ins between appointments."
              />
              <FeatureCard
                icon={<Shield className="h-5 w-5" />}
                title="Role-Based Access"
                description="Patients see only their own data. Practitioners see only their assigned patients."
              />
              <FeatureCard
                icon={<Heart className="h-5 w-5" />}
                title="Calming Experience"
                description="Designed for minimal cognitive load with a clean, accessible interface that puts wellbeing first."
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
              Try the demo accounts
            </h2>
            <p className="mt-3 text-muted-foreground">
              Explore MindBridge instantly with pre-loaded demo data. No registration required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login?demo=practitioner"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Demo as Practitioner
              </Link>
              <Link
                href="/login?demo=patient"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                Demo as Patient
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
            Are you a psychiatrist? List your practice on MindBridge →
          </Link>
          <p className="text-sm text-muted-foreground">
            Secure mental health monitoring platform
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
