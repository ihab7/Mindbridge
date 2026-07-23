"use client"

import { useState } from "react"
import { Check, Copy, Loader2, Printer, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { formatReportAsText } from "@/lib/consultation-report/format"
import { printReport } from "./print-report"
import type { ConsultationReportDraft } from "@/lib/consultation-report/types"

export function ReportActionsBar({
  draft,
  practitionerName,
  saving,
  onSave,
  onCancel,
}: {
  draft: ConsultationReportDraft
  practitionerName: string
  saving: boolean
  onSave: () => void
  onCancel: () => void
}) {
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      const res = await fetch("/api/practitioner/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `consultation-report-${draft.patientInfo.name.replace(/\s+/g, "-").toLowerCase() || "patient"}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: "Couldn't generate PDF", variant: "destructive" })
    } finally {
      setDownloadingPdf(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatReportAsText(draft))
      setCopied(true)
      toast({ title: "Report copied to clipboard" })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: "Couldn't copy report", variant: "destructive" })
    }
  }

  function handlePrint() {
    printReport(draft, practitionerName)
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
      <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button type="button" variant="outline" onClick={handlePrint} className="gap-1.5">
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Button type="button" variant="outline" onClick={handleCopy} className="gap-1.5">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        Copy to Clipboard
      </Button>
      <Button type="button" variant="outline" onClick={handleDownloadPdf} disabled={downloadingPdf} className="gap-1.5">
        {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Download PDF
      </Button>
      <Button type="button" onClick={onSave} disabled={saving} className="gap-1.5">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Report
      </Button>
    </div>
  )
}
