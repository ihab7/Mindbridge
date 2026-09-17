"use client"

import { useState } from "react"
import {
  IconFileText,
  IconTable,
  IconShieldCheck,
  IconSignature,
  IconTimeline,
  IconMoodSmile,
  IconListCheck,
  IconCalendar,
} from "@tabler/icons-react"

export type ReportsTabsStrings = {
  badge: string
  title: string
  tabClinical: string
  tabNarrative: string
  clinical: [string, string, string, string]
  narrative: [string, string, string, string]
}

const CLINICAL_ICONS = [IconFileText, IconTable, IconShieldCheck, IconSignature]
const NARRATIVE_ICONS = [IconTimeline, IconMoodSmile, IconListCheck, IconCalendar]

/**
 * The two panels mirror the two report formats the app actually produces —
 * the clinical letter (diagnosis, indicator table, risk assessment, signed
 * letterhead) and the narrative summary. Swapping is a state change, not a
 * navigation: nothing reloads.
 */
export function ReportsTabsSection({ strings }: { strings: ReportsTabsStrings }) {
  const [tab, setTab] = useState<"clinical" | "narrative">("clinical")

  const rows = tab === "clinical" ? strings.clinical : strings.narrative
  const icons = tab === "clinical" ? CLINICAL_ICONS : NARRATIVE_ICONS

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
      active
        ? "bg-primary text-primary-foreground"
        : "border-[0.5px] border-border bg-transparent text-muted-foreground hover:text-foreground"
    }`

  return (
    <section className="px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-[860px]">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
            {strings.badge}
          </span>
          <h2 className="mb-6 mt-4 text-2xl font-bold tracking-[-0.02em] text-foreground md:text-[30px]">
            {strings.title}
          </h2>

          <div className="flex justify-center gap-2" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "clinical"}
              onClick={() => setTab("clinical")}
              className={tabClass(tab === "clinical")}
            >
              {strings.tabClinical}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "narrative"}
              onClick={() => setTab("narrative")}
              className={tabClass(tab === "narrative")}
            >
              {strings.tabNarrative}
            </button>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-[480px] rounded-[14px] border-[0.5px] border-border px-6 py-5">
          {/* key on the list restarts the fade whenever the tab changes */}
          <ul key={tab} className="tabPanel flex flex-col gap-3">
            {rows.map((row, index) => {
              const Icon = icons[index]
              return (
                <li key={row} className="flex items-start gap-2.5">
                  <Icon size={16} stroke={1.75} className="mt-px shrink-0 text-primary" />
                  <span className="text-[12.5px] leading-snug text-foreground">{row}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
