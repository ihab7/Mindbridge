"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useConsultationReport } from "@/hooks/use-consultation-report"
import { PatientSelector } from "./patient-selector"
import { ReportForm } from "./report-form"
import { ReportActionsBar } from "./report-actions-bar"

export function ReportModal({
  open,
  onOpenChange,
  patientId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId?: number
}) {
  const {
    step,
    draft,
    previousReport,
    saving,
    regenerating,
    generate,
    updateSection,
    updatePatientInfo,
    updateRecommendations,
    updateNextAppointment,
    regenerateSection,
    save,
    reset,
  } = useConsultationReport()

  const [practitionerName, setPractitionerName] = useState("")
  const hasAutoStarted = useRef(false)

  useEffect(() => {
    if (!open) return
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPractitionerName(data?.user?.name ?? ""))
      .catch(() => setPractitionerName(""))
  }, [open])

  useEffect(() => {
    if (open && patientId && !hasAutoStarted.current) {
      hasAutoStarted.current = true
      void generate(patientId)
    }
    if (!open) {
      hasAutoStarted.current = false
      reset()
    }
  }, [open, patientId, generate, reset])

  async function handleSave() {
    const success = await save()
    if (success) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Consultation Report</DialogTitle>
          <DialogDescription>
            {step === "select-patient" && "Select a patient to generate a report for."}
            {step === "generating" && "Analyzing patient data..."}
            {step === "editing" && "Review and edit every section before saving."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "select-patient" && (
            <PatientSelector onSelect={(id) => void generate(id)} />
          )}

          {step === "generating" && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {step === "editing" && draft && (
            <ReportForm
              draft={draft}
              previousReport={previousReport}
              regenerating={regenerating}
              onUpdateSection={updateSection}
              onUpdatePatientInfo={updatePatientInfo}
              onUpdateRecommendations={updateRecommendations}
              onUpdateNextAppointment={updateNextAppointment}
              onRegenerateSection={regenerateSection}
            />
          )}
        </div>

        {step === "editing" && draft && (
          <div className="px-6 py-4">
            <ReportActionsBar
              draft={draft}
              practitionerName={practitionerName}
              saving={saving}
              onSave={handleSave}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
