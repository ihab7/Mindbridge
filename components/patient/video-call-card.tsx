"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Video, CalendarClock } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { VideoConsentDialog } from "./video-consent-dialog"
import type { PatientFacingConsultation } from "@/lib/video/data"

const POLL_MS = 15000

type PendingResponse = {
  prominent: PatientFacingConsultation | null
  upcoming: PatientFacingConsultation[]
}

function formatDateTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

// Plain setInterval polling, paused while the tab is hidden — no WebSocket,
// per the explicit "don't add new realtime infra for v1" call. A urgent call
// showing up with up to 15s of latency is an accepted tradeoff.
export function VideoCallCard({ patientName }: { patientName: string }) {
  const t = useT()
  const { locale } = useI18n()
  const router = useRouter()
  const [data, setData] = useState<PendingResponse | null>(null)
  const [consentOpen, setConsentOpen] = useState(false)
  const [declining, setDeclining] = useState(false)

  const fetchPending = useCallback(async () => {
    if (document.hidden) return
    try {
      const res = await fetch("/api/video/pending")
      if (!res.ok) return
      const json = (await res.json()) as PendingResponse
      setData(json)
    } catch {
      // Silent — this is a background poll, not a user-initiated action.
    }
  }, [])

  useEffect(() => {
    void fetchPending()
    const interval = window.setInterval(() => void fetchPending(), POLL_MS)
    const onVisible = () => {
      if (!document.hidden) void fetchPending()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [fetchPending])

  async function handleJoinAccepted(consultationId: string) {
    await fetch("/api/video/joined", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: consultationId }),
    })
    setConsentOpen(false)
    router.push(`/consultations/${consultationId}/live`)
  }

  async function handleDecline(consultationId: string) {
    setDeclining(true)
    try {
      await fetch("/api/video/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: consultationId }),
      })
      await fetchPending()
    } finally {
      setDeclining(false)
    }
  }

  const prominent = data?.prominent ?? null
  const upcoming = data?.upcoming ?? []

  if (!prominent && upcoming.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {prominent && (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground">
                {prominent.mode === "urgent"
                  ? t("video.card.urgentTitle", { name: prominent.practitionerName })
                  : t("video.card.scheduledReadyTitle", { name: prominent.practitionerName })}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {prominent.mode === "urgent" ? t("video.card.urgentSubtitle") : formatDateTime(prominent.scheduledAt!, locale)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setConsentOpen(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("video.card.join")}
            </button>
            {prominent.mode === "urgent" && (
              <button
                type="button"
                onClick={() => void handleDecline(prominent.id)}
                disabled={declining}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {t("video.card.notNow")}
              </button>
            )}
          </div>
        </div>
      )}

      {!prominent &&
        upcoming.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <CalendarClock className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("video.card.scheduledTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("video.card.scheduledWith", { date: formatDateTime(c.scheduledAt!, locale), name: c.practitionerName })}
              </p>
            </div>
          </div>
        ))}

      {prominent && (
        <VideoConsentDialog
          open={consentOpen}
          onOpenChange={setConsentOpen}
          patientName={patientName}
          onAccept={() => handleJoinAccepted(prominent.id)}
        />
      )}
    </div>
  )
}
