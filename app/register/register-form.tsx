"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Activity, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LocaleAutoDetect } from "@/components/locale-auto-detect"
import { useT } from "@/components/i18n-provider"
import { CodeInput } from "@/components/linking/code-input"
import { linkingErrorMessage } from "@/components/linking/linking-error"
import { LinkedConfirmation, type LinkedPractitioner } from "@/components/linking/linked-confirmation"

/** Welcome copy only — never sent to the API, never used to link. */
export type PractitionerContext = { name: string; specialty: string }

export function RegisterForm({ practitionerContext = null }: { practitionerContext?: PractitionerContext | null }) {
  const router = useRouter()
  const t = useT()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // Two steps: account details, then "do you have a code from your
  // practitioner?". The account is only created on the second step, so a
  // wrong code never leaves a half-made account behind.
  const [step, setStep] = useState<"details" | "code" | "linked">("details")
  const [linkedTo, setLinkedTo] = useState<LinkedPractitioner | null>(null)
  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [pending, setPending] = useState<"code" | "skip" | null>(null)

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setStep("code")
  }

  async function createAccount(withCode: boolean) {
    setLoading(true)
    setPending(withCode ? "code" : "skip")
    setError("")
    setCodeError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "patient", ...(withCode ? { linkingCode: code } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errorCode) {
          // Code problem: stay on the code step so it can be corrected.
          setCodeError(linkingErrorMessage(t, data.errorCode, data.practitionerName))
        } else {
          // Account problem (e.g. email already registered): back to the details.
          setError(data.error || t("auth.errors.registrationFailed"))
          setStep("details")
        }
        setLoading(false)
        setPending(null)
        return
      }
      if (data.practitioner) {
        // Linked by the code: say who to before the dashboard. The session
        // cookie is already set, so "Continue" is a plain navigation.
        setLinkedTo(data.practitioner)
        setStep("linked")
        setLoading(false)
        setPending(null)
        return
      }
      window.location.href = "/patient"
    } catch {
      setError(t("auth.errors.registrationFailed"))
      setStep("details")
      setLoading(false)
      setPending(null)
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
          <h1 className="mt-4 text-2xl font-bold text-foreground">{t("auth.register.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("auth.register.subtitle")}</p>
        </div>

        <div className="mb-card rounded-xl border border-border bg-card p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === "linked" && linkedTo ? (
            <LinkedConfirmation
              practitioner={linkedTo}
              pending={loading}
              onContinue={() => {
                setLoading(true)
                window.location.href = "/patient"
              }}
            />
          ) : step === "code" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (code.length === 6 && !loading) createAccount(true)
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("auth.register.code.title")}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {practitionerContext
                    ? t("patients.code.contextHint", { name: practitionerContext.name })
                    : t("auth.register.code.subtitle")}
                </p>
              </div>
              <p className="rounded-lg bg-primary/[0.06] px-3 py-2.5 text-sm leading-relaxed text-foreground">
                {t("linking.code.explainer")}
              </p>
              <div>
                <CodeInput
                  id="linking-code"
                  label={t("linking.code.label")}
                  value={code}
                  onChange={(v) => {
                    setCode(v)
                    setCodeError("")
                  }}
                  invalid={Boolean(codeError)}
                  describedBy={codeError ? "linking-code-error" : undefined}
                  autoFocus
                />
                {codeError && (
                  <p id="linking-code-error" role="alert" className="mt-2 text-sm text-destructive">
                    {codeError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {pending === "code" ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.register.code.continue")}
              </button>
              <button
                type="button"
                onClick={() => createAccount(false)}
                disabled={loading}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-60"
              >
                {pending === "skip" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t("auth.register.code.skip")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("details")
                  setCodeError("")
                }}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline disabled:opacity-60"
              >
                {t("auth.register.code.back")}
              </button>
            </form>
          ) : (
          <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4">
            {practitionerContext && (
              <p className="rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2.5 text-sm leading-relaxed text-foreground">
                {t("patients.register.contextBanner", practitionerContext)}
              </p>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.register.roleLabel")}
              </label>
              {/* Patient only. Practitioner accounts are created by /join, which
                  also builds the directory listing — see
                  app/api/directory/practitioners/route.ts. */}
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-pressed="true"
                  className="flex-1 rounded-lg border border-primary bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors"
                >
                  {t("auth.register.patientOption")}
                </button>
              </div>
              <Link href="/join" className="mt-2 block text-sm font-medium text-primary hover:underline">
                {t("landing.footer.psychiatristCta")}
              </Link>
            </div>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.fullName")}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
                placeholder={t("auth.fullNamePlaceholder")}
              />
            </div>
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
                minLength={8}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
                placeholder={t("auth.register.passwordPlaceholder")}
              />
            </div>
            <button
              type="submit"
              className="mt-2 flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {t("auth.register.code.continue")}
            </button>
          </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.register.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("auth.register.signInLink")}
          </Link>
        </p>
      </div>
    </div>
  )
}
