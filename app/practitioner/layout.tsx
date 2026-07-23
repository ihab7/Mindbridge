import React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function PractitionerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "practitioner") redirect("/patient")

  return <DashboardShell user={user}>{children}</DashboardShell>
}
