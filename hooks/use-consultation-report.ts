"use client"

import { useCallback, useState } from "react"
import { toast } from "@/hooks/use-toast"
import type {
  ConsultationReport,
  ConsultationReportDraft,
  PatientInfo,
  PreviousReportSummary,
  RegenerableKey,
  ReportSections,
} from "@/lib/consultation-report/types"

export type ModalStep = "select-patient" | "generating" | "editing"

async function parseErrorMessage(res: Response): Promise<string | undefined> {
  try {
    const data = await res.json()
    return typeof data?.error === "string" ? data.error : undefined
  } catch {
    return undefined
  }
}

export function useConsultationReport() {
  const [step, setStep] = useState<ModalStep>("select-patient")
  const [draft, setDraft] = useState<ConsultationReportDraft | null>(null)
  const [previousReport, setPreviousReport] = useState<PreviousReportSummary | null>(null)
  const [savedReport, setSavedReport] = useState<ConsultationReport | null>(null)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState<RegenerableKey | null>(null)

  const generate = useCallback(async (patientId: number, consultationDate?: string) => {
    setStep("generating")
    try {
      const res = await fetch("/api/practitioner/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, consultationDate }),
      })
      if (!res.ok) throw new Error(await parseErrorMessage(res))
      const data = await res.json()
      setDraft(data.draft)
      setPreviousReport(data.previousReport ?? null)
      setSavedReport(null)
      setStep("editing")
    } catch (err) {
      toast({
        title: "Couldn't generate report",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      })
      setStep("select-patient")
    }
  }, [])

  const updateSection = useCallback((key: keyof ReportSections, value: string) => {
    setDraft((prev) => (prev ? { ...prev, sections: { ...prev.sections, [key]: value } } : prev))
  }, [])

  const updatePatientInfo = useCallback((patch: Partial<PatientInfo>) => {
    setDraft((prev) => (prev ? { ...prev, patientInfo: { ...prev.patientInfo, ...patch } } : prev))
  }, [])

  const updateRecommendations = useCallback((next: string[]) => {
    setDraft((prev) => (prev ? { ...prev, recommendations: next } : prev))
  }, [])

  const updateNextAppointment = useCallback((value: string | null) => {
    setDraft((prev) => (prev ? { ...prev, nextAppointment: value } : prev))
  }, [])

  const regenerateSection = useCallback(async (key: RegenerableKey) => {
    if (!draft) return
    setRegenerating(key)
    try {
      const res = await fetch("/api/practitioner/reports/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: draft.patientInfo.id,
          section: key,
          consultationDate: draft.patientInfo.consultationDate,
        }),
      })
      if (!res.ok) throw new Error(await parseErrorMessage(res))
      const data = await res.json()
      if (key === "recommendations") {
        updateRecommendations(data.recommendations)
      } else {
        updateSection(key, data.value)
      }
      toast({ title: "Section regenerated" })
    } catch (err) {
      toast({
        title: "Couldn't regenerate section",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      })
    } finally {
      setRegenerating(null)
    }
  }, [draft, updateRecommendations, updateSection])

  const save = useCallback(async (): Promise<boolean> => {
    if (!draft) return false
    setSaving(true)
    try {
      const isUpdate = Boolean(savedReport)
      const url = isUpdate ? `/api/practitioner/reports/${savedReport!.id}` : "/api/practitioner/reports"
      const method = isUpdate ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error(await parseErrorMessage(res))
      const data = await res.json()
      setSavedReport(data.report)
      toast({ title: "Report saved" })
      return true
    } catch (err) {
      toast({
        title: "Couldn't save report",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      })
      return false
    } finally {
      setSaving(false)
    }
  }, [draft, savedReport])

  const reset = useCallback(() => {
    setStep("select-patient")
    setDraft(null)
    setPreviousReport(null)
    setSavedReport(null)
    setRegenerating(null)
  }, [])

  return {
    step,
    setStep,
    draft,
    previousReport,
    savedReport,
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
  }
}
