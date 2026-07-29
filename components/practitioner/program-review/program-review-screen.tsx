"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { useI18n, useT } from "@/components/i18n-provider"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProgramProposal } from "./use-program-proposal"
import { PatientSignalStrip } from "./patient-signal-strip"
import { ProposedWeekBlock } from "./proposed-week-block"
import { SkippedPanel } from "./skipped-panel"
import { LibraryPicker } from "./library-picker"

const NOTE_MAX_LEN = 200

export function ProgramReviewScreen({
  patientId,
  patientName,
  mode,
  completedSessionsCount,
}: {
  patientId: number
  patientName: string
  mode: "draft" | "revise"
  completedSessionsCount: number
}) {
  const { locale } = useI18n()
  const t = useT()
  const router = useRouter()
  const proposal = useProgramProposal(patientId, { initialRevise: mode === "revise" })
  const [confirmRedraftOpen, setConfirmRedraftOpen] = useState(false)
  const [minSessionsError, setMinSessionsError] = useState(false)
  const [usingDefault, setUsingDefault] = useState(false)

  const { load } = proposal

  async function handleApprove() {
    setMinSessionsError(false)
    if (!proposal.canApprove) {
      setMinSessionsError(true)
      return
    }
    const result = await proposal.approve(proposal.draftNote)
    if (result.ok) {
      toast({
        title: t("practitioner.review.assigned"),
        description: t("practitioner.review.assignedDetail", { sessions: result.sessionCount ?? 0, weeks: result.weekCount ?? 0 }),
      })
      router.push(`/practitioner/patients/${patientId}`)
    } else {
      toast({ title: t("program.error.saveFailedTitle"), description: t("program.error.saveFailedDescription") })
    }
  }

  async function handleUseDefault() {
    setUsingDefault(true)
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/program`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "" }),
      })
      if (!res.ok) throw new Error("failed")
      router.push(`/practitioner/patients/${patientId}`)
    } catch {
      toast({ title: t("program.error.saveFailedTitle"), description: t("program.error.saveFailedDescription") })
    } finally {
      setUsingDefault(false)
    }
  }

  if (load.status === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("practitioner.review.loadingDigest")}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (load.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">{t("practitioner.review.errorTitle")}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void proposal.redraft()}>
            {t("practitioner.review.tryAgain")}
          </Button>
          <Button type="button" onClick={() => void handleUseDefault()} disabled={usingDefault}>
            {usingDefault && <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />}
            {t("practitioner.review.useDefault")}
          </Button>
        </div>
      </div>
    )
  }

  const sourceLabel =
    load.source === "ai" ? t("practitioner.review.aiDraft") : load.source === "rules" ? t("practitioner.review.rulesDraft") : null

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t("practitioner.review.title", { name: patientName })}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("practitioner.review.subtitle")}</p>
        {sourceLabel && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {sourceLabel}
          </span>
        )}
      </div>

      {mode === "revise" && completedSessionsCount > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {t("practitioner.review.reviseWarning", { count: completedSessionsCount })}
        </div>
      )}

      {load.thinData && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {t("practitioner.review.thinData", { days: load.digest.journal.entryCount })}
        </div>
      )}

      <PatientSignalStrip digest={load.digest} />

      <div className="flex flex-col gap-3">
        {proposal.weeks.map((week) => (
          <ProposedWeekBlock
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            sessions={week.sessions}
            locale={locale}
            lastGlobalIndex={proposal.lastGlobalIndex}
            onRemove={proposal.remove}
            onRestore={proposal.restore}
            onMoveUp={proposal.moveUp}
            onMoveDown={proposal.moveDown}
          />
        ))}
      </div>

      <SkippedPanel skipped={proposal.skipped} locale={locale} onAddAnyway={proposal.addFromSkipped} />

      <LibraryPicker sessions={proposal.libraryRemaining} locale={locale} onAdd={proposal.addFromLibrary} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("practitioner.review.noteLabel")}</label>
        <Textarea
          value={proposal.draftNote}
          maxLength={NOTE_MAX_LEN}
          onChange={(e) => proposal.setDraftNote(e.target.value)}
          className="min-h-[90px]"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {proposal.draftNote.length}/{NOTE_MAX_LEN}
        </p>
      </div>

      {minSessionsError && (
        <p role="alert" className="text-sm text-destructive">
          {t("practitioner.review.minSessions")}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {t("practitioner.review.summary", { sessions: proposal.sessionCount, weeks: proposal.weekCount, perWeek: proposal.perWeek })}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmRedraftOpen(true)} disabled={proposal.approving}>
              {t("practitioner.review.redraft")}
            </Button>
            <Button type="button" onClick={() => void handleApprove()} disabled={proposal.approving}>
              {proposal.approving && <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />}
              {t("practitioner.review.approve")}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmRedraftOpen} onOpenChange={setConfirmRedraftOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("practitioner.review.redraftConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("practitioner.review.redraftConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmRedraftOpen(false)
                void proposal.redraft()
              }}
            >
              {t("practitioner.review.redraft")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
