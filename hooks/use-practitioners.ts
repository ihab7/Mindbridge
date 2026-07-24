import useSWR from "swr"
import { useMemo } from "react"
import { getDistanceKm, type Practitioner } from "@/lib/directory"

export type PractitionerWithDistance = Practitioner & { distanceKm: number | null }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function usePractitioners(userLocation: { lat: number; lng: number } | null, radiusKm = 20) {
  const { data, error, isLoading } = useSWR<{ practitioners: Practitioner[]; isLoggedIn: boolean }>(
    "/api/directory/practitioners",
    fetcher,
  )

  const practitioners = useMemo<PractitionerWithDistance[]>(() => {
    const raw = data?.practitioners ?? []

    const withDistance = raw.map((p) => ({
      ...p,
      distanceKm:
        userLocation && p.latitude != null && p.longitude != null
          ? getDistanceKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude)
          : null,
    }))

    const withinRadius = userLocation
      ? withDistance.filter((p) => p.distanceKm === null || p.distanceKm <= radiusKm)
      : withDistance

    return withinRadius.sort((a, b) => {
      if (a.plan === "premium" && b.plan !== "premium") return -1
      if (b.plan === "premium" && a.plan !== "premium") return 1
      if (a.distanceKm === null) return 1
      if (b.distanceKm === null) return -1
      return a.distanceKm - b.distanceKm
    })
  }, [data, userLocation, radiusKm])

  return {
    practitioners,
    isLoggedIn: data?.isLoggedIn ?? false,
    loading: isLoading,
    error: error ? "Failed to load practitioners" : null,
  }
}
