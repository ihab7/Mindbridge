"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, Loader2, UserPlus } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import type { LinkingCodeRow } from "@/lib/linking/codes"

// Expiry is shown in the clinic's zone so the server render and the browser
// produce the same text (no hydration mismatch, whatever the device zone).
const CLINIC_TIME_ZONE = "Africa/Tunis"

function useDateFormatter() {
  const { locale } = useI18n()
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: CLINIC_TIME_ZONE })
  return (iso: string) => fmt.format(new Date(iso))
}

/** "7K4M9P" → "7 K 4 M 9 P", so screen readers spell it out. */
function spelled(code: string) {
  return code.split("").join(" ")
}

export function LinkingCodePanel({ initialRecent }: { initialRecent: LinkingCodeRow[] }) {
  const t = useT()
  const formatDate = useDateFormatter()
  const [current, setCurrent] = useState<{ code: string; expiresAt: string } | null>(null)
  const [recent, setRecent] = useState(initialRecent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError("")
    setCopied(false)
    try {
      const res = await fetch("/api/practitioner/linking-codes", { method: "POST" })
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      setCurrent({ code: data.code, expiresAt: data.expiresAt })
      setRecent(data.recent)
    } catch {
      setError(t("practitioner.linking.error"))
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    if (!current) return
    try {
      await navigator.clipboard.writeText(current.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. plain-HTTP origin): the code stays on screen, selectable.
    }
  }

  return (
    <section className="mb-card rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="h-4 w-4 text-primary" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{t("practitioner.linking.title")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("practitioner.linking.subtitle")}</p>
        </div>
      </div>

      {current ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.05] px-4 py-5 text-center">
          <p
            dir="ltr"
            aria-label={`${t("linking.code.label")}: ${spelled(current.code)}`}
            className="select-all font-mono text-4xl font-semibold tracking-[0.3em] text-foreground sm:text-5xl"
          >
            {current.code}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("practitioner.linking.validUntil", { date: formatDate(current.expiresAt) })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              <span aria-live="polite">{copied ? t("practitioner.linking.copied") : t("practitioner.linking.copy")}</span>
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t("practitioner.linking.generateAnother")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("practitioner.linking.generate")}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {recent.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("practitioner.linking.recent")}
          </h3>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {recent.map((row) => {
              const usedLabel =
                row.patientName != null
                  ? t("practitioner.linking.status.used", { name: row.patientName, date: formatDate(row.usedAt ?? row.createdAt) })
                  : t("practitioner.linking.status.usedUnknown", { date: formatDate(row.usedAt ?? row.createdAt) })
              return (
                <li key={row.code} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 text-sm">
                  <span
                    dir="ltr"
                    className={`font-mono tracking-wider ${row.status === "active" ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {row.code}
                  </span>
                  <span className={row.status === "active" ? "text-primary" : "text-muted-foreground"}>
                    {row.status === "active" && t("practitioner.linking.validUntil", { date: formatDate(row.expiresAt) })}
                    {row.status === "expired" && t("practitioner.linking.status.expired")}
                    {row.status === "used" &&
                      (row.patientId != null ? (
                        <Link href={`/practitioner/patients/${row.patientId}`} className="hover:text-foreground hover:underline">
                          {usedLabel}
                        </Link>
                      ) : (
                        usedLabel
                      ))}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
