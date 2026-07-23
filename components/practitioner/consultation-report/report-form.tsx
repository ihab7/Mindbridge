"use client"

import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ReportSectionCard } from "./report-section-card"
import type {
  ConsultationReportDraft,
  PatientInfo,
  PreviousReportSummary,
  RegenerableKey,
  ReportSections,
} from "@/lib/consultation-report/types"

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Unknown date"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "Unknown date"
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

const SECTION_TITLES: Record<keyof ReportSections, string> = {
  moodSummary: "Mood Summary",
  medicationSummary: "Medication Adherence",
  sleepSummary: "Sleep Analysis",
  mindfulnessSummary: "Mindfulness & Breathing",
  journalSummary: "Journal Analysis",
  sideEffectsSummary: "Side Effects",
  overallProgress: "Overall Progress",
}

const SECTION_ORDER: (keyof ReportSections)[] = [
  "moodSummary",
  "medicationSummary",
  "sleepSummary",
  "mindfulnessSummary",
  "journalSummary",
  "sideEffectsSummary",
  "overallProgress",
]

export function ReportForm({
  draft,
  previousReport,
  regenerating,
  onUpdateSection,
  onUpdatePatientInfo,
  onUpdateRecommendations,
  onUpdateNextAppointment,
  onRegenerateSection,
}: {
  draft: ConsultationReportDraft
  previousReport: PreviousReportSummary | null
  regenerating: RegenerableKey | null
  onUpdateSection: (key: keyof ReportSections, value: string) => void
  onUpdatePatientInfo: (patch: Partial<PatientInfo>) => void
  onUpdateRecommendations: (next: string[]) => void
  onUpdateNextAppointment: (value: string | null) => void
  onRegenerateSection: (key: RegenerableKey) => void
}) {
  const { patientInfo, sections, recommendations, nextAppointment } = draft

  function updateRecommendation(index: number, value: string) {
    const next = [...recommendations]
    next[index] = value
    onUpdateRecommendations(next)
  }

  function removeRecommendation(index: number) {
    onUpdateRecommendations(recommendations.filter((_, i) => i !== index))
  }

  function addRecommendation() {
    onUpdateRecommendations([...recommendations, ""])
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-border bg-background p-4">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Patient Information</h4>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name</label>
            <Input value={patientInfo.name} disabled className="bg-muted" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Age</label>
            <Input
              type="number"
              min={1}
              max={149}
              value={patientInfo.age ?? ""}
              placeholder="—"
              onChange={(e) => onUpdatePatientInfo({ age: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Gender</label>
            <Input
              value={patientInfo.gender ?? ""}
              placeholder="—"
              onChange={(e) => onUpdatePatientInfo({ gender: e.target.value || null })}
            />
          </div>
          <div className="sm:col-span-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Consultation Date</label>
            <Input
              type="date"
              value={toDateInputValue(patientInfo.consultationDate)}
              onChange={(e) =>
                onUpdatePatientInfo({
                  consultationDate: e.target.value ? new Date(`${e.target.value}T00:00:00`).toISOString() : patientInfo.consultationDate,
                })
              }
              className="max-w-xs"
            />
          </div>
        </div>
      </div>

      {previousReport && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">Previous consultation — {formatDate(previousReport.consultationDate)}</p>
          <p className="mt-1 text-muted-foreground">{previousReport.overallProgress}</p>
        </div>
      )}

      {SECTION_ORDER.map((key) => (
        <ReportSectionCard
          key={key}
          title={SECTION_TITLES[key]}
          value={sections[key]}
          onChange={(value) => onUpdateSection(key, value)}
          onRegenerate={() => onRegenerateSection(key)}
          regenerating={regenerating === key}
          rows={key === "overallProgress" ? 2 : 3}
        />
      ))}

      <div className="rounded-lg border border-border bg-background p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">Recommendations</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRegenerateSection("recommendations")}
            disabled={regenerating === "recommendations"}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Regenerate
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={rec} onChange={(e) => updateRecommendation(i, e.target.value)} className="text-sm" />
              <button
                type="button"
                onClick={() => removeRecommendation(i)}
                aria-label="Remove recommendation"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRecommendation}
            className="mt-1 w-fit gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add recommendation
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-4">
        <label className="mb-1 block text-sm font-semibold text-foreground">Next Appointment</label>
        <Input
          type="date"
          value={toDateInputValue(nextAppointment)}
          onChange={(e) =>
            onUpdateNextAppointment(e.target.value ? new Date(`${e.target.value}T00:00:00`).toISOString() : null)
          }
          className="max-w-xs"
        />
      </div>
    </div>
  )
}
