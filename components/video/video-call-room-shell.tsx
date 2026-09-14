"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { Video, AlertTriangle, ArrowLeft, RotateCw, Loader2 } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import type { VideoConsultationMode, VideoConsultationStatus } from "@/lib/video/data"

// meet.jit.si is a public community service with no SLA — same caveat as the
// page-level comment. This 10s ceiling is what decides "failed to load" for
// both an outright network error (onError fires fast) and a request that
// just hangs under heavy throttling (neither onLoad nor onError ever fires).
const JITSI_LOAD_TIMEOUT_MS = 10000

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiApi
  }
}

type JitsiApi = {
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void
  dispose: () => void
}

// 'insecure' is separate from 'denied' on purpose: on an http:// origin that
// isn't localhost, navigator.mediaDevices is undefined outright, and telling
// someone to click the padlock icon would send them chasing a setting that
// cannot fix it. The fix there is the origin, not the permission.
type PermissionState = "checking" | "granted" | "denied" | "insecure" | "error"

export function VideoCallRoomShell({
  consultationId,
  roomName,
  mode,
  status,
  role,
  displayName,
  patientId,
}: {
  consultationId: string
  roomName: string
  mode: VideoConsultationMode
  status: VideoConsultationStatus
  role: "practitioner" | "patient"
  /** This participant's OWN Jitsi display name — what the OTHER side sees. */
  displayName: string
  patientId: number
}) {
  const t = useT()
  const { locale } = useI18n()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<JitsiApi | null>(null)
  const hasMarkedJoined = useRef(false)
  const leftHandled = useRef(false)

  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [jitsiReady, setJitsiReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [permissionState, setPermissionState] = useState<PermissionState>("checking")
  const [retryToken, setRetryToken] = useState(0)

  const dashboardHref = role === "practitioner" ? `/practitioner/patients/${patientId}` : "/patient"

  // Marks arrival as soon as this page is reached (post-consent for the
  // patient) — deliberately NOT re-fired from Jitsi's videoConferenceJoined
  // (Option A from Stop 2: the page mount already means "accepted and
  // arrived," and waiting for Jitsi to actually finish loading would race
  // against however long that takes).
  useEffect(() => {
    if (hasMarkedJoined.current) return
    hasMarkedJoined.current = true
    void fetch("/api/video/joined", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: consultationId }),
    })
  }, [consultationId])

  // Ask for camera/mic up front so a refusal produces a readable sentence
  // instead of an opaque Jitsi screen. The stream is released immediately —
  // Jitsi's iframe requests its own inside meet.jit.si.
  useEffect(() => {
    setPermissionState("checking")

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setPermissionState("insecure")
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionState("insecure")
      return
    }

    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop())
        if (!cancelled) setPermissionState("granted")
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const name = (err as { name?: string })?.name
        setPermissionState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "error")
      })

    return () => {
      cancelled = true
    }
  }, [retryToken])

  // Hard ceiling on Jitsi loading — started only once permission is settled,
  // otherwise a slow-to-answer permission prompt would trip the "failed to
  // load" fallback while the browser is still waiting on the user.
  useEffect(() => {
    if (permissionState !== "granted" || jitsiReady || loadError) return
    const timer = window.setTimeout(() => {
      setLoadError(true)
      void fetch("/api/video/report-load-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: consultationId, reason: "timeout" }),
      })
    }, JITSI_LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [permissionState, jitsiReady, loadError, consultationId])

  const handleLeft = useRef(() => {
    if (leftHandled.current) return
    leftHandled.current = true
    void fetch("/api/video/left", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: consultationId }),
    })
    router.push(dashboardHref)
  })

  useEffect(() => {
    if (permissionState !== "granted") return
    if (!scriptLoaded || loadError || !containerRef.current || apiRef.current) return
    if (!window.JitsiMeetExternalAPI) {
      setLoadError(true)
      return
    }

    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      userInfo: { displayName },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        // Both spellings on purpose: prejoinPageEnabled is the legacy key,
        // prejoinConfig.enabled the current one. Which of the two a given
        // meet.jit.si build reads depends on its version.
        prejoinPageEnabled: false,
        prejoinConfig: { enabled: false },
        disableDeepLinking: true,
        defaultLanguage: locale,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: "#0f172a",
        DISABLE_VIDEO_BACKGROUND: false,
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "closedcaptions",
          "desktop",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "chat",
          "settings",
          "raisehand",
          "videoquality",
          "tileview",
        ],
      },
    })
    apiRef.current = api
    setJitsiReady(true)

    // No videoConferenceJoined listener on purpose — see Option A note above.
    api.addEventListener("videoConferenceLeft", () => handleLeft.current())

    return () => {
      api.dispose()
      apiRef.current = null
    }
  }, [permissionState, scriptLoaded, loadError, roomName, displayName, locale])

  const retry = useCallback(() => {
    setLoadError(false)
    setRetryToken((n) => n + 1)
  }, [])

  const blockingMessage =
    loadError
      ? t("video.room.loadError")
      : permissionState === "denied"
        ? t("video.room.permission.denied")
        : permissionState === "insecure"
          ? t("video.room.permission.insecure")
          : permissionState === "error"
            ? t("video.room.permission.error")
            : null

  return (
    <div className="flex h-[100dvh] flex-col bg-[#0f172a]">
      {permissionState === "granted" && (
        <Script
          src="https://meet.jit.si/external_api.js"
          strategy="afterInteractive"
          onLoad={() => setScriptLoaded(true)}
          onError={() => setLoadError(true)}
        />
      )}

      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5 text-white">
        <Video className="h-4 w-4 shrink-0 opacity-80" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{t("video.room.title")}</p>
          <p className="truncate text-xs opacity-70">
            {mode === "urgent" ? t("video.room.modeUrgent") : t("video.room.modeScheduled")} · {t(`video.room.status.${status}`)}
          </p>
        </div>
      </div>

      <div className="relative flex-1">
        {blockingMessage ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <p className="max-w-md text-sm">{blockingMessage}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/25"
              >
                <RotateCw className="h-4 w-4" />
                {t("video.room.permission.retry")}
              </button>
              <button
                type="button"
                onClick={() => router.push(dashboardHref)}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("video.room.backToDashboard")}
              </button>
            </div>
          </div>
        ) : permissionState === "checking" ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("video.room.permission.checking")}
          </div>
        ) : (
          <>
            {!jitsiReady && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                {t("video.room.loading")}
              </div>
            )}
            <div ref={containerRef} className="h-full w-full" />
          </>
        )}
      </div>
    </div>
  )
}
