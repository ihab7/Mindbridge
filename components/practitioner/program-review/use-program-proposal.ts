"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PatientDigest } from "@/lib/program/ai/buildPatientDigest"
import { findLibrarySession, SESSION_LIBRARY } from "@/lib/program/sessionLibrary"
import type { LibrarySession, PractitionerEdits, ProposalSource } from "@/lib/program/types"

export type EditableSession = {
  id: string
  week: number
  /** null for sessions the practitioner added by hand — there's no AI rationale to show. */
  rationale: string | null
  removed: boolean
  justAdded: boolean
}

export type EditableSessionWithIndex = EditableSession & { globalIndex: number }

export type EditableSkipped = { id: string; reason: string }

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready"
      auditId: string
      source: ProposalSource
      digest: PatientDigest
      thinData: boolean
      draftNote: string
      summary: string
    }

const MIN_SESSIONS = 4
const FLASH_MS = 1200

/**
 * Swaps the session at index `i` (the one the practitioner is moving) with its neighbor at
 * index `j`. If they belonged to different weeks, `i`'s session adopts `j`'s week — "moving a
 * row across a week boundary reassigns its week automatically" — while the displaced neighbor
 * keeps its own week unchanged, so each week's run stays contiguous.
 */
function swapAdjacent(sessions: EditableSession[], i: number, j: number) {
  const moving = sessions[i]
  const other = sessions[j]
  sessions[i] = other
  sessions[j] = moving.week === other.week ? moving : { ...moving, week: other.week }
}

