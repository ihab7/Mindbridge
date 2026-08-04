// Free address <-> lat/lng geocoding via Nominatim (OpenStreetMap). No API
// key required.
//
// Nominatim's usage policy asks for a descriptive User-Agent identifying the
// app, but browsers silently ignore attempts to set that header from
// client-side fetch -- it's not something JS can override (User-Agent is a
// forbidden header name per the Fetch spec). The header is still set below
// so a future server-side proxy only needs to move this code, not rewrite
// it; in the browser today it's simply dropped by the engine. All calls in
// this module are on-blur/debounced usage, well under Nominatim's 1 req/sec
// limit -- a self-hosted or paid provider would be the right move at real
// volume.

// Used by the practitioner registration form (single best match).
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const encoded = encodeURIComponent(address)
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`

  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  }
}

export type GeocodeSuggestion = { lat: number; lng: number; label: string }

// Used by the patient-facing psychiatrist finder's location input (up to 5
// suggestions as the patient types). `countryCodes` biases results (e.g.
// "tn" for Tunisia) without hard-excluding other countries' patients.
export async function geocodeSuggestions(
  query: string,
  { countryCodes }: { countryCodes?: string } = {},
): Promise<GeocodeSuggestion[]> {
  const params = new URLSearchParams({
    format: "json",
    limit: "5",
    addressdetails: "1",
    "accept-language": "fr",
    q: query,
  })
  if (countryCodes) params.set("countrycodes", countryCodes)

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { "User-Agent": "MindBridge/1.0 (contact@mindbridge.app)" },
  })
  if (!res.ok) return []

  const data = await res.json()
  if (!Array.isArray(data)) return []

  return data.map((r: { lat: string; lon: string; display_name: string }) => ({
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    label: r.display_name,
  }))
}

// Turns a coordinate pair into a short, readable label ("Ariana, Tunisie")
// instead of Nominatim's full multi-line display_name.
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const fallback = `${lat.toFixed(3)}, ${lng.toFixed(3)}`
  const params = new URLSearchParams({
    format: "json",
    lat: String(lat),
    lon: String(lng),
    zoom: "12",
    addressdetails: "1",
    "accept-language": "fr",
  })

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: { "User-Agent": "MindBridge/1.0 (contact@mindbridge.app)" },
    })
    if (!res.ok) return fallback

    const data = await res.json()
    const addr = data?.address ?? {}
    const place: string | undefined =
      addr.suburb || addr.city_district || addr.town || addr.village || addr.municipality || addr.city || addr.county
    const country: string | undefined = addr.country

    if (place && country) return `${place}, ${country}`
    if (typeof data?.display_name === "string") {
      return data.display_name.split(",").slice(0, 2).join(",").trim()
    }
    return fallback
  } catch {
    return fallback
  }
}
