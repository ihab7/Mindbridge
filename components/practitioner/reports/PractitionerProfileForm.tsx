"use client"

import { useState, useId } from "react"
import { IconInfoCircle, IconCheck } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useT } from "@/components/i18n-provider"

export type ProfileValues = {
  full_name: string
  specialty: string
  cabinet_name: string
  license_number: string
  address: string
  phone: string
  email: string
  report_footer_note: string
}

const EMPTY: ProfileValues = {
  full_name: "",
  specialty: "",
  cabinet_name: "",
  license_number: "",
  address: "",
  phone: "",
  email: "",
  report_footer_note: "",
}

export function PractitionerProfileForm({ initial }: { initial: Partial<ProfileValues> | null }) {
  const t = useT()
  // Stable, unique-per-mount token so autocomplete attribute values don't match
  // any browser autofill heuristic.
  const fieldNonce = useId().replace(/[^a-zA-Z0-9]/g, "")
  const [values, setValues] = useState<ProfileValues>({ ...EMPTY, ...(initial ?? {}) })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof ProfileValues>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/practitioner/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const fields: { key: keyof ProfileValues; label: string }[] = [
    { key: "full_name", label: t("settings.profile.fullName") },
    { key: "specialty", label: t("settings.profile.specialty") },
    { key: "cabinet_name", label: t("settings.profile.cabinetName") },
    { key: "license_number", label: t("settings.profile.licenseNumber") },
    { key: "address", label: t("settings.profile.address") },
    { key: "phone", label: t("settings.profile.phone") },
    { key: "email", label: t("settings.profile.email") },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 text-[13px] text-muted-foreground">
        <IconInfoCircle size={16} stroke={2} className="mt-0.5 shrink-0" aria-hidden />
        <span>{t("settings.profile.hint")}</span>
      </div>

      {/* Robust autofill defense. Chrome ignores autoComplete="off" on many
          field types, so it can inject/shift its saved name/organization/etc.
          into these look-alike fields — which surfaces as a label→column
          "mismap" even though the bindings are correct. Defenses stacked:
          (1) a honeypot the browser fills instead of the real fields,
          (2) a non-standard, unique autocomplete token per field so Chrome's
              heuristics don't recognize them,
          (3) autoComplete="off" on the wrapping form. */}
      <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
        <input
          type="text"
          name="mb_autofill_honeypot"
          tabIndex={-1}
          aria-hidden
          autoComplete="off"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <Label htmlFor={`profile-${f.key}`}>{f.label}</Label>
              <Input
                id={`profile-${f.key}`}
                name={`mb_${f.key}_${fieldNonce}`}
                autoComplete={`mb-no-fill-${f.key}-${fieldNonce}`}
                data-lpignore="true"
                data-1p-ignore="true"
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-footer">{t("settings.profile.footerNote")}</Label>
          <Textarea
            id="profile-footer"
            name={`mb_report_footer_note_${fieldNonce}`}
            autoComplete={`mb-no-fill-footer-${fieldNonce}`}
            data-lpignore="true"
            data-1p-ignore="true"
            value={values.report_footer_note}
            onChange={(e) => set("report_footer_note", e.target.value)}
            rows={2}
            placeholder={t("settings.profile.footerNotePlaceholder")}
          />
          <span className="text-[11px] text-muted-foreground">{t("settings.profile.footerNoteHint")}</span>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? t("settings.profile.saving") : t("settings.profile.save")}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-[13px] text-primary">
              <IconCheck size={15} stroke={2} aria-hidden />
              {t("settings.profile.saved")}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
