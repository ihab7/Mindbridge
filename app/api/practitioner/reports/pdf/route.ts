export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { assertPractitionerOwnsPatient } from "@/lib/practitioner"
import { renderConsultationReportPdf } from "@/lib/consultation-report/pdf"
import type { ConsultationReportDraft } from "@/lib/consultation-report/types"

export async function POST(request: Request) {
  const user = await getSession()
  if (!user || user.role !== "practitioner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as Partial<ConsultationReportDraft>
    if (!body.patientInfo || !body.sections) {
      return NextResponse.json({ error: "Invalid report payload" }, { status: 400 })
    }

    const patientId = Number(body.patientInfo.id)
    if (!Number.isFinite(patientId)) {
      return NextResponse.json({ error: "Invalid patient" }, { status: 400 })
    }

    const sql = getSql()
    const ok = await assertPractitionerOwnsPatient(sql, user.id, patientId)
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const draft: ConsultationReportDraft = {
      patientInfo: {
        id: patientId,
        name: String(body.patientInfo.name ?? ""),
        age: body.patientInfo.age != null ? Number(body.patientInfo.age) : null,
        gender: body.patientInfo.gender ? String(body.patientInfo.gender) : null,
        consultationDate: body.patientInfo.consultationDate ?? new Date().toISOString(),
      },
      sections: {
        moodSummary: String(body.sections.moodSummary ?? ""),
        medicationSummary: String(body.sections.medicationSummary ?? ""),
        sleepSummary: String(body.sections.sleepSummary ?? ""),
        mindfulnessSummary: String(body.sections.mindfulnessSummary ?? ""),
        journalSummary: String(body.sections.journalSummary ?? ""),
        sideEffectsSummary: String(body.sections.sideEffectsSummary ?? ""),
        overallProgress: String(body.sections.overallProgress ?? ""),
      },
      recommendations: Array.isArray(body.recommendations) ? body.recommendations.map(String) : [],
      nextAppointment: body.nextAppointment ? String(body.nextAppointment) : null,
    }

    const pdfBuffer = await renderConsultationReportPdf(draft, user.name)
    const fileName = `consultation-report-${draft.patientInfo.name.replace(/\s+/g, "-").toLowerCase() || "patient"}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
