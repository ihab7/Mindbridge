"use client"

import { IconChevronLeft, IconChevronRight, IconPill, IconMoon, IconWind, IconRoute, IconNotes } from "@tabler/icons-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"
import type { DayRecord, ProgressView } from "@/lib/wellbeing/progressModel"
import type { ProgressFormat } from "./format"

const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

function Section({ icon: Icon, title, children }: { icon: typeof IconPill; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-border/60 pt-4">
      <h4 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon size={15} stroke={1.75} aria-hidden />
        {title}
      </h4>
      {children}
    </section>
  )
}

function Score({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1 rounded-xl bg-muted/60 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums text-card-foreground">
        {value}
        <span className="ms-1 text-sm font-normal text-muted-foreground">/ 10</span>
      </p>
      <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-background" aria-hidden>
        <span className="block h-full rounded-full" style={{ width: `${value * 10}%`, backgroundColor: color }} />
      </span>
    </div>
  )
}

/** A day without a check-in: a neutral dash in a dashed frame, never an empty (= zero) bar. */
function NoEntry({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex-1 rounded-xl border border-dashed border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-muted-foreground" aria-hidden>
        —
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

export function DayDetailDrawer({
  view,
  date,
  onDateChange,
  fmt,
}: {
  view: ProgressView
  date: string | null
  onDateChange: (date: string | null) => void
  fmt: ProgressFormat
}) {
  const t = useT()
  const { locale } = useI18n()
  const isMobile = useIsMobile()
  const rtl = locale === "ar"
  const index = date ? view.days.findIndex((d) => d.date === date) : -1
  const day: DayRecord | null = index >= 0 ? view.days[index] : null
  const reading = day ? view.readings[day.date] : null
  const e = day?.entry ?? null
  const PrevIcon = rtl ? IconChevronRight : IconChevronLeft
  const NextIcon = rtl ? IconChevronLeft : IconChevronRight

  const sideEffect = (k: string) => (k === "other" ? null : t(`report.narrative.sideEffect.${k}`))
  const breathingTitle = (type: string) => {
    const key = `mindfulness.exercises.${toCamel(type)}`
    const label = t(key)
    return label === key ? t("practitioner.progress.detail.breathingGeneric") : label
  }

  return (
    <Sheet open={day != null} onOpenChange={(open) => { if (!open) onDateChange(null) }}>
      <SheetContent
        side={isMobile ? "bottom" : rtl ? "left" : "right"}
        className={cn(
          // mb-progress: the sheet renders in a portal, outside the section that defines the colour tokens.
          "mb-progress flex flex-col gap-0 overflow-y-auto p-0",
          isMobile ? "max-h-[88dvh] rounded-t-2xl" : "w-full sm:max-w-md",
        )}
      >
        {day && (
          <>
            <SheetHeader className="gap-1 space-y-0 px-6 pb-4 pt-6 text-start sm:text-start">
              <SheetTitle className="pe-8 text-lg capitalize">{fmt.longDay(day.date)}</SheetTitle>
              <SheetDescription>
                {e
                  ? e.checkInTime
                    ? t("practitioner.progress.detail.checkedInAt", { time: e.checkInTime })
                    : t("practitioner.progress.detail.checkedIn")
                  : t("practitioner.progress.detail.noCheckIn")}
              </SheetDescription>
              {reading && reading.flags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {reading.flags.map((f) => (
                    <span key={f} className="rounded-full border border-[hsl(var(--progress-attention)/0.35)] px-2 py-0.5 text-xs text-[hsl(var(--progress-attention))]">
                      {t(`practitioner.progress.flag.${f}`)}
                    </span>
                  ))}
                </div>
              )}
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 px-6 pb-6">
              {e ? (
                <div className="flex gap-3">
                  <Score label={t("practitioner.progress.metric.mood")} value={e.mood} color="hsl(var(--progress-mood))" />
                  <Score label={t("practitioner.progress.metric.anxiety")} value={e.anxiety} color="hsl(var(--progress-anxiety))" />
                </div>
              ) : (
                <div className="flex gap-3">
                  <NoEntry label={t("practitioner.progress.metric.mood")} note={t("practitioner.progress.legend.noCheckIn")} />
                  <NoEntry label={t("practitioner.progress.metric.anxiety")} note={t("practitioner.progress.legend.noCheckIn")} />
                </div>
              )}

              {e && (
                <Section icon={IconPill} title={t("practitioner.progress.detail.treatment")}>
                  <p className={cn("text-sm font-medium", e.medicationTaken ? "text-primary" : "text-[hsl(var(--progress-attention))]")}>
                    {t(e.medicationTaken ? "practitioner.progress.dose.taken" : "practitioner.progress.dose.missed")}
                  </p>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("practitioner.progress.detail.sideEffects")}</p>
                    {e.sideEffects.length === 0 && !e.sideEffectsOther ? (
                      <p className="text-sm text-card-foreground">{t("practitioner.progress.detail.sideEffectsNone")}</p>
                    ) : (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {e.sideEffects.map((k) => {
                          const label = sideEffect(k)
                          return label ? (
                            <span key={k} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-card-foreground">{label}</span>
                          ) : null
                        })}
                        {e.sideEffectsOther && (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-card-foreground">
                            {t("practitioner.progress.detail.sideEffectOther", { text: e.sideEffectsOther })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {e && e.sleepHours != null && (
                <Section icon={IconMoon} title={t("practitioner.progress.detail.sleep")}>
                  <p className="text-sm text-card-foreground">{t("practitioner.progress.detail.sleepHours", { value: fmt.score(e.sleepHours) })}</p>
                </Section>
              )}

              {e && (e.challenges || e.achievements) && (
                <Section icon={IconNotes} title={t("practitioner.progress.detail.notes")}>
                  {e.challenges && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("patient.checkin.challenges.label")}</p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-card-foreground">{e.challenges}</p>
                    </div>
                  )}
                  {e.achievements && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("patient.checkin.achievements.label")}</p>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-card-foreground">{e.achievements}</p>
                    </div>
                  )}
                </Section>
              )}

              <Section icon={IconWind} title={t("practitioner.progress.detail.activities")}>
                {day.breathing.length === 0 && day.program.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("practitioner.progress.detail.noActivity")}</p>
                ) : (
                  <ul className="flex flex-col gap-1.5 text-sm text-card-foreground">
                    {day.breathing.map((b, i) => (
                      <li key={`b${i}`} className="flex items-center gap-2">
                        <IconWind size={15} stroke={1.75} className="text-muted-foreground" aria-hidden />
                        {t("practitioner.progress.detail.breathing", {
                          title: breathingTitle(b.exerciseType),
                          minutes: fmt.int(Math.max(1, Math.round(b.durationSeconds / 60))),
                        })}
                      </li>
                    ))}
                    {day.program.map((p, i) => (
                      <li key={`p${i}`} className="flex items-start gap-2">
                        <IconRoute size={15} stroke={1.75} className="mt-0.5 text-muted-foreground" aria-hidden />
                        <span>
                          {p.title
                            ? t("practitioner.progress.detail.program", { title: p.title })
                            : t("practitioner.progress.detail.programGeneric")}
                          {p.moodBefore != null && p.moodAfter != null && (
                            <span className="block text-xs text-muted-foreground">
                              {t("practitioner.progress.detail.programMood", { before: p.moodBefore, after: p.moodAfter })}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-border bg-background px-6 py-3">
              <button
                type="button"
                disabled={index <= 0}
                onClick={() => onDateChange(view.days[index - 1].date)}
                className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-medium text-card-foreground outline-none ring-ring hover:bg-muted focus-visible:ring-2 disabled:opacity-40"
              >
                <PrevIcon size={16} stroke={2} aria-hidden />
                {t("practitioner.progress.detail.previous")}
              </button>
              <button
                type="button"
                disabled={index >= view.days.length - 1}
                onClick={() => onDateChange(view.days[index + 1].date)}
                className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-medium text-card-foreground outline-none ring-ring hover:bg-muted focus-visible:ring-2 disabled:opacity-40"
              >
                {t("practitioner.progress.detail.next")}
                <NextIcon size={16} stroke={2} aria-hidden />
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
