import React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { getAssignmentWithProgress } from "@/lib/program/data"
import { ProgramReviewScreen } from "@/components/practitioner/program-review/program-review-screen"

export default async function ProgramReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) redirect("/login")
  // Practitioner-only is already enforced by app/practitioner/layout.tsx, which redirects
  // patients to /patient before this page ever renders.

  const { id } = await params
  const patientId = parseInt(id)

  const sql = getSql()
  const authorized = (await sql`
    SELECT 1 FROM patients WHERE user_id = ${patientId} AND practitioner_id = ${user.id}
  `) as unknown[]
  if (authorized.length === 0) redirect("/practitioner/patients")

  const patientRows = (await sql`SELECT name FROM users WHERE id = ${patientId}`) as Array<{ name: string }>
  if (patientRows.length === 0) redirect("/practitioner/patients")
  const patientName = patientRows[0].name

  const assignmentData = await getAssignmentWithProgress(patientId)
  const mode: "draft" | "revise" = assignmentData && assignmentData.assignment.status === "active" ? "revise" : "draft"
  const completedSessionsCount = mode === "revise" && assignmentData ? assignmentData.progress.length : 0

  return (
    <div className="mx-auto max-w-3xl">
      <ProgramReviewScreen
        patientId={patientId}
        patientName={patientName}
        mode={mode}
        completedSessionsCount={completedSessionsCount}
      />
    </div>
  )
}
