import React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard-shell"
import { getProgramNavState } from "@/lib/program/data"

export default async function MindfulnessLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "patient") redirect("/practitioner")

  const { hasActiveProgram, needsSessionToday } = await getProgramNavState(user.id)

  return (
    <DashboardShell user={user} hasActiveProgram={hasActiveProgram} programNeedsAttention={needsSessionToday}>
      {children}
    </DashboardShell>
  )
}
