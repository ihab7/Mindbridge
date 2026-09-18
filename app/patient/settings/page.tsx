import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getServerI18n } from "@/lib/server-i18n"
import { getAvatarId } from "@/lib/avatars"
import { avatarUrl } from "@/lib/avatars-shared"
import { AvatarUpload } from "@/components/avatar-upload"

// Patient settings. Deliberately minimal for now: the profile photo only.
export default async function PatientSettingsPage() {
  const user = await getSession()
  if (!user) redirect("/login")

  const { t } = await getServerI18n()
  const avatarId = await getAvatarId(getSql(), user.id)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-2">
      <h1 className="text-2xl font-bold text-foreground">{t("nav.settings")}</h1>
      <AvatarUpload name={user.name} initialAvatarUrl={avatarUrl(avatarId)} endpoint="/api/patient/avatar" />
    </div>
  )
}
