"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Link2, Loader2 } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { CodeInput } from "@/components/linking/code-input"
import { linkingErrorMessage } from "@/components/linking/linking-error"
import { directionForLocale, isLocale } from "@/i18n/routing"

/**
 * Shown instead of the dashboard to a patient with no practitioner. The only
 * way forward is a code their practitioner gave them — there is deliberately
 * no "pick a practitioner" action here or in the directory.
 */
export function LinkPractitionerCard() {
  const t = useT()
  const { locale } = useI18n()
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const rtl = directionForLocale(isLocale(locale) ? locale : "fr") === "rtl"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6 || loading) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/patient/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(linkingErrorMessage(t, data.errorCode, data.practitionerName))
        setLoading(false)
        return
      }
      // Linked: the server page now renders the full dashboard.
      router.refresh()
    } catch {
      setError(linkingErrorMessage(t, "generic"))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-xl border border-border bg-card p-6 sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
        <Link2 className="h-5 w-5 text-primary" />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-foreground">{t("patient.unlinked.title")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("patient.unlinked.body")}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <CodeInput
            id="dashboard-linking-code"
            label={t("linking.code.label")}
            value={code}
            onChange={(v) => {
              setCode(v)
              setError("")
            }}
            invalid={Boolean(error)}
            describedBy={error ? "dashboard-linking-code-error" : undefined}
          />
        </div>
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="flex h-[3.4rem] items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("patient.unlinked.submit")}
        </button>
      </form>
      {error && (
        <p id="dashboard-linking-code-error" role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
        {t("patient.unlinked.findPractitioner")}{" "}
        <Link href="/#annuaire" className="font-medium text-primary hover:underline">
          {rtl ? "← " : "→ "}
          {t("patient.unlinked.directoryLink")}
        </Link>
      </p>
    </div>
  )
}
