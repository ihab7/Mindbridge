"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Activity, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LocaleAutoDetect } from "@/components/locale-auto-detect"
import { useT } from "@/components/i18n-provider"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useT()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const demo = searchParams.get("demo")
    if (demo === "practitioner" || demo === "patient") {
      handleDemoLogin(demo)
    }
  }, [searchParams])

  async function handleDemoLogin(role: string) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      const contentType = res.headers.get("content-type") || ""
      let data: any = null

      if (contentType.includes("application/json")) {
        data = await res.json()
      } else {
        const text = await res.text()
        throw new Error(
          t("auth.errors.unexpectedResponse", { status: res.status }) +
            (text ? ` ${t("auth.errors.details", { details: text.slice(0, 200) })}` : "")
        )
      }

      if (!res.ok) throw new Error(data.error || t("auth.errors.demoLoginFailed"))
      window.location.href = data.user.role === "practitioner" ? "/practitioner" : "/patient"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.errors.demoLoginFailed"))
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const contentType = res.headers.get("content-type") || ""
      let data: any = null

      if (contentType.includes("application/json")) {
        data = await res.json()
      } else {
        const text = await res.text()
        throw new Error(
          t("auth.errors.unexpectedResponse", { status: res.status }) +
            (text ? ` ${t("auth.errors.details", { details: text.slice(0, 200) })}` : "")
        )
      }

      if (!res.ok) throw new Error(data.error || t("auth.errors.loginFailed"))
      window.location.href = data.user.role === "practitioner" ? "/practitioner" : "/patient"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.errors.loginFailed"))
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <LocaleAutoDetect />
      <div className="absolute right-4 top-4 flex items-center gap-2 rtl:right-auto rtl:left-4">
        <LanguageSwitcher compactOnMobile />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MindBridge</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-foreground">{t("auth.login.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("auth.login.subtitle")}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
                placeholder={t("auth.login.passwordPlaceholder")}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("nav.signIn")}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t("auth.login.orDemo")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => handleDemoLogin("practitioner")}
              disabled={loading}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {t("auth.login.demoPractitioner")}
            </button>
            <button
              onClick={() => handleDemoLogin("patient")}
              disabled={loading}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {t("auth.login.demoPatient")}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.login.noAccount")}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t("auth.login.createOne")}
          </Link>
        </p>
      </div>
    </div>
  )
}
