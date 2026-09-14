"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Video } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useT } from "@/components/i18n-provider"
import { toast } from "@/hooks/use-toast"

type CallType = "urgent" | "scheduled"

const MAX_REASON_LEN = 300

export function VideoConsultationDialog({
  patientId,
  patientName,
}: {
  patientId: number
  patientName: string
}) {
  const t = useT()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [callType, setCallType] = useState<CallType>("urgent")
  const [reason, setReason] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetAndClose() {
    setOpen(false)
    setCallType("urgent")
    setReason("")
    setScheduledAt("")
    setError(null)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const body =
        callType === "urgent"
          ? { patientId, mode: "urgent", reason: reason.trim() || undefined }
          : { patientId, mode: "scheduled", scheduledAt: new Date(scheduledAt).toISOString() }

      const res = await fetch("/api/video/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        setError(t("video.dialog.error"))
        return
      }
      const data = (await res.json()) as { id: string }

      if (callType === "urgent") {
        router.push(`/consultations/${data.id}/live`)
        return
      }

      resetAndClose()
      const dateLabel = new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(scheduledAt))
      toast({ title: t("video.dialog.scheduledToast", { date: dateLabel }) })
    } catch {
      setError(t("video.dialog.error"))
    } finally {
      setSubmitting(false)
    }
  }

  const minScheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)
  const canSubmit =
    callType === "urgent"
      ? reason.length <= MAX_REASON_LEN
      : scheduledAt.length > 0 && new Date(scheduledAt).getTime() > Date.now()

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Video className="h-4 w-4" />
        {t("video.button")}
      </Button>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("video.dialog.title", { name: patientName })}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>{t("video.dialog.typeLabel")}</Label>
              <RadioGroup value={callType} onValueChange={(v) => setCallType(v as CallType)} className="flex flex-col gap-2">
                <label
                  htmlFor="video-type-urgent"
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors ${
                    callType === "urgent" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value="urgent" id="video-type-urgent" />
                  {t("video.dialog.typeUrgent")}
                </label>
                <label
                  htmlFor="video-type-scheduled"
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors ${
                    callType === "scheduled" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  }`}
                >
                  <RadioGroupItem value="scheduled" id="video-type-scheduled" />
                  {t("video.dialog.typeScheduled")}
                </label>
              </RadioGroup>
            </div>

            {callType === "urgent" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="video-reason">{t("video.dialog.reasonLabel")}</Label>
                <Textarea
                  id="video-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LEN))}
                  maxLength={MAX_REASON_LEN}
                  rows={3}
                  placeholder={t("video.dialog.reasonPlaceholder")}
                />
                <span className="text-end text-[11px] text-muted-foreground">{reason.length}/{MAX_REASON_LEN}</span>
                <p className="text-[12px] text-muted-foreground">{t("video.dialog.urgentNotice")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="video-scheduled-at">{t("video.dialog.dateTimeLabel")}</Label>
                <Input
                  id="video-scheduled-at"
                  type="datetime-local"
                  min={minScheduledAt}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
                <p className="text-[12px] text-muted-foreground">{t("video.dialog.scheduledNotice")}</p>
              </div>
            )}

            {error && <p className="text-[13px] text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose} disabled={submitting}>
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={() => void handleSubmit()} disabled={submitting || !canSubmit}>
              {submitting
                ? t("video.dialog.submitting")
                : callType === "urgent"
                  ? t("video.dialog.submitUrgent")
                  : t("video.dialog.submitScheduled")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
