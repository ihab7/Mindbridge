"use client"

import { useEffect, useRef } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useT } from "@/components/i18n-provider"

export type LinkedPractitioner = { name: string; specialty: string | null; cabinet: string | null }

/**
 * Shown right after a code links the patient — at sign-up and from the
 * dashboard — so they see exactly who now follows them before continuing.
 */
export function LinkedConfirmation({
  practitioner,
  onContinue,
  pending,
}: {
  practitioner: LinkedPractitioner
  onContinue: () => void
  pending?: boolean
}) {
  const t = useT()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const details = [practitioner.specialty, practitioner.cabinet].filter(Boolean).join(", ")

  // The form this replaces had focus; move it to the result so keyboard and
  // screen-reader users land on the confirmation, not on <body>.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-7 w-7 text-primary" aria-hidden="true" />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-foreground outline-none">
        {t("linking.confirmed.title", { name: practitioner.name })}
      </h2>
      {details && <p className="text-sm text-muted-foreground">{details}</p>}
      <button
        type="button"
        onClick={onContinue}
        disabled={pending}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("linking.confirmed.continue")}
      </button>
    </div>
  )
}