export function useProgramProposal(patientId: number, options?: { initialRevise?: boolean }) {
  const initialRevise = options?.initialRevise ?? false
  const [load, setLoad] = useState<LoadState>({ status: "loading" })
  const [sessions, setSessions] = useState<EditableSession[]>([])
  const [skipped, setSkipped] = useState<EditableSkipped[]>([])
  const [originalIds, setOriginalIds] = useState<string[]>([])
  const [draftNote, setDraftNote] = useState("")
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState<string | null>(null)
  const flashTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const fetchProposal = useCallback(
    async (revise: boolean) => {
      setLoad({ status: "loading" })
      setApproveError(null)
      try {
        const res = await fetch("/api/program/propose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId, revise }),
        })
        if (!res.ok) throw new Error("failed")
        const json = (await res.json()) as {
          auditId: string
          proposal: {
            source: ProposalSource
            sessions: { id: string; week: number; order: number; rationale: string }[]
            skipped: { id: string; reason: string }[]
            draftNote: string
            summary: string
          }
          digest: PatientDigest
          thinData: boolean
        }

        const ordered = [...json.proposal.sessions].sort((a, b) => a.order - b.order)
        setSessions(
          ordered.map((s) => ({ id: s.id, week: s.week, rationale: s.rationale || null, removed: false, justAdded: false }))
        )
        setOriginalIds(ordered.map((s) => s.id))
        setSkipped(json.proposal.skipped)
        setDraftNote(json.proposal.draftNote)
        setLoad({
          status: "ready",
          auditId: json.auditId,
          source: json.proposal.source,
          digest: json.digest,
          thinData: json.thinData,
          draftNote: json.proposal.draftNote,
          summary: json.proposal.summary,
        })
      } catch {
        setLoad({ status: "error" })
      }
    },
    [patientId]
  )

  useEffect(() => {
    void fetchProposal(initialRevise)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timers = flashTimers.current
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  function flash(id: string) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, justAdded: true } : s)))
    const existing = flashTimers.current.get(id)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, justAdded: false } : s)))
      flashTimers.current.delete(id)
    }, FLASH_MS)
    flashTimers.current.set(id, timer)
  }

  function remove(id: string) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, removed: true } : s)))
  }

  function restore(id: string) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, removed: false } : s)))
    flash(id)
  }

  function moveUp(id: string) {
    setSessions((prev) => {
      const i = prev.findIndex((s) => s.id === id)
      if (i <= 0) return prev
      const next = [...prev]
      swapAdjacent(next, i, i - 1)
      return next
    })
  }

  function moveDown(id: string) {
    setSessions((prev) => {
      const i = prev.findIndex((s) => s.id === id)
      if (i === -1 || i >= prev.length - 1) return prev
      const next = [...prev]
      swapAdjacent(next, i, i + 1)
      return next
    })
  }

  function lastWeekOrDefault(): number {
    const weeks = sessions.filter((s) => !s.removed).map((s) => s.week)
    return weeks.length > 0 ? Math.max(...weeks) : 1
  }

  function addFromSkipped(id: string) {
    setSkipped((prev) => prev.filter((s) => s.id !== id))
    setSessions((prev) => {
      if (prev.some((s) => s.id === id)) return prev.map((s) => (s.id === id ? { ...s, removed: false } : s))
      return [...prev, { id, week: lastWeekOrDefault(), rationale: null, removed: false, justAdded: false }]
    })
    flash(id)
  }

  function addFromLibrary(id: string) {
    setSessions((prev) => {
      if (prev.some((s) => s.id === id)) return prev
      return [...prev, { id, week: lastWeekOrDefault(), rationale: null, removed: false, justAdded: false }]
    })
    setSkipped((prev) => prev.filter((s) => s.id !== id))
    flash(id)
  }

  const activeSessions = sessions.filter((s) => !s.removed)
  const sessionCount = activeSessions.length
  const activeWeekNumbers = [...new Set(activeSessions.map((s) => s.week))]
  const weekCount = activeWeekNumbers.length
  const perWeek = weekCount > 0 ? Math.round((sessionCount / weekCount) * 10) / 10 : 0

  // Grouped from the FULL list (not just active) — a week whose sessions were all removed still
  // needs to render (dimmed) so those rows stay restorable; it just doesn't count toward weekCount.
  const allWeekNumbers = [...new Set(sessions.map((s) => s.week))].sort((a, b) => a - b)
  const weeks = allWeekNumbers.map((weekNumber) => ({
    weekNumber,
    sessions: sessions
      .map((s, globalIndex) => ({ ...s, globalIndex }))
      .filter((s) => s.week === weekNumber),
  }))
  const lastGlobalIndex = sessions.length - 1

  const usedIds = new Set(sessions.map((s) => s.id))
  const libraryRemaining: LibrarySession[] = SESSION_LIBRARY.filter((s) => !usedIds.has(s.id))

  function buildPractitionerEdits(): PractitionerEdits {
    const finalActiveIds = activeSessions.map((s) => s.id)
    const removed = originalIds.filter((id) => !finalActiveIds.includes(id))
    const added = finalActiveIds.filter((id) => !originalIds.includes(id))
    const commonFinal = finalActiveIds.filter((id) => originalIds.includes(id))
    const commonOriginal = originalIds.filter((id) => finalActiveIds.includes(id))
    const reordered = JSON.stringify(commonFinal) !== JSON.stringify(commonOriginal)
    return { removed, added, reordered }
  }

  async function approve(note: string): Promise<{ ok: boolean; error?: string; sessionCount?: number; weekCount?: number }> {
    if (load.status !== "ready") return { ok: false, error: "not_ready" }
    if (sessionCount < MIN_SESSIONS) return { ok: false, error: "min_sessions" }

    setApproving(true)
    setApproveError(null)
    try {
      const plan = activeSessions.map((s) => ({ sessionId: s.id, week: s.week }))
      const res = await fetch(`/api/practitioner/patients/${patientId}/program/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId: load.auditId,
          source: load.source,
          plan,
          aiSummary: load.summary,
          note,
          practitionerEdits: buildPractitionerEdits(),
        }),
      })
      if (!res.ok) throw new Error("failed")
      const json = (await res.json()) as { sessionCount: number; weekCount: number }
      return { ok: true, sessionCount: json.sessionCount, weekCount: json.weekCount }
    } catch {
      setApproveError("approve_failed")
      return { ok: false, error: "approve_failed" }
    } finally {
      setApproving(false)
    }
  }

  return {
    load,
    weeks,
    lastGlobalIndex,
    skipped,
    draftNote,
    setDraftNote,
    sessionCount,
    weekCount,
    perWeek,
    canApprove: sessionCount >= MIN_SESSIONS,
    libraryRemaining,
    approving,
    approveError,
    remove,
    restore,
    moveUp,
    moveDown,
    addFromSkipped,
    addFromLibrary,
    approve,
    redraft: () => fetchProposal(false),
    loadForRevise: () => fetchProposal(true),
    findLibrarySession,
  }
}
