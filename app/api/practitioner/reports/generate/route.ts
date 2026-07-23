export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"
import { fetchPatientReportContext } from "@/lib/consultation-report/data"
import { analyzePatientData } from "@/lib/consultation-report/analysis"
import { generateSections, generateRecommendations } from "@/lib/consultation-report/templates"
import type { ConsultationReportDraft } from "@/lib/consultation-report/types"

function parseConsultationDate(value: unknown): string {
  if (typeof value === "string") {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
  }
  return new Date().toISOString()
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const patientId = Number(body.patientId)
    if (!Number.isFinite(patientId)) {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 })
    }

    const sql = getSql()
    const ok = await assertPractitionerOwnsPatient(sql, user.id, patientId)
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { patient, entries, breathingSessions, previousReport } = await fetchPatientReportContext(sql, patientId)
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const analysis = analyzePatientData(entries, breathingSessions)
    const sections = generateSections(analysis)
    const recommendations = generateRecommendations(analysis)

    const draft: ConsultationReportDraft = {
      patientInfo: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        consultationDate: parseConsultationDate(body.consultationDate),
      },
      sections,
      recommendations,
      nextAppointment: null,
    }

    return NextResponse.json({ draft, previousReport: previousReport ?? null, entryCount: entries.length })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
