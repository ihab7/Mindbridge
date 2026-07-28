"use client"

import React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Activity, LogOut, LayoutDashboard, Users, Bell, MessageCircle, Leaf, Route } from "lucide-react"
import type { User } from "@/lib/auth"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/toaster"
import { useT } from "@/components/i18n-provider"

const patientLinks = [
  { href: "/patient", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/patient/messages", labelKey: "nav.messages", icon: MessageCircle },
  { href: "/mindfulness", labelKey: "nav.mindfulness", icon: Leaf },
]

const practitionerLinks = [
  { href: "/practitioner", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/practitioner/patients", labelKey: "nav.patients", icon: Users },
  { href: "/practitioner/alerts", labelKey: "nav.alerts", icon: Bell },
  { href: "/practitioner/messages", labelKey: "nav.messages", icon: MessageCircle },
]

export function DashboardShell({
  user,
  children,
  hasActiveProgram = false,
  programNeedsAttention = false,
}: {
  user: User
  children: React.ReactNode
  /** Patient only: whether to show the "My Program" nav tab at all. */
  hasActiveProgram?: boolean
  /** Patient only: shows an attention dot on the "My Program" tab. */
  programNeedsAttention?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useT()
  const links =
    user.role === "patient" && hasActiveProgram
      ? [...patientLinks, { href: "/patient/program", labelKey: "nav.myProgram", icon: Route }]
      : user.role === "patient"
        ? patientLinks
        : practitionerLinks

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <Link href={user.role === "patient" ? "/patient" : "/practitioner"} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">MindBridge</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || (link.href !== "/" && link.href !== "/patient" && link.href !== "/practitioner" && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="relative">
                      <Icon className="h-4 w-4" />
                      {link.href === "/patient/program" && programNeedsAttention && (
                        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                      )}
                    </span>
                    {t(link.labelKey)}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{t(`role.${user.role}`)}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("auth.signOut")}</span>
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== "/" && link.href !== "/patient" && link.href !== "/practitioner" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="relative">
                  <Icon className="h-3.5 w-3.5" />
                  {link.href === "/patient/program" && programNeedsAttention && (
                    <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  )}
                </span>
                {t(link.labelKey)}
              </Link>
            )
          })}
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
