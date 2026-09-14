"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useT } from "@/components/i18n-provider"

// Shown before EVERY call, not just the first — a per-call timestamp
// (video_consultations.patient_consent_at) is the traceable record the
// telemedicine decree asks for, so re-showing it each time is the safer
// reading, not a redundant one. v1 pilot only: this in-app screen is the
// sole consent safeguard, no separate signed document — see consent_version
// in lib/video/data.ts.
export function VideoConsentDialog({
  open,
  onOpenChange,
  patientName,
  onAccept,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
  onAccept: () => void | Promise<void>
}) {
  const t = useT()
  const [accepting, setAccepting] = useState(false)

  async function handleAccept() {
    setAccepting(true)
    try {
      await onAccept()
    } finally {
      setAccepting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !accepting && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("video.consent.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-[13px] text-foreground">
          <p>{t("video.consent.intro")}</p>
          <p className="font-medium">{t("video.consent.lead")}</p>
          <ul className="list-disc space-y-1.5 ps-5">
            <li>{t("video.consent.point1")}</li>
            <li>{t("video.consent.point2")}</li>
            <li>{t("video.consent.point3", { name: patientName })}</li>
            <li>{t("video.consent.point4")}</li>
            <li>{t("video.consent.point5")}</li>
          </ul>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={accepting}>
            {t("video.consent.decline")}
          </Button>
          <Button type="button" onClick={() => void handleAccept()} disabled={accepting}>
            {t("video.consent.accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
