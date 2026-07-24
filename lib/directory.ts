// Shared types and helpers for the "Find a Psychiatrist Near You" directory.
// Practitioners are cabinets/doctors who pay MindBridge to be listed here --
// this is separate from the `users` table's platform "practitioner" role.

export type OpeningHours = Record<string, string>

export type Practitioner = {
  id: string
  user_id: number | null
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
  avatar_url: string
  opening_hours: OpeningHours
  plan: "basic" | "premium"
  is_verified: boolean
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
