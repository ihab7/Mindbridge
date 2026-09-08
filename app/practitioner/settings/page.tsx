import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import { getServerI18n } from "@/lib/server-i18n"
import { logDbError } from "@/lib/db-errors"
import { PractitionerProfileForm, type ProfileValues } from "@/components/practitioner/reports/PractitionerProfileForm"

export default async function PractitionerSettingsPage() {
  const user = await getSession()
  if (!user || user.role !== "practitioner") redirect("/login")

  const { t } = await getServerI18n()
  const sql = getSql()

  // A practitioner with no row yet (or a transient DB issue) must still get an
  // empty, editable form — never a crash or a blank screen. Saving upserts.
  let rows: Record<string, unknown>[] = []
  try {
    rows = (await sql`
      SELECT full_name, specialty, cabinet_name, license_number, address, phone, email, report_footer_note
      FROM practitioner_profiles WHERE user_id = ${user.id}
    `) as Record<string, unknown>[]
  } catch (err) {
    logDbError(err, "practitioner-settings:load")
  }

  // Default full_name/email to the user's account values when no profile exists.
  const p = rows[0]
  const initial: Partial<ProfileValues> = {
    full_name: (p?.full_name as string) ?? user.name ?? "",
    specialty: (p?.specialty as string) ?? "",
    cabinet_name: (p?.cabinet_name as string) ?? "",
    license_number: (p?.license_number as string) ?? "",
    address: (p?.address as string) ?? "",
    phone: (p?.phone as string) ?? "",
    email: (p?.email as string) ?? user.email ?? "",
    report_footer_note: (p?.report_footer_note as string) ?? "",
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("settings.profile.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("settings.profile.subtitle")}</p>
      </div>
      <PractitionerProfileForm initial={initial} />
    </div>
  )
}
