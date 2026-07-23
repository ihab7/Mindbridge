"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import { ReportModal } from "./report-modal"

export function NewReportButton({ patientId }: { patientId: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <FileText className="h-4 w-4" />
        New Report
      </button>
      <ReportModal open={open} onOpenChange={setOpen} patientId={patientId} />
    </>
  )
}
