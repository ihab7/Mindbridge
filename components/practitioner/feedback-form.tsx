"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useI18n, useT } from "@/components/i18n-provider"
import { relativeTime } from "@/lib/time"
import { toast } from "@/hooks/use-toast"

type ApiResponse = {
  feedback: null | {
    id: string
    note: string
    next_appointment_at: string | null
    updated_at: string
  }
}

function toDateInputValue(value: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function PractitionerFeedbackForm({ patientId }: { patientId: number }) {
  const { locale } = useI18n()
  const t = useT()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [note, setNote] = useState("")
  const [nextAppointment, setNextAppointment] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const noteMax = 500

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/practitioner/patients/${patientId}/feedback`)
        if (!res.ok) throw new Error("failed")
        const data = (await res.json()) as ApiResponse
        const fb = data.feedback
        if (!cancelled) {
          setNote(fb?.note ?? "")
          setNextAppointment(toDateInputValue(fb?.next_appointment_at ?? null))
          setUpdatedAt(fb?.updated_at ?? null)
        }
      } catch {
        if (!cancelled) {
          setNote("")
          setNextAppointment("")
          setUpdatedAt(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [patientId])

  const updatedLabel = useMemo(() => {
    if (!updatedAt) return ""
    return t("practitioner.feedback.lastUpdated", { value: relativeTime(locale, updatedAt) })
  }, [locale, t, updatedAt])

  async function onSave() {
    const trimmed = note.trim().slice(0, noteMax)
    if (!trimmed) {
      toast({
        title: t("practitioner.feedback.errors.noteRequired"),
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: trimmed,
          nextAppointmentAt: nextAppointment ? new Date(`${nextAppointment}T00:00:00`).toISOString() : null,
        }),
      })

      if (!res.ok) {
        throw new Error("failed")
      }

      const data = (await res.json()) as ApiResponse
      setUpdatedAt(data.feedback?.updated_at ?? new Date().toISOString())
      toast({ title: t("common.saved") })
    } catch {
      toast({ title: t("practitioner.feedback.errors.failedToSave") })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("practitioner.feedback.title")}</CardTitle>
        <CardDescription className="text-sm">{t("practitioner.feedback.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-card-foreground">{t("practitioner.feedback.messageLabel")}</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, noteMax))}
            maxLength={noteMax}
            rows={4}
            placeholder={t("practitioner.feedback.messagePlaceholder")}
            disabled={loading || saving}
          />
          <div className="text-right text-xs text-muted-foreground">{note.length}/{noteMax}</div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-card-foreground">{t("practitioner.feedback.nextAppointmentLabel")}</label>
          <Input
            type="date"
            value={nextAppointment}
            onChange={(e) => setNextAppointment(e.target.value)}
            disabled={loading || saving}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{updatedLabel}</p>
        <Button type="button" onClick={onSave} disabled={loading || saving}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </CardFooter>
    </Card>
  )
}
