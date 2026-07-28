"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useI18n, useT } from "@/components/i18n-provider"
import { ANXIETY_PROGRAM } from "@/lib/program/content"

const NOTE_MAX_LEN = 200

export function AssignProgramModal({
  open,
  onOpenChange,
  patientId,
  onAssigned,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: number
  onAssigned: () => void
}) {
  const { locale } = useI18n()
  const t = useT()
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  async function handleAssign() {
    setSaving(true)
    setError(false)
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/program`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) throw new Error("failed")
      setNote("")
      onOpenChange(false)
      onAssigned()
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("program.practitioner.assign")}</DialogTitle>
          <DialogDescription>{ANXIETY_PROGRAM.description[locale]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-sm font-semibold text-card-foreground">{ANXIETY_PROGRAM.title[locale]}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("program.practitioner.summary", { weeks: ANXIETY_PROGRAM.weeks.length, sessions: ANXIETY_PROGRAM.totalSessions })}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("program.practitioner.noteLabel")}</label>
            <Textarea
              value={note}
              maxLength={NOTE_MAX_LEN}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("program.practitioner.notePlaceholder")}
              className="min-h-[90px]"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{note.length}/{NOTE_MAX_LEN}</p>
          </div>

          {error && <p className="text-sm text-destructive">{t("program.error.saveFailedDescription")}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={() => void handleAssign()} disabled={saving}>
            {t("program.practitioner.assign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
