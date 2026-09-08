import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import { getServerI18n } from "@/lib/server-i18n"
import { getPractitionerLetterhead, getPractitionerPatients, listReportsForPractitioner } from "@/lib/reports/data"
import { ReportsHubClient } from "@/components/practitioner/reports/ReportsHubClient"

// Fast path from the dashboard: land directly on a patient picker instead of
// the full patient list → profile → scroll → button flow. Two steps total:
// pick a patient here, then the generate dialog.
export default async function ReportsHubPage() {
  const user = await getSession()
  if (!user || user.role !== "practitioner") redirect("/login")

  const sql = getSql()
  const { t } = await getServerI18n()

  const [patients, { hasProfile }, reports] = await Promise.all([
    getPractitionerPatients(sql, user.id),
    getPractitionerLetterhead(sql, user.id),
    listReportsForPractitioner(sql, user.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("report.hub.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("report.hub.subtitle")}</p>
      </div>

      <ReportsHubClient patients={patients} hasProfile={hasProfile} practitionerId={user.id} reports={reports} />
    </div>
  )
}
