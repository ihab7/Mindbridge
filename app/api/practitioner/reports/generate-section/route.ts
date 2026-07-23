export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"
import { fetchPatientReportContext } from "@/lib/consultation-report/data"
import { analyzePatientData } from "@/lib/consultation-report/analysis"
import { generateSection, generateRecommendations } from "@/lib/consultation-report/templates"
import type { ReportSections } from "@/lib/consultation-report/types"

const SECTION_KEYS: (keyof ReportSections)[] = [
  "moodSummary",
  "medicationSummary",
  "sleepSummary",
  "mindfulnessSummary",
  "journalSummary",
  "sideEffectsSummary",
  "overallProgress",
]

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const patientId = Number(body.patientId)
    const section = body.section as string

    if (!Number.isFinite(patientId)) {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 })
    }
    if (section !== "recommendations" && !SECTION_KEYS.includes(section as keyof ReportSections)) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 })
    }

    const sql = getSql()
    const ok = await assertPractitionerOwnsPatient(sql, user.id, patientId)
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { entries, breathingSessions } = await fetchPatientReportContext(sql, patientId)
    const analysis = analyzePatientData(entries, breathingSessions)

    if (section === "recommendations") {
      return NextResponse.json({ recommendations: generateRecommendations(analysis) })
    }

    const value = generateSection(section as keyof ReportSections, analysis)
    return NextResponse.json({ section, value })
  } catch (error) {
    console.error("Section regeneration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
