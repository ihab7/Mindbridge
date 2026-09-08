"use client"

import { useState } from "react"
import { IconSearch } from "@tabler/icons-react"

export type PickerPatient = { id: number; name: string }

// Standalone component styled after the same list pattern the Messages page
// uses (avatar circle + name, selectable rows) — built fresh rather than
// importing from the messaging feature, so this never risks a regression
// there. Adds a search box on top, since picking a patient is the whole point
// of this list.
export function PatientPickerList({
  patients,
  selectedId,
  onSelect,
  searchPlaceholder,
  emptyLabel,
}: {
  patients: PickerPatient[]
  selectedId?: number
  onSelect: (id: number) => void
  searchPlaceholder: string
  emptyLabel: string
}) {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const filtered = q ? patients.filter((p) => p.name.toLowerCase().includes(q)) : patients

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border p-2">
        <div className="relative">
          <IconSearch size={15} stroke={2} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-input bg-background py-2 ps-9 pe-3 text-sm text-foreground"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>}
        {filtered.map((patient) => (
          <button
            key={patient.id}
            type="button"
            onClick={() => onSelect(patient.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors ${
              selectedId === patient.id ? "bg-primary/10 text-primary" : "text-card-foreground hover:bg-muted"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {patient.name.charAt(0)}
            </span>
            <span className="flex-1 truncate font-medium">{patient.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
