"use client"

import { useMemo, useState } from "react"
import { BookOpen, Check, Droplets, Flame, Footprints, Leaf, Moon, type LucideIcon } from "lucide-react"
import { useT } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

export type WellnessTask = {
  id: string
  icon: LucideIcon
  titleKey: string
  descriptionKey: string
}

// Kept as a flat array so new tasks (or psychiatrist-assigned/AI-recommended ones)
// can be appended without touching the render logic below.
const DEFAULT_TASKS: WellnessTask[] = [
  { id: "walk", icon: Footprints, titleKey: "patient.wellness.tasks.walk.title", descriptionKey: "patient.wellness.tasks.walk.description" },
  { id: "water", icon: Droplets, titleKey: "patient.wellness.tasks.water.title", descriptionKey: "patient.wellness.tasks.water.description" },
  { id: "mindfulness", icon: Leaf, titleKey: "patient.wellness.tasks.mindfulness.title", descriptionKey: "patient.wellness.tasks.mindfulness.description" },
  { id: "journal", icon: BookOpen, titleKey: "patient.wellness.tasks.journal.title", descriptionKey: "patient.wellness.tasks.journal.description" },
  { id: "sleep", icon: Moon, titleKey: "patient.wellness.tasks.sleep.title", descriptionKey: "patient.wellness.tasks.sleep.description" },
]

const CONFETTI_EMOJI = ["🎉", "✨", "🌿", "💧", "🎊", "⭐"]

export function DailyWellnessTasks({
  tasks = DEFAULT_TASKS,
  streakDays = 0,
  initialCompletedIds = [],
  onToggleTask,
}: {
  tasks?: WellnessTask[]
  streakDays?: number
  /** Lets a future server-backed version hydrate today's already-completed tasks. */
  initialCompletedIds?: string[]
  /** Hook for a future version to persist completion to the database. */
  onToggleTask?: (taskId: string, completed: boolean) => void
}) {
  const t = useT()

  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialCompletedIds.map((id) => [id, true]))
  )

  const completedCount = useMemo(
    () => tasks.filter((task) => completed[task.id]).length,
    [tasks, completed]
  )
  const total = tasks.length
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100)
  const allDone = total > 0 && completedCount === total

  function toggleTask(id: string) {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      onToggleTask?.(id, next[id])
      return next
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">{t("patient.wellness.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("patient.wellness.subtitle")}</p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          {streakDays > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("patient.wellness.streakDays", { count: streakDays })}</span>
            </div>
          )}
          <div className="text-end">
            <p className="text-xs font-medium text-muted-foreground">{t("patient.wellness.progressLabel")}</p>
            <p className="text-sm font-semibold text-card-foreground">
              {t("patient.wellness.progressCount", { completed: completedCount, total })}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tasks.map((task) => {
          const isDone = !!completed[task.id]
          const Icon = task.icon
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              aria-pressed={isDone}
              className={cn(
                "flex flex-col items-start gap-3 rounded-xl border border-border/70 bg-background/60 p-4 text-start transition-colors duration-300 hover:border-primary/40 hover:bg-background",
                isDone && "border-primary/20 bg-primary/5"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors duration-300",
                    isDone && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 transition-all duration-300",
                    isDone && "border-emerald-500 bg-emerald-500"
                  )}
                >
                  {isDone && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />}
                </span>
              </div>
              <div className={cn("transition-opacity duration-300", isDone && "opacity-60")}>
                <p
                  className={cn(
                    "text-sm font-medium text-card-foreground transition-all duration-300",
                    isDone && "line-through decoration-muted-foreground"
                  )}
                >
                  {t(task.titleKey)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(task.descriptionKey)}</p>
              </div>
            </button>
          )
        })}
      </div>

      {allDone && (
        <div className="relative mt-6 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 px-4 py-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <ConfettiBurst />
          <p className="text-sm font-semibold text-card-foreground">{t("patient.wellness.completion.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("patient.wellness.completion.subtitle")}</p>
        </div>
      )}
    </div>
  )
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
        left: `${(i * 137) % 100}%`,
        delay: `${(i % 7) * 0.08}s`,
      })),
    []
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti-fall text-sm"
          style={{ left: piece.left, animationDelay: piece.delay }}
        >
          {piece.emoji}
        </span>
      ))}
    </div>
  )
}
