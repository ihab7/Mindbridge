"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IconFileText } from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useT } from "@/components/i18n-provider"

type PeriodKind = "last14" | "last30" | "sinceLast" | "custom"
type ReportFormat = "clinical" | "narrative"
type ComparisonMode = "previousPeriod" | "inclusion"
type RiskLevel = "none" | "watch" | "significant"

const HINT_KEY = "mb_report_profile_hint_dismissed"
const formatStorageKey = (practitionerId: number) => `mb_report_format_${practitionerId}`

export function GenerateReportDialog({
  patientId,
  hasProfile,
  practitionerId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger = true,
}: {
  patientId: number
  hasProfile: boolean
  practitionerId: number
  /** Controlled mode for the dashboard fast path: parent owns open state and
   *  there's no built-in trigger button (the patient row itself opens it). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: boolean
}) {
  const t = useT()
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen

  const [format, setFormat] = useState<ReportFormat>("clinical")
  const [kind, setKind] = useState<PeriodKind>("last14")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [observations, setObservations] = useState("")
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("previousPeriod")
  // Risk level starts unselected on every open — never pre-filled from the
  // wellbeing panel's danger-tone flags, even when they're firing for this
  // patient. It's the practitioner's own judgment, made fresh each time.
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null)
  const [riskDetail, setRiskDetail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProfileHint, setShowProfileHint] = useState(false)

  // Load the practitioner's last-used format default each time the dialog opens.
  useEffect(() => {
    if (!open) return
    try {
      const saved = window.localStorage.getItem(formatStorageKey(practitionerId))
      if (saved === "clinical" || saved === "narrative") setFormat(saved)
    } catch {
      /* ignore */
    }
  }, [open, practitionerId])

  useEffect(() => {
    if (!open) return
    let dismissed = false
    try {
      dismissed = window.localStorage.getItem(HINT_KEY) === "true"
    } catch {
      /* ignore */
    }
    setShowProfileHint(!hasProfile && !dismissed)
  }, [open, hasProfile])

  // Risk assessment is a fresh judgment every time — never remembered or
  // pre-filled, so it's reset to unselected on every open.
  useEffect(() => {
    if (!open) return
    setRiskLevel(null)
    setRiskDetail("")
    setComparisonMode("previousPeriod")
  }, [open])

  function selectFormat(next: ReportFormat) {
    setFormat(next)
    try {
      window.localStorage.setItem(formatStorageKey(practitionerId), next)
    } catch {
      /* ignore */
    }
  }

  function dismissHint() {
    try {
      window.localStorage.setItem(HINT_KEY, "true")
    } catch {
      /* ignore */
    }
    setShowProfileHint(false)
  }

  async function generate() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/practitioner/clinical-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          format,
          period: { kind, from: from || undefined, to: to || undefined },
          observations: observations.trim() || undefined,
          comparisonMode: format === "clinical" ? comparisonMode : undefined,
          riskLevel,
          riskDetail: riskLevel !== "none" ? riskDetail.trim() : undefined,
        }),
      })
      if (res.status === 422) {
        setError(t("report.dialog.noData"))
        return
      }
      if (!res.ok) {
        setError(t("report.dialog.error"))
        return
      }
      const data = (await res.json()) as { id: string }
      setOpen(false)
      // Navigate to the report for review — do NOT auto-print.
      router.push(`/practitioner/patients/${patientId}/report/${data.id}`)
    } catch {
      setError(t("report.dialog.error"))
    } finally {
      setSubmitting(false)
    }
  }

  const periodOptions: { value: PeriodKind; label: string }[] = [
    { value: "last14", label: t("report.dialog.period.last14") },
    { value: "last30", label: t("report.dialog.period.last30") },
    { value: "sinceLast", label: t("report.dialog.period.sinceLast") },
    { value: "custom", label: t("report.dialog.period.custom") },
  ]

  // A generated report is a permanent document — format is fixed at creation,
  // this selector only chooses what's about to be generated.
  const formatOptions: { value: ReportFormat; title: string; description: string }[] = [
    { value: "clinical", title: t("report.format.clinical"), description: t("report.format.clinicalDescription") },
    { value: "narrative", title: t("report.format.narrative"), description: t("report.format.narrativeDescription") },
  ]

  return (
    <>
      {trigger && (
        <Button type="button" variant="outline" onClick={() => setOpen(true)} className="gap-2">
          <IconFileText size={16} stroke={2} aria-hidden />
          {t("report.generate")}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("report.dialog.title")}</DialogTitle>
            <DialogDescription>{t("report.dialog.subtitle")}</DialogDescription>
          </DialogHeader>

          {showProfileHint && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted px-3 py-2 text-[13px]">
              <span>
                {t("report.dialog.profileHint")}{" "}
                <Link href="/practitioner/settings" className="font-medium text-primary underline-offset-4 hover:underline">
                  {t("report.dialog.profileHintLink")}
                </Link>
              </span>
              <button type="button" onClick={dismissHint} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label={t("common.dismiss")}>
                ×
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("report.dialog.formatLabel")}</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {formatOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectFormat(opt.value)}
                    aria-pressed={format === opt.value}
                    className={`rounded-lg border px-3 py-2 text-start transition-colors ${
                      format === opt.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                    }`}
                  >
                    <span className="block text-[13px] font-medium text-foreground">{opt.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("report.dialog.periodLabel")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setKind(opt.value)}
                    className={`rounded-lg border px-3 py-2 text-start text-[13px] transition-colors ${
                      kind === opt.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {kind === "custom" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="report-from">{t("report.dialog.from")}</Label>
                  <Input id="report-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="report-to">{t("report.dialog.to")}</Label>
                  <Input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </div>
            )}

            {format === "clinical" && (
              <div className="flex flex-col gap-1.5">
                <Label>{t("report.dialog.comparisonLabel")}</Label>
                <RadioGroup
                  value={comparisonMode}
                  onValueChange={(v) => setComparisonMode(v as ComparisonMode)}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <label
                    htmlFor="comparison-previousPeriod"
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors ${
                      comparisonMode === "previousPeriod" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value="previousPeriod" id="comparison-previousPeriod" />
                    {t("report.dialog.comparison.previousPeriod")}
                  </label>
                  <label
                    htmlFor="comparison-inclusion"
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors ${
                      comparisonMode === "inclusion" ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value="inclusion" id="comparison-inclusion" />
                    {t("report.dialog.comparison.inclusion")}
                  </label>
                </RadioGroup>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-observations">{t("report.dialog.observations")}</Label>
              <Textarea
                id="report-observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value.slice(0, 600))}
                maxLength={600}
                rows={3}
                placeholder={t("report.dialog.observationsPlaceholder")}
              />
              <span className="text-end text-[11px] text-muted-foreground">{observations.length}/600</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("report.dialog.risk.label")}</Label>
              <RadioGroup value={riskLevel ?? ""} onValueChange={(v) => setRiskLevel(v as RiskLevel)} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(["none", "watch", "significant"] as RiskLevel[]).map((level) => (
                  <label
                    key={level}
                    htmlFor={`risk-${level}`}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors ${
                      riskLevel === level ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value={level} id={`risk-${level}`} />
                    {t(`report.dialog.risk.${level}`)}
                  </label>
                ))}
              </RadioGroup>
              {(riskLevel === "watch" || riskLevel === "significant") && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="risk-detail">{t("report.dialog.risk.detailLabel")}</Label>
                  <Textarea
                    id="risk-detail"
                    value={riskDetail}
                    onChange={(e) => setRiskDetail(e.target.value.slice(0, 400))}
                    maxLength={400}
                    rows={3}
                    placeholder={t("report.dialog.risk.detailPlaceholder")}
                  />
                </div>
              )}
            </div>

            {error && <p className="text-[13px] text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={generate}
              disabled={
                submitting ||
                (kind === "custom" && (!from || !to)) ||
                !riskLevel ||
                ((riskLevel === "watch" || riskLevel === "significant") && !riskDetail.trim())
              }
            >
              {submitting ? t("report.dialog.generating") : t("report.dialog.generate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
