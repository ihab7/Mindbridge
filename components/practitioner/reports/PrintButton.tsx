"use client"

import { IconPrinter } from "@tabler/icons-react"
import { useT } from "@/components/i18n-provider"

// Browser print pipeline — no dependency, exact A4, selectable text. Marked
// `no-print` so the button itself never appears in the printed output.
export function PrintButton() {
  const t = useT()
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <IconPrinter size={16} stroke={2} aria-hidden />
      {t("report.print")}
    </button>
  )
}
