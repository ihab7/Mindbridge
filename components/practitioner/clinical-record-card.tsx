"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useT } from "@/components/i18n-provider"
import { toast } from "@/hooks/use-toast"

type Diagnosis = { diagnosis_code: string | null; diagnosis_label: string | null; diagnosis_updated_at: string | null }
type Treatment = {
  id: number
  medication_name: string
  dosage: string | null
  frequency: string | null
  start_date: string | null
  status: "active" | "stopped"
}

export function ClinicalRecordCard({ patientId }: { patientId: number }) {
  const t = useT()

  const [loading, setLoading] = useState(true)
  const [savingDiagnosis, setSavingDiagnosis] = useState(false)
  const [diagnosisCode, setDiagnosisCode] = useState("")
  const [diagnosisLabel, setDiagnosisLabel] = useState("")
  const [diagnosisUpdatedAt, setDiagnosisUpdatedAt] = useState<string | null>(null)

  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [addingTreatment, setAddingTreatment] = useState(false)
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("")
  const [startDate, setStartDate] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [diagRes, treatRes] = await Promise.all([
          fetch(`/api/practitioner/patients/${patientId}/diagnosis`),
          fetch(`/api/practitioner/patients/${patientId}/treatments`),
        ])
        const diagData = (await diagRes.json()) as { diagnosis: Diagnosis | null }
        const treatData = (await treatRes.json()) as { treatments: Treatment[] }
        if (!cancelled) {
          setDiagnosisCode(diagData.diagnosis?.diagnosis_code ?? "")
          setDiagnosisLabel(diagData.diagnosis?.diagnosis_label ?? "")
          setDiagnosisUpdatedAt(diagData.diagnosis?.diagnosis_updated_at ?? null)
          setTreatments(treatData.treatments ?? [])
        }
      } catch {
        /* leave form blank on failure */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [patientId])

  async function saveDiagnosis() {
    setSavingDiagnosis(true)
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/diagnosis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosisCode: diagnosisCode.trim(), diagnosisLabel: diagnosisLabel.trim() }),
      })
      if (!res.ok) throw new Error("failed")
      const data = (await res.json()) as { diagnosis: Diagnosis }
      setDiagnosisUpdatedAt(data.diagnosis?.diagnosis_updated_at ?? new Date().toISOString())
      toast({ title: t("common.saved") })
    } catch {
      toast({ title: t("practitioner.clinicalRecord.errors.diagnosisSaveFailed") })
    } finally {
      setSavingDiagnosis(false)
    }
  }

  async function addTreatment() {
    const name = medicationName.trim()
    if (!name) {
      toast({ title: t("practitioner.clinicalRecord.errors.medicationRequired") })
      return
    }
    setAddingTreatment(true)
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/treatments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationName: name,
          dosage: dosage.trim() || undefined,
          frequency: frequency.trim() || undefined,
          startDate: startDate || undefined,
        }),
      })
      if (!res.ok) throw new Error("failed")
      const data = (await res.json()) as { treatment: Treatment }
      setTreatments((prev) => [data.treatment, ...prev])
      setMedicationName("")
      setDosage("")
      setFrequency("")
      setStartDate("")
      toast({ title: t("common.saved") })
    } catch {
      toast({ title: t("practitioner.clinicalRecord.errors.treatmentSaveFailed") })
    } finally {
      setAddingTreatment(false)
    }
  }

  async function stopTreatment(id: number) {
    try {
      const res = await fetch(`/api/practitioner/patients/${patientId}/treatments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "stopped" }),
      })
      if (!res.ok) throw new Error("failed")
      const data = (await res.json()) as { treatment: Treatment }
      setTreatments((prev) => prev.map((tr) => (tr.id === id ? data.treatment : tr)))
    } catch {
      toast({ title: t("practitioner.clinicalRecord.errors.treatmentSaveFailed") })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("practitioner.clinicalRecord.title")}</CardTitle>
        <CardDescription className="text-sm">{t("practitioner.clinicalRecord.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Diagnosis */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-card-foreground">{t("practitioner.clinicalRecord.diagnosisTitle")}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="diagnosis-code">{t("practitioner.clinicalRecord.diagnosisCode")}</Label>
              <Input
                id="diagnosis-code"
                value={diagnosisCode}
                onChange={(e) => setDiagnosisCode(e.target.value.slice(0, 50))}
                placeholder={t("practitioner.clinicalRecord.diagnosisCodePlaceholder")}
                disabled={loading || savingDiagnosis}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diagnosis-label">{t("practitioner.clinicalRecord.diagnosisLabel")}</Label>
              <Input
                id="diagnosis-label"
                value={diagnosisLabel}
                onChange={(e) => setDiagnosisLabel(e.target.value.slice(0, 200))}
                placeholder={t("practitioner.clinicalRecord.diagnosisLabelPlaceholder")}
                disabled={loading || savingDiagnosis}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {diagnosisUpdatedAt
                ? t("practitioner.clinicalRecord.diagnosisUpdatedAt", {
                    date: new Date(diagnosisUpdatedAt).toLocaleDateString(),
                  })
                : t("practitioner.clinicalRecord.diagnosisNeverSet")}
            </p>
            <Button type="button" size="sm" onClick={saveDiagnosis} disabled={loading || savingDiagnosis}>
              {savingDiagnosis ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </div>

        {/* Treatments */}
        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="text-sm font-medium text-card-foreground">{t("practitioner.clinicalRecord.treatmentsTitle")}</h3>

          {treatments.length > 0 && (
            <ul className="space-y-2">
              {treatments.map((tr) => (
                <li
                  key={tr.id}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[13px] ${
                    tr.status === "active" ? "border-border" : "border-border/60 text-muted-foreground"
                  }`}
                >
                  <div>
                    <span className="font-medium">{tr.medication_name}</span>
                    {(tr.dosage || tr.frequency) && (
                      <span className="text-muted-foreground"> — {[tr.dosage, tr.frequency].filter(Boolean).join(", ")}</span>
                    )}
                    {tr.status === "stopped" && (
                      <span className="ms-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {t("practitioner.clinicalRecord.stopped")}
                      </span>
                    )}
                  </div>
                  {tr.status === "active" && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => stopTreatment(tr.id)}>
                      {t("practitioner.clinicalRecord.stop")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <Input
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value.slice(0, 200))}
              placeholder={t("practitioner.clinicalRecord.medicationPlaceholder")}
              disabled={addingTreatment}
            />
            <Input
              value={dosage}
              onChange={(e) => setDosage(e.target.value.slice(0, 100))}
              placeholder={t("practitioner.clinicalRecord.dosagePlaceholder")}
              disabled={addingTreatment}
            />
            <Input
              value={frequency}
              onChange={(e) => setFrequency(e.target.value.slice(0, 100))}
              placeholder={t("practitioner.clinicalRecord.frequencyPlaceholder")}
              disabled={addingTreatment}
            />
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={addingTreatment} />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addTreatment} disabled={addingTreatment}>
            {addingTreatment ? t("common.saving") : t("practitioner.clinicalRecord.addTreatment")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
