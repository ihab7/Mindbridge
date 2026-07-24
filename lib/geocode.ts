// Free address -> lat/lng geocoding via Nominatim (OpenStreetMap), used by
// the practitioner registration form. No API key required.
//
// Nominatim's usage policy asks for a descriptive User-Agent identifying the
// app, but browsers silently ignore attempts to set that header from
// client-side fetch -- it's not something JS can override. That's fine for
// this form's light, on-blur usage (well under Nominatim's 1 req/sec limit);
// a self-hosted or paid provider would be the right move at real volume.
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
