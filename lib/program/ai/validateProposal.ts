import type { LibrarySession, ProgramPace, ProgramProposal, ProposedSessionEntry, ProposedSkippedEntry } from "../types"

const MIN_SESSIONS_TARGET = 10
const MAX_SESSIONS_TARGET = 16
const MIN_SESSIONS_FAILURE_FLOOR = 8
const RATIONALE_MAX_LEN = 200
const DRAFT_NOTE_MAX_LEN = 200
const VALID_PACES: ProgramPace[] = ["2_per_week", "3_per_week", "daily"]

export type ValidationResult = {
  ok: boolean
  plan: ProgramProposal | null
  warnings: string[]
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fenced ? fenced[1].trim() : trimmed
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim()
}

function clampLen(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) : text
}

/**
 * Validates and repairs a raw AI response into a safe, library-checked
 * proposal. Every check runs in order, dropping/clamping/reordering rather
 * than failing outright, except: unparseable JSON, a missing/invalid
 * `sessions` array, or fewer than `MIN_SESSIONS_FAILURE_FLOOR` sessions
 * surviving cleanup — those make `ok: false`, which the caller should treat
 * as "fall back to the rules engine."
 */
export function validateProposal(rawText: string, library: LibrarySession[]): ValidationResult {
  const warnings: string[] = []
  const libraryById = new Map(library.map((s) => [s.id, s]))

  // 1. Parse JSON, stripping markdown code fences if the model added them.
  let raw: unknown
  try {
    raw = JSON.parse(stripCodeFences(rawText))
  } catch {
    return { ok: false, plan: null, warnings: ["Response was not valid JSON"] }
  }

  if (typeof raw !== "object" || raw === null || !Array.isArray((raw as Record<string, unknown>).sessions)) {
    return { ok: false, plan: null, warnings: ["Response did not contain a sessions array"] }
  }

  const rawObj = raw as Record<string, unknown>
  const rawSessions = rawObj.sessions as unknown[]
  const rawSkipped = Array.isArray(rawObj.skipped) ? (rawObj.skipped as unknown[]) : []

  // 2 & 3. Keep only sessions with a known id, dropping unknowns and duplicates.
  const seen = new Set<string>()
  type Working = { id: string; week: number; rationale: string }
  const working: Working[] = []
  for (const entry of rawSessions) {
    if (typeof entry !== "object" || entry === null) continue
    const e = entry as Record<string, unknown>
    const id = typeof e.id === "string" ? e.id : ""
    if (!id) continue
    if (!libraryById.has(id)) {
      warnings.push(`Dropped unknown session id "${id}"`)
      continue
    }
    if (seen.has(id)) {
      warnings.push(`Dropped duplicate session id "${id}"`)
      continue
    }
    seen.add(id)
    working.push({
      id,
      week: typeof e.week === "number" ? e.week : Number(e.week),
      rationale: typeof e.rationale === "string" ? e.rationale : "",
    })
  }

  // 4. Enforce the count bounds.
  if (working.length < MIN_SESSIONS_FAILURE_FLOOR) {
    warnings.push(`Only ${working.length} valid sessions remained after cleanup (minimum ${MIN_SESSIONS_FAILURE_FLOOR})`)
    return { ok: false, plan: null, warnings }
  }
  if (working.length < MIN_SESSIONS_TARGET) {
    warnings.push(`Proposal has ${working.length} sessions, below the ${MIN_SESSIONS_TARGET}-session target`)
  }
  let trimmed = working
  if (working.length > MAX_SESSIONS_TARGET) {
    warnings.push(`Proposal had ${working.length} sessions; trimmed to ${MAX_SESSIONS_TARGET}`)
    trimmed = working.slice(0, MAX_SESSIONS_TARGET)
  }

  // 5. Clamp week to an integer in [1, 4].
  for (const item of trimmed) {
    const clamped = Math.min(4, Math.max(1, Math.round(Number.isFinite(item.week) ? item.week : 1)))
    if (clamped !== item.week) {
      warnings.push(`Clamped week for "${item.id}" to ${clamped}`)
      item.week = clamped
    }
  }

  // 6. Prerequisites must appear earlier in the list than the session that needs them —
  // reordering ones that are present but too late, and inserting ones the AI omitted entirely.
  // A single left-to-right pass repairs direct prerequisites; the library has chains up to two
  // levels deep (e.g. w4s4 -> w4s1 -> w2s5/w3s3), so a just-inserted prerequisite can itself have
  // unmet prerequisites. Re-running to a fixed point (capped defensively) resolves those too.
  function runPrereqPass(): boolean {
    const orderedIds = trimmed.map((item) => item.id)
    let changed = false
    for (let i = 0; i < trimmed.length; i++) {
      const session = libraryById.get(trimmed[i].id)
      if (!session) continue
      for (const prereqId of session.prerequisites) {
        const prereqIndex = orderedIds.indexOf(prereqId)
        if (prereqIndex === -1) {
          const prereqSession = libraryById.get(prereqId)
          if (!prereqSession) continue
          const inserted: Working = {
            id: prereqId,
            week: trimmed[i].week,
            rationale: "Added automatically as a required prerequisite for another selected session.",
          }
          trimmed.splice(i, 0, inserted)
          orderedIds.splice(i, 0, prereqId)
          warnings.push(`Inserted missing prerequisite "${prereqId}" for "${session.id}"`)
          i += 1 // keep pointing at the session we were examining, now shifted one position later
          changed = true
        } else if (prereqIndex > i) {
          const [prereqItem] = trimmed.splice(prereqIndex, 1)
          const [prereqIdRemoved] = orderedIds.splice(prereqIndex, 1)
          trimmed.splice(i, 0, prereqItem)
          orderedIds.splice(i, 0, prereqIdRemoved)
          warnings.push(`Moved prerequisite "${prereqId}" earlier for "${session.id}"`)
          i += 1 // the session we're examining shifted one position later
          changed = true
        }
      }
    }
    return changed
  }
  for (let pass = 0; pass < 5 && runPrereqPass(); pass++) {
    // keep resolving until a pass makes no further changes, or the safety cap is hit
  }

  // 7. Rationale must be a non-empty string, capped in length.
  for (const item of trimmed) {
    if (!item.rationale.trim()) {
      item.rationale = "Selected based on the patient's tracked data."
      warnings.push(`Missing rationale for "${item.id}"; used a generic placeholder`)
    } else if (item.rationale.length > RATIONALE_MAX_LEN) {
      item.rationale = clampLen(item.rationale, RATIONALE_MAX_LEN)
      warnings.push(`Truncated rationale for "${item.id}" to ${RATIONALE_MAX_LEN} characters`)
    }
  }

  const sessions: ProposedSessionEntry[] = trimmed.map((item, index) => ({
    id: item.id,
    week: item.week,
    order: index,
    rationale: item.rationale,
  }))

  // Skipped list — same id-existence check, no minimum count.
  const skipped: ProposedSkippedEntry[] = []
  const skippedSeen = new Set<string>()
  for (const entry of rawSkipped) {
    if (typeof entry !== "object" || entry === null) continue
    const e = entry as Record<string, unknown>
    const id = typeof e.id === "string" ? e.id : ""
    if (!id || !libraryById.has(id) || skippedSeen.has(id)) continue
    skippedSeen.add(id)
    const reason = typeof e.reason === "string" ? clampLen(e.reason, 300) : ""
    skipped.push({ id, reason })
  }

  // pace
  const rawPace = typeof rawObj.pace === "string" ? rawObj.pace : ""
  const pace: ProgramPace = (VALID_PACES as string[]).includes(rawPace) ? (rawPace as ProgramPace) : "2_per_week"
  if (pace !== rawPace) warnings.push(`Invalid or missing pace; defaulted to "2_per_week"`)

  // summary
  const summary = typeof rawObj.summary === "string" ? clampLen(rawObj.summary.trim(), 400) : ""

  // 8. draftNote — length-capped, HTML stripped.
  let draftNote = typeof rawObj.draftNote === "string" ? stripHtml(rawObj.draftNote) : ""
  if (draftNote.length > DRAFT_NOTE_MAX_LEN) {
    draftNote = clampLen(draftNote, DRAFT_NOTE_MAX_LEN)
    warnings.push(`Truncated draftNote to ${DRAFT_NOTE_MAX_LEN} characters`)
  }

  return {
    ok: true,
    plan: { source: "ai", sessions, skipped, pace, summary, draftNote },
    warnings,
  }
}
