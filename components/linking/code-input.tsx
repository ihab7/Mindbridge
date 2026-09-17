"use client"

import React from "react"

/**
 * Six-character linking-code field, shared by sign-up and the patient
 * dashboard. Uppercases as you type and keeps letters/digits only; the server
 * does the real validation (alphabet, expiry, single use). Always LTR: a code
 * is read left to right in every locale.
 */
export function CodeInput({
  id,
  value,
  onChange,
  invalid,
  describedBy,
  autoFocus,
  label,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  describedBy?: string
  autoFocus?: boolean
  label: string
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="text"
      autoComplete="one-time-code"
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      autoFocus={autoFocus}
      maxLength={6}
      dir="ltr"
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      placeholder="7K4M9P"
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
      className={`w-full rounded-lg border bg-background px-3 py-3 text-center font-mono text-2xl font-semibold uppercase tracking-[0.35em] text-foreground outline-none ring-ring transition-shadow placeholder:text-muted-foreground/40 focus:ring-2 ${
        invalid ? "border-destructive" : "border-input"
      }`}
    />
  )
}
