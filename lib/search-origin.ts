// Single source of truth for the psychiatrist finder's search origin --
// where distances, the radius circle, and the result list are all computed
// from. Persisted client-side only (localStorage); never sent to or stored
// on the server.

export type SearchOrigin = {
  lat: number
  lng: number
  label: string
  source: "geolocation" | "manual" | "default"
}

const ORIGIN_KEY = "mb_search_origin"
const RADIUS_KEY = "mb_search_radius_km"

function isSearchOrigin(value: unknown): value is SearchOrigin {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.lat === "number" &&
    typeof v.lng === "number" &&
    typeof v.label === "string" &&
    (v.source === "geolocation" || v.source === "manual" || v.source === "default")
  )
}

export function loadStoredOrigin(): SearchOrigin | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(ORIGIN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isSearchOrigin(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function storeOrigin(origin: SearchOrigin | null): void {
  if (typeof window === "undefined") return
  try {
    if (origin) window.localStorage.setItem(ORIGIN_KEY, JSON.stringify(origin))
    else window.localStorage.removeItem(ORIGIN_KEY)
  } catch {
    // localStorage unavailable (private browsing, quota) -- degrade to session-only silently
  }
}

export function loadStoredRadiusKm(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(RADIUS_KEY)
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

export function storeRadiusKm(radiusKm: number): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(RADIUS_KEY, String(radiusKm))
  } catch {
    // ignore
  }
}
