export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAssignmentWithProgress } from "@/lib/program/data"

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== "patient") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getAssignmentWithProgress(user.id)

  if (!data || data.assignment.status !== "active") {
    return NextResponse.json({ hasAssignment: false, practitionerName: "", progress: [], plan: [] })
  }

  return NextResponse.json({
    hasAssignment: true,
    practitionerName: data.practitionerName,
    progress: data.progress,
    plan: data.assignment.plan,
  })
}
