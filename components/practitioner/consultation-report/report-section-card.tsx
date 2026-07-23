"use client"

import { Loader2, RefreshCw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function ReportSectionCard({
  title,
  value,
  onChange,
  onRegenerate,
  regenerating,
  rows = 3,
}: {
  title: string
  value: string
  onChange: (value: string) => void
  onRegenerate: () => void
  regenerating: boolean
  rows?: number
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={regenerating}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {regenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Regenerate
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        disabled={regenerating}
        className="text-sm"
      />
    </div>
  )
}
