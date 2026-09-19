"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { IconCircleCheck, IconPencil, IconLoader2, IconPill } from "@tabler/icons-react"
import { SideEffectsSelector } from "@/components/patient/side-effects-selector"
import { useI18n, useT } from "@/components/i18n-provider"
import { directionForLocale, isLocale } from "@/i18n/routing"
import { CollapsibleSound } from "@/components/CollapsibleSound"

export type TodayEntry = {
  mood: number
  anxiety: number
  sleepHours: string
  medicationTaken: boolean
  sideEffects: string[]
  sideEffectsOther: string
  challenges: string
  achievements: string
}

// Presentation layer only: these five buttons write one of 2/4/6/8/10 into
// the untouched 1-10 column. Mood and anxiety get their own wording rather
// than a shared icon set read in opposite directions — in both rows more
// dots simply means a higher value, and the word says whether that is good
// or bad, which is exactly what the faces could not do.
type Step = { value: number; intensity: number; labelKey: string }

const MOOD_STEPS: Step[] = [
  { value: 2, intensity: 1, labelKey: "patient.checkin.mood.veryLow" },
  { value: 4, intensity: 2, labelKey: "patient.checkin.mood.low" },
  { value: 6, intensity: 3, labelKey: "patient.checkin.mood.ok" },
  { value: 8, intensity: 4, labelKey: "patient.checkin.mood.good" },
  { value: 10, intensity: 5, labelKey: "patient.checkin.mood.veryGood" },
]

const ANXIETY_STEPS: Step[] = [
  { value: 2, intensity: 1, labelKey: "patient.checkin.anxiety.calm" },
  { value: 4, intensity: 2, labelKey: "patient.checkin.anxiety.mild" },
  { value: 6, intensity: 3, labelKey: "patient.checkin.anxiety.moderate" },
  { value: 8, intensity: 4, labelKey: "patient.checkin.anxiety.strong" },
  { value: 10, intensity: 5, labelKey: "patient.checkin.anxiety.veryStrong" },
]

/**
 * Snap a stored 1-10 value onto the five buttons. Historical rows predate
 * this scale and can hold any integer, including the old default of 5.
 * Math.round sends exact midpoints upward, so 5 selects "Correcte" (6) and
 * 3 selects "Basse" (4) — deliberate: rounding an ambiguous mood up rather
 * than down avoids re-reading a patient's past day as worse than recorded.
 */
function snapToStep(value: number): number {
  return Math.min(10, Math.max(2, Math.round(value / 2) * 2))
}

