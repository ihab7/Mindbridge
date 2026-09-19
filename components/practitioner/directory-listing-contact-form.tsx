"use client"

import { useState } from "react"
import { IconCheck, IconWorld } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useT } from "@/components/i18n-provider"
import { CABINET_CONTACT_ERROR_KEYS, validateCabinetContact } from "@/lib/directory"

/**
 * Settings → public cabinet contact of the practitioner's directory listing.
 * Kept visually and technically separate from the report letterhead form
 * above it (different table, different audience).
 */
export function DirectoryListingContactForm({ initial }: { initial: { phone: string; email: string } | null }) {
  const t = useT()
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [email, setEmail] = useState(initial?.email ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  async function save() {
    setSaved(false)
    setError("")
    const contact = validateCabinetContact(phone, email)
    if (!contact.ok) {
      setError(t(CABINET_CONTACT_ERROR_KEYS[contact.errorCode]))
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/practitioner/listing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contact.phone, email: contact.email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const key = CABINET_CONTACT_ERROR_KEYS[data.errorCode as keyof typeof CABINET_CONTACT_ERROR_KEYS]
        setError(key ? t(key) : t("settings.listing.saveError"))
        return
      }
      setPhone(data.phone)
      setEmail(data.email)
      setSaved(true)
    } catch {
      setError(t("settings.listing.saveError"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="listing-contact-title" className="mb-card flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <IconWorld size={18} stroke={1.75} className="text-primary" aria-hidden />
        </span>
        <div>
          <h2 id="listing-contact-title" className="text-base font-semibold text-foreground">
            {t("settings.listing.title")}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("settings.listing.reminder")}</p>
        </div>
      </div>

      {initial === null ? (
        <p className="text-sm text-muted-foreground">{t("settings.listing.noListing")}</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="listing-phone">{t("settings.listing.phone")}</Label>
              <Input
                id="listing-phone"
                type="tel"
                autoComplete="tel"
                maxLength={50}
                value={phone}
                aria-invalid={error ? true : undefined}
                aria-describedby="listing-contact-help"
                onChange={(e) => {
                  setPhone(e.target.value)
                  setSaved(false)
                  setError("")
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="listing-email">{t("settings.listing.email")}</Label>
              <Input
                id="listing-email"
                type="email"
                autoComplete="email"
                maxLength={255}
                value={email}
                aria-invalid={error ? true : undefined}
                aria-describedby="listing-contact-help"
                onChange={(e) => {
                  setEmail(e.target.value)
                  setSaved(false)
                  setError("")
                }}
              />
            </div>
          </div>
          <p
            id="listing-contact-help"
            role={error ? "alert" : undefined}
            className={`-mt-1 text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}
          >
            {error || t("settings.listing.requiredHint")}
          </p>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? t("settings.profile.saving") : t("settings.profile.save")}
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-[13px] text-primary" role="status">
                <IconCheck size={15} stroke={2} aria-hidden />
                {t("settings.profile.saved")}
              </span>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
