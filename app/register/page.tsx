import { redirect } from "next/navigation"
import { RegisterForm } from "./register-form"

// /register creates patient accounts only. Anyone arriving with an explicit
// practitioner intent (/register?role=practitioner) is sent to /join, the one
// practitioner sign-up, instead of being shown a form that cannot serve them.
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { role } = await searchParams
  if (role === "practitioner") redirect("/join")

  return <RegisterForm />
}
