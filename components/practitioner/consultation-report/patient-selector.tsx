"use client"

import { useEffect, useState } from "react"
import { Loader2, User } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type Patient = {
  id: number
  name: string
  email: string
}

export function PatientSelector({ onSelect }: { onSelect: (patientId: number) => void }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/patients")
        if (!res.ok) throw new Error("failed")
        const data = await res.json()
        if (!cancelled) setPatients(data.patients ?? [])
      } catch {
        if (!cancelled) setPatients([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading patients...
      </div>
    )
  }

  return (
    <Command className="rounded-lg border border-border">
      <CommandInput placeholder="Search patients by name or email..." />
      <CommandList className="max-h-72">
        <CommandEmpty>No patients found.</CommandEmpty>
        <CommandGroup>
          {patients.map((patient) => (
            <CommandItem
              key={patient.id}
              value={`${patient.name} ${patient.email}`}
              onSelect={() => onSelect(patient.id)}
              className="cursor-pointer gap-3 py-2.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{patient.name}</span>
                <span className="text-xs text-muted-foreground">{patient.email}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
