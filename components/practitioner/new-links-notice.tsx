"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserCheck } from "lucide-react"
import { useT } from "@/components/i18n-provider"
import { UserAvatar } from "@/components/user-avatar"
import { avatarUrl } from "@/lib/avatars-shared"

/**
 * "N new patients linked": patients who redeemed one of this practitioner's
 * codes since the notice was last dismissed. Loaded with the Patients page —
 * no polling needed. Opening a patient's page also clears that patient's entry.
 */
export function NewLinksNotice({ links }: { links: { patientId: number; patientName: string; avatarId?: string | null }[] }) {
  const t = useT()
  const router = useRouter()
  const [dismissing, setDismissing] = useState(false)

  if (links.length === 0) return null

  async function dismiss() {
    setDismissing(true)
    try {
      await fetch("/api/practitioner/linking-codes/seen", { method: "POST" })
    } finally {
      router.refresh()
    }
  }

  return (
    <div role="status" className="flex flex-wrap items-start gap-3 rounded-xl border border-primary/30 bg-primary/[0.06] px-4 py-3">
      <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {links.length === 1
            ? t("practitioner.linking.newLinks.one")
            : t("practitioner.linking.newLinks.other", { count: links.length })}
        </p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {links.map((l) => (
            <Link key={l.patientId} href={`/practitioner/patients/${l.patientId}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              <UserAvatar
                src={avatarUrl(l.avatarId)}
                name={l.patientName}
                decorative
                className="h-5 w-5 bg-primary/10 text-[10px] font-semibold text-primary"
              />
              {l.patientName}
            </Link>
          ))}
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        disabled={dismissing}
        className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline disabled:opacity-60"
      >
        {t("practitioner.linking.newLinks.dismiss")}
      </button>
    </div>
  )
}
