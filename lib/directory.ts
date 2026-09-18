// Shared types and helpers for the "Find a Psychiatrist Near You" directory.
// Practitioners are cabinets/doctors who pay MindBridge to be listed here --
// this is separate from the `users` table's platform "practitioner" role.

export type OpeningHours = Record<string, string>

export type Practitioner = {
  id: string
  /** Listing belongs to a MindBridge practitioner account (who can issue linking codes). */
  has_account: boolean
  full_name: string
  specialty: string
  bio: string
  address: string | null
  city: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  website: string | null
  languages: string[]
  experience_years: number | null
  tags: string[]
  /** Profile photo of the listing's practitioner account (public), or null → initial. */
  photo_url: string | null
  opening_hours: OpeningHours
  plan: "basic" | "premium"
  is_verified: boolean
}

/**
 * Name without a leading "Dr"/"Dr." — for copy that already says "Dr. {name}"
 * ("Dr. Melek Hajri" → "Melek Hajri", "DR.Harbaoui" → "Harbaoui"), so it never
 * reads "Dr. Dr. …".
 */
export function withoutDoctorPrefix(name: string): string {
  // \b: "Drew Smith" and "Driss" keep their names — only a standalone "Dr" title is dropped.
  return name.replace(/^\s*dr\b\.?\s*/i, "").trim() || name
}

export type CabinetContactErrorCode = "cabinet_contact_required" | "invalid_cabinet_phone" | "invalid_cabinet_email"

/**
 * Public cabinet contact of a directory listing (practitioners.phone / .email).
 * At least one is required — a published listing nobody can reach breaks the
 * patient path (contact the cabinet → receive a linking code). Shared by /join
 * (browser + API) and the Settings listing editor so the rule never diverges.
 * Error codes map to i18n keys practitioner.cabinetContact.errors.*.
 */
export function validateCabinetContact(
  phone: unknown,
  email: unknown,
): { ok: true; phone: string; email: string } | { ok: false; errorCode: CabinetContactErrorCode } {
  const p = typeof phone === "string" ? phone.trim() : ""
  const e = typeof email === "string" ? email.trim() : ""
  if (!p && !e) return { ok: false, errorCode: "cabinet_contact_required" }
  if (p && (p.length > 50 || !/^[+()\d\s.-]{6,}$/.test(p))) return { ok: false, errorCode: "invalid_cabinet_phone" }
  if (e && (e.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))) return { ok: false, errorCode: "invalid_cabinet_email" }
  return { ok: true, phone: p, email: e }
}

export const CABINET_CONTACT_ERROR_KEYS: Record<CabinetContactErrorCode, string> = {
  cabinet_contact_required: "practitioner.cabinetContact.errors.required",
  invalid_cabinet_phone: "practitioner.cabinetContact.errors.invalidPhone",
  invalid_cabinet_email: "practitioner.cabinetContact.errors.invalidEmail",
}

export const SPECIALTY_TAGS = [
  "Anxiety",
  "Depression",
  "ADHD",
  "Trauma",
  "OCD",
  "Addiction",
  "Child psychiatry",
  "Adolescents",
  "Couples therapy",
  "Sleep disorders",
  "Eating disorders",
  "Psychotherapy",
  "CBT",
  "Sexology",
  "Geriatrics",
  "Other",
] as const

export const LANGUAGE_OPTIONS = ["Arabic", "French", "English", "Other"] as const

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

const DAY_ABBR: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
}

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Parses keys like "Mon–Fri", "Mon-Sat", "Saturday", "Sunday" and values
// like "9:00–18:00" or "Closed" to decide whether `opening_hours` covers the
// current moment. Best-effort: unrecognized keys/values are skipped.
export function isOpenNow(openingHours: OpeningHours | null | undefined): boolean {
  if (!openingHours) return false
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours() + now.getMinutes() / 60

  for (const [rawKey, rawValue] of Object.entries(openingHours)) {
    const value = rawValue.trim().toLowerCase()
    if (value === "closed" || value === "") continue

    const dayTokens = rawKey.split(/[–\-]/).map((t) => t.trim().toLowerCase())
    const startDay = DAY_ABBR[dayTokens[0]]
    const endDay = DAY_ABBR[dayTokens[dayTokens.length - 1]]
    if (startDay === undefined || endDay === undefined) continue

    const inRange =
      startDay <= endDay ? day >= startDay && day <= endDay : day >= startDay || day <= endDay
    if (!inRange) continue

    const timeMatch = rawValue.match(/(\d{1,2})[:h](\d{2})\s*[–\-]\s*(\d{1,2})[:h](\d{2})/)
    if (!timeMatch) continue
    const [, sh, sm, eh, em] = timeMatch
    const start = Number(sh) + Number(sm) / 60
    const end = Number(eh) + Number(em) / 60
    if (hour >= start && hour < end) return true
  }

  return false
}
