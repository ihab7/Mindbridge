"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2, Pill } from "lucide-react"
import { SideEffectsSelector } from "@/components/patient/side-effects-selector"
import { useT } from "@/components/i18n-provider"
import { CollapsibleSound } from "@/components/CollapsibleSound"

export function JournalForm() {
  const router = useRouter()
  const t = useT()
  const [mood, setMood] = useState(5)
  const [anxiety, setAnxiety] = useState(5)
  const [sleepHours, setSleepHours] = useState("7")
  const [medicationTaken, setMedicationTaken] = useState(true)
  const [sideEffects, setSideEffects] = useState<string[]>(["none"])
  const [sideEffectsOther, setSideEffectsOther] = useState("")
  const [challenges, setChallenges] = useState("")
  const [achievements, setAchievements] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          anxiety,
          sleepHours: parseFloat(sleepHours),
          medicationTaken,
          sideEffects,
          sideEffectsOther,
          challenges,
          achievements,
        }),
      })

      if (!res.ok) {
        let message = t("patient.checkin.errors.failedToSubmit")
        try {
          const data = (await res.json()) as { error?: string }
          if (data?.error) message = data.error
        } catch {
          // ignore parse errors
        }
        throw new Error(message)
      }
      setSuccess(true)
      setChallenges("")
      setAchievements("")
      setSideEffects(["none"])
      setSideEffectsOther("")
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : t("patient.checkin.errors.failedToSubmitTryAgain")
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const moodLabel =
    mood <= 2
      ? t("patient.checkin.moodScale.veryLow")
      : mood <= 4
        ? t("patient.checkin.moodScale.low")
        : mood <= 6
          ? t("patient.checkin.moodScale.moderate")
          : mood <= 8
            ? t("patient.checkin.moodScale.good")
            : t("patient.checkin.moodScale.excellent")

  const anxietyLabel =
    anxiety <= 2
      ? t("patient.checkin.anxietyScale.calm")
      : anxiety <= 4
        ? t("patient.checkin.anxietyScale.mild")
        : anxiety <= 6
          ? t("patient.checkin.anxietyScale.moderate")
          : anxiety <= 8
            ? t("patient.checkin.anxietyScale.high")
            : t("patient.checkin.anxietyScale.severe")

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-card-foreground">{t("patient.checkin.title")}</h2>
      <p className="mb-5 text-sm text-muted-foreground">{t("patient.checkin.subtitle")}</p>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          <CheckCircle2 className="h-4 w-4" />
          {t("patient.checkin.success.saved")}
        </div>
      )}

      <div className="mb-5">
        <CollapsibleSound />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-card-foreground">
              {t("patient.checkin.mood.label")}
            </label>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {t("common.outOfTenWithLabel", { value: mood, label: moodLabel })}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{t("patient.checkin.moodScale.veryLow")}</span>
            <span>{t("patient.checkin.moodScale.excellent")}</span>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-card-foreground">
              {t("patient.checkin.anxiety.label")}
            </label>
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-foreground" style={{ backgroundColor: "hsl(var(--accent) / 0.1)", color: "hsl(var(--accent))" }}>
              {t("common.outOfTenWithLabel", { value: anxiety, label: anxietyLabel })}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={anxiety}
            onChange={(e) => setAnxiety(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{t("patient.checkin.anxietyScale.calm")}</span>
            <span>{t("patient.checkin.anxietyScale.severe")}</span>
          </div>
        </div>

        <div>
          <label htmlFor="sleep" className="mb-1.5 block text-sm font-medium text-card-foreground">
            {t("patient.checkin.sleepHours.label")}
          </label>
          <input
            id="sleep"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            {t("patient.checkin.medicationTaken.label")}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMedicationTaken(true)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                medicationTaken
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <Pill className="h-4 w-4" />
              {t("common.yes")}
            </button>
            <button
              type="button"
              onClick={() => setMedicationTaken(false)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                !medicationTaken
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <Pill className="h-4 w-4" />
              {t("common.no")}
            </button>
          </div>
        </div>

        <SideEffectsSelector
          value={sideEffects}
          onChange={setSideEffects}
          otherValue={sideEffectsOther}
          onOtherChange={setSideEffectsOther}
        />

        <div>
          <label htmlFor="challenges" className="mb-1.5 block text-sm font-medium text-card-foreground">
            {t("patient.checkin.challenges.label")}
          </label>
          <textarea
            id="challenges"
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
            placeholder={t("patient.checkin.challenges.placeholder")}
          />
        </div>

        <div>
          <label htmlFor="achievements" className="mb-1.5 block text-sm font-medium text-card-foreground">
            {t("patient.checkin.achievements.label")}
          </label>
          <textarea
            id="achievements"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
            placeholder={t("patient.checkin.achievements.placeholder")}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("patient.checkin.submit")}
        </button>
      </form>
    </div>
  )
}