function IntensityDots({ intensity, selected }: { intensity: number; selected: boolean }) {
  return (
    <span className="flex gap-[2px]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={`h-[5px] w-[5px] rounded-full ${
            dot <= intensity
              ? selected
                ? "bg-primary"
                : "bg-muted-foreground"
              : "bg-border"
          }`}
        />
      ))}
    </span>
  )
}

function ScaleRow({
  steps,
  selected,
  onSelect,
  groupLabel,
  rtl,
}: {
  steps: Step[]
  selected: number | null
  onSelect: (value: number) => void
  groupLabel: string
  rtl: boolean
}) {
  const t = useT()
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Arrows move focus only; Space/Enter activate (native button behaviour).
  // In RTL the visual right-hand neighbour is the previous item in DOM order,
  // so the step is flipped to keep the arrows pointing where they look.
  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const forward = rtl ? e.key === "ArrowLeft" : e.key === "ArrowRight"
    const next = (index + (forward ? 1 : -1) + steps.length) % steps.length
    buttonRefs.current[next]?.focus()
  }

  // Roving tabindex: one stop per row, so Tab moves between the two scales
  // rather than through ten buttons.
  const tabStopIndex = Math.max(
    0,
    steps.findIndex((s) => s.value === selected),
  )

  return (
    <div role="group" aria-label={groupLabel} className="flex gap-1.5">
      {steps.map((step, index) => {
        const isSelected = selected === step.value
        const word = t(step.labelKey)
        return (
          <button
            key={step.value}
            ref={(el) => {
              buttonRefs.current[index] = el
            }}
            type="button"
            onClick={() => onSelect(step.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-pressed={isSelected}
            aria-label={`${groupLabel} : ${word}`}
            tabIndex={index === tabStopIndex ? 0 : -1}
            className={`flex h-[62px] flex-1 flex-col items-center justify-center gap-[5px] rounded-lg border p-1 transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] active:duration-100 ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border bg-transparent hover:border-muted-foreground/40"
            }`}
          >
            <IntensityDots intensity={step.intensity} selected={isSelected} />
            {/* 10px under sm so the longest words ("Très bonne", "Très forte")
                stay on one line at 360px; 11px from sm up. */}
            <span
              className={`whitespace-nowrap text-[10px] leading-none sm:text-[11px] ${
                isSelected ? "font-medium text-primary" : "text-muted-foreground"
              }`}
            >
              {word}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function JournalForm({ todayEntry = null }: { todayEntry?: TodayEntry | null }) {
  const router = useRouter()
  const t = useT()
  const { locale } = useI18n()
  const rtl = directionForLocale(isLocale(locale) ? locale : "fr") === "rtl"

  const [mode, setMode] = useState<"compact" | "form">(todayEntry ? "compact" : "form")
  const [savedSummary, setSavedSummary] = useState<{ mood: number; sleepHours: string } | null>(
    todayEntry ? { mood: todayEntry.mood, sleepHours: todayEntry.sleepHours } : null,
  )

  const [mood, setMood] = useState<number | null>(todayEntry ? snapToStep(todayEntry.mood) : null)
  const [anxiety, setAnxiety] = useState<number | null>(todayEntry ? snapToStep(todayEntry.anxiety) : null)
  const [sleepHours, setSleepHours] = useState(todayEntry?.sleepHours ?? "7")
  const [medicationTaken, setMedicationTaken] = useState(todayEntry?.medicationTaken ?? true)
  const [sideEffects, setSideEffects] = useState<string[]>(todayEntry?.sideEffects.length ? todayEntry.sideEffects : ["none"])
  const [sideEffectsOther, setSideEffectsOther] = useState(todayEntry?.sideEffectsOther ?? "")
  const [challenges, setChallenges] = useState(todayEntry?.challenges ?? "")
  const [achievements, setAchievements] = useState(todayEntry?.achievements ?? "")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsSelectionHint, setNeedsSelectionHint] = useState(false)

  function openForm() {
    setMode("form")
  }

  function selectMood(value: number) {
    setMood(value)
    setNeedsSelectionHint(false)
  }

  function selectAnxiety(value: number) {
    setAnxiety(value)
    setNeedsSelectionHint(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Buttons stay visually "disabled" but still receive the click so this
    // branch can explain why, instead of a native disabled attribute that
    // would just swallow the tap silently.
    if (mood == null || anxiety == null) {
      setNeedsSelectionHint(true)
      return
    }

    setLoading(true)
    setError(null)

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

      setSavedSummary({ mood, sleepHours })
      setMode("compact")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : t("patient.checkin.errors.failedToSubmitTryAgain")
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (mode === "compact" && savedSummary) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={openForm}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openForm()
          }
        }}
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
      >
        <IconCircleCheck size={22} stroke={1.75} className="shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-card-foreground">{t("patient.checkin.savedTitle")}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {t("patient.checkin.savedSummary", { mood: savedSummary.mood, sleep: savedSummary.sleepHours })}
          </p>
        </div>
        <IconPencil size={18} stroke={1.75} className="shrink-0 text-muted-foreground" aria-hidden />
      </div>
    )
  }

  return (
    <div className="mb-card rounded-xl border border-border bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-card-foreground">{t("patient.checkin.title")}</h2>
      <p className="mb-5 text-sm text-muted-foreground">{t("patient.checkin.subtitle")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-medium text-card-foreground">{t("patient.checkin.moodLabel")}</p>
          <ScaleRow
            steps={MOOD_STEPS}
            selected={mood}
            onSelect={selectMood}
            groupLabel={t("patient.checkin.moodLabel")}
            rtl={rtl}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-card-foreground">{t("patient.checkin.anxietyLabel")}</p>
          <ScaleRow
            steps={ANXIETY_STEPS}
            selected={anxiety}
            onSelect={selectAnxiety}
            groupLabel={t("patient.checkin.anxietyLabel")}
            rtl={rtl}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="sleep" className="mb-1.5 block text-sm font-medium text-card-foreground">
              {t("patient.checkin.sleepHours.label")}
            </label>
            <input
              id="sleep"
              type="number"
              min="0"
              max="16"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              {t("patient.checkin.medicationTaken.label")}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMedicationTaken(true)}
                aria-pressed={medicationTaken}
                className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  medicationTaken
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <IconPill size={16} stroke={1.75} aria-hidden />
                {t("patient.checkin.medication.taken")}
              </button>
              <button
                type="button"
                onClick={() => setMedicationTaken(false)}
                aria-pressed={!medicationTaken}
                className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  !medicationTaken
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {t("common.no")}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <CollapsibleSound />
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

        {needsSelectionHint && (
          <p className="text-xs text-destructive">{t("patient.checkin.selectBoth")}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex h-[42px] items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? <IconLoader2 size={18} className="animate-spin" aria-hidden /> : t("patient.checkin.submit")}
        </button>
      </form>
    </div>
  )
}
