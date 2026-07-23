"use client"

import { useRef, useState } from "react"
import { AmbientPlayer } from "@/components/AmbientPlayer"
import { useI18n } from "@/components/i18n-provider"

export function CollapsibleSound() {
  const { locale } = useI18n()
  const [open, setOpen] = useState(false)
  const innerRef = useRef<HTMLDivElement>(null)

  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <div className="overflow-hidden rounded-xl border border-border" dir={dir}>
      {/* Toggle bar */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <span>🎵 Ambient Sound</span>
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {/* Collapsible body — CSS height transition, no display:none */}
      <div
        className="transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? "800px" : "0px", overflow: "hidden" }}
      >
        <div ref={innerRef} className="border-t border-border">
          <AmbientPlayer />
        </div>
      </div>
    </div>
  )
}
