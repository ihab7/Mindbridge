import { redirect } from "next/navigation"
import { getSql } from "@/lib/db"
import { withoutDoctorPrefix } from "@/lib/directory"
import { RegisterForm, type PractitionerContext } from "./register-form"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * ?practitioner={listing id} from the directory's "Sign up with this
 * practitioner" shortcut. Read-only and purely for welcome copy: it is NOT
 * passed to the sign-up API and never decides the link — only a linking code
 * does. Anything that isn't a live listing backed by a practitioner account
 * (same visibility rule as the directory) is ignored silently.
 */
async function resolvePractitionerContext(param: unknown): Promise<PractitionerContext | null> {
  if (typeof param !== "string" || !UUID.test(param)) return null
  try {
    const rows = (await getSql()`
      SELECT full_name, specialty FROM practitioners
      WHERE id = ${param}
        AND user_id IS NOT NULL
        AND is_subscribed = true
        AND (subscription_expires_at IS NULL OR subscription_expires_at > NOW())
    `) as { full_name: string; specialty: string }[]
    if (rows.length === 0) return null
    return { name: withoutDoctorPrefix(rows[0].full_name), specialty: rows[0].specialty.trim() }
  } catch {
    return null
  }
}

// /register creates patient accounts only. Anyone arriving with an explicit
// practitioner intent (/register?role=practitioner) is sent to /join, the one
// practitioner sign-up, instead of being shown a form that cannot serve them.
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { role, practitioner } = await searchParams
  if (role === "practitioner") redirect("/join")

  return <RegisterForm practitionerContext={await resolvePractitionerContext(practitioner)} />
}
