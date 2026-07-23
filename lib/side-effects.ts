export type SideEffectsData = {
  sideEffects: string[]
  sideEffectsOther?: string
}

export const SIDE_EFFECT_LABELS: Record<string, string> = {
  none: "None",
  nausea: "Nausea",
  headache: "Headache",
  dizziness: "Dizziness",
  fatigue: "Fatigue",
  insomnia: "Insomnia",
  appetite_change: "Appetite change",
  anxiety_increase: "Anxiety increase",
  other: "Other",
}

export function normalizeSideEffectsKeys(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map(String)
  return []
}

export function normalizeSideEffectsOther(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined
  const trimmed = input.trim()
  return trimmed ? trimmed : ""
}

export function parseSideEffectsFromDb(
  sideEffects: unknown,
  sideEffectsOther: unknown,
  legacySideEffectsText?: unknown
): SideEffectsData {
  const keys = normalizeSideEffectsKeys(sideEffects)
  const other = normalizeSideEffectsOther(sideEffectsOther)

  if (keys.length > 0) {
    return {
      sideEffects: keys,
      ...(other !== undefined ? { sideEffectsOther: other } : {}),
    }
  }

  if (typeof sideEffects === "string") {
    return parseSideEffectsFromDbText(sideEffects)
  }

  if (legacySideEffectsText !== undefined) {
    return parseSideEffectsFromDbText(legacySideEffectsText)
  }

  return { sideEffects: [] }
}

export function normalizeSideEffects(input: unknown): SideEffectsData {
  if (Array.isArray(input)) {
    return {
      sideEffects: input.map(String),
    }
  }

  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>
    const sideEffectsRaw = obj.sideEffects
    const sideEffectsOtherRaw = obj.sideEffectsOther

    const sideEffects = Array.isArray(sideEffectsRaw)
      ? sideEffectsRaw.map(String)
      : typeof sideEffectsRaw === "string"
        ? [sideEffectsRaw]
        : []

    const sideEffectsOther = typeof sideEffectsOtherRaw === "string" ? sideEffectsOtherRaw : undefined

    return {
      sideEffects: sideEffects.length > 0 ? sideEffects : ["none"],
      ...(sideEffectsOther ? { sideEffectsOther } : {}),
    }
  }

  const asString = typeof input === "string" ? input.trim() : ""
  if (!asString) return { sideEffects: ["none"] }
  return { sideEffects: [asString] }
}

export function parseSideEffectsFromDbText(sideEffectsText: unknown): SideEffectsData {
  if (typeof sideEffectsText !== "string") return { sideEffects: ["none"] }

  const trimmed = sideEffectsText.trim()
  if (!trimmed) return { sideEffects: ["none"] }

  try {
    const parsed = JSON.parse(trimmed)
    return normalizeSideEffects(parsed)
  } catch {
    return normalizeSideEffects(trimmed)
  }
}

export function formatSideEffectsForDisplay(data: SideEffectsData): string {
  const sideEffects = data.sideEffects ?? []
  const filtered = sideEffects.filter((s) => s && s !== "none" && s !== "other")

  const parts: string[] = []

  if (sideEffects.includes("none")) {
    parts.push("None")
  } else {
    parts.push(...filtered.map((k) => SIDE_EFFECT_LABELS[k] ?? k))
    if (sideEffects.includes("other") && data.sideEffectsOther?.trim()) {
      parts.push(`Other: ${data.sideEffectsOther.trim()}`)
    }
  }

  return parts.join(", ")
}

export function sideEffectsKeyToLabel(key: string): string {
  return SIDE_EFFECT_LABELS[key] ?? key
}
