"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReportModal } from "./report-modal"

export function ConsultationReportWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-card-foreground">One-Click Consultation Report</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Generate a complete consultation summary instantly from patient data.
          </p>
        </div>
      </div>
      <Button type="button" onClick={() => setOpen(true)} className="shrink-0">
        Generate Report
      </Button>

      <ReportModal open={open} onOpenChange={setOpen} />
    </div>
  )
}
