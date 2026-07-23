"use client"

import React, { useEffect, useMemo, useState } from "react"
import { MessageCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n, useT } from "@/components/i18n-provider"
import { formatShortDate, relativeTime } from "@/lib/time"

type FeedbackResponse = {
  feedback: null | {
    note: string
    nextAppointmentAt: string | null
    updatedAt: string
    practitionerName: string
  }
}

export function PractitionerFeedbackCard() {
  const { locale } = useI18n()
  const t = useT()

  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackResponse["feedback"]>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/patient/feedback")
        if (!res.ok) throw new Error("failed")
        const data = (await res.json()) as FeedbackResponse
        if (!cancelled) setFeedback(data.feedback)
      } catch {
        if (!cancelled) setFeedback(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const updatedLabel = useMemo(() => {
    if (!feedback?.updatedAt) return ""
    const rel = relativeTime(locale, feedback.updatedAt)
    return t("patient.feedback.updated", { value: rel })
  }, [feedback?.updatedAt, locale, t])

  const appointmentLabel = useMemo(() => {
    if (!feedback?.nextAppointmentAt) return ""
    return t("patient.feedback.nextAppointment", { value: formatShortDate(locale, feedback.nextAppointmentAt) })
  }, [feedback?.nextAppointmentAt, locale, t])

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>{t("patient.feedback.title")}</span>
        </CardTitle>
        {!loading && feedback?.practitionerName ? (
          <CardDescription className="text-xs">{feedback.practitionerName}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : feedback ? (
          <div className="space-y-3">
            <p className={`text-sm leading-relaxed text-card-foreground ${expanded ? "" : "line-clamp-5"}`}>
              {feedback.note}
            </p>
            {feedback.note.length > 240 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? t("common.readLess") : t("common.readMore")}
              </Button>
            )}
            {feedback.nextAppointmentAt ? (
              <p className="text-xs text-muted-foreground">{appointmentLabel}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-0.5">
            <p className="text-sm text-muted-foreground">{t("patient.feedback.empty")}</p>
            <p className="text-xs text-muted-foreground">{t("patient.feedback.emptyHint")}</p>
          </div>
        )}
      </CardContent>
      {!loading && feedback?.updatedAt ? (
        <CardFooter className="pt-0 text-xs text-muted-foreground">
          <span>{updatedLabel}</span>
        </CardFooter>
      ) : null}
    </Card>
  )
}
