"use client"

import { useMemo } from "react"
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api"
import type { PractitionerWithDistance } from "@/hooks/use-practitioners"

const TUNIS_CENTER = { lat: 36.81, lng: 10.18 }
const MAP_CONTAINER_STYLE = { width: "100%", height: "220px", borderRadius: "14px" }

const COLOR_USER = "#3b82f6"
const COLOR_BASIC = "#22c55e"
const COLOR_PREMIUM = "#f59e0b"
const COLOR_SELECTED = "#e63946"

function pinIcon(color: string, scale: number): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: scale * 8,
  }
}

type MapProps = {
  practitioners: PractitionerWithDistance[]
  userLocation: { lat: number; lng: number } | null
  selectedId: string | null
  onSelect: (id: string) => void
}

export function PractitionerMap(props: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  // No key -> render the dependency-free fallback and stop here. Splitting
  // the Google Maps branch into its own component (below) means
  // useJsApiLoader only ever mounts -- and only ever injects Google's script
  // -- once a real key exists. Keeping the hook call in *this* component
  // (even with an empty key) would still fire a network request to Google
  // and log a "NoApiKeys" console warning on every load.
  if (!apiKey) {
    return <LightweightMap {...props} />
  }

  return <GoogleMapsView {...props} apiKey={apiKey} />
}

function GoogleMapsView(props: MapProps & { apiKey: string }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "mindbridge-google-maps",
    googleMapsApiKey: props.apiKey,
  })

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-border bg-muted/40 px-4 text-center text-sm text-destructive"
        style={{ height: 220 }}
      >
        Failed to load Google Maps.
      </div>
    )
  }

  if (!isLoaded) {
    return <div className="animate-pulse rounded-2xl bg-muted" style={{ height: 220, width: "100%" }} />
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={props.userLocation ?? TUNIS_CENTER}
        zoom={13}
        options={{
          disableDefaultUI: true,
          gestureHandling: "cooperative",
          zoomControl: true,
        }}
      >
        {props.userLocation && (
          <MarkerF position={props.userLocation} icon={pinIcon(COLOR_USER, 1)} title="You" />
        )}

        {props.practitioners
          .filter((p) => p.latitude != null && p.longitude != null)
          .map((p) => {
            const isSelected = p.id === props.selectedId
            const color = isSelected ? COLOR_SELECTED : p.plan === "premium" ? COLOR_PREMIUM : COLOR_BASIC
            return (
              <MarkerF
                key={p.id}
                position={{ lat: p.latitude as number, lng: p.longitude as number }}
                icon={pinIcon(color, isSelected ? 1.2 : 1)}
                label={p.plan === "premium" ? { text: "★", color: "#ffffff", fontSize: "10px" } : undefined}
                title={p.full_name}
                onClick={() => props.onSelect(p.id)}
              />
            )
          })}
      </GoogleMap>

      <MapLegend />
    </div>
  )
}

function MapLegend() {
  return (
    <div className="absolute bottom-2 left-2 flex items-center gap-3 rounded-lg bg-card/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
      <span>🔵 You</span>
      <span>🟢 Basic</span>
      <span>⭐ Premium</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// No-key fallback: a dependency-free, key-free "map" that plots pins by
// projecting lat/lng onto a stylized panel using plain linear interpolation
// (accurate enough at city scale, not a real projection). Swap back to the
// GoogleMap branch above automatically the moment NEXT_PUBLIC_GOOGLE_MAPS_KEY
// is set in .env.local -- no other code changes needed.
// ---------------------------------------------------------------------------

const FALLBACK_PADDING_RATIO = 0.18
const MIN_SPAN = 0.03 // degrees; keeps points from collapsing to one spot

function LightweightMap({ practitioners, userLocation, selectedId, onSelect }: MapProps) {
  const points = useMemo(() => {
    const withCoords = practitioners.filter(
      (p): p is PractitionerWithDistance & { latitude: number; longitude: number } =>
        p.latitude != null && p.longitude != null,
    )

    const lats = withCoords.map((p) => p.latitude).concat(userLocation ? [userLocation.lat] : [])
    const lngs = withCoords.map((p) => p.longitude).concat(userLocation ? [userLocation.lng] : [])

    if (lats.length === 0) {
      lats.push(TUNIS_CENTER.lat)
      lngs.push(TUNIS_CENTER.lng)
    }

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const latSpan = Math.max(maxLat - minLat, MIN_SPAN)
    const lngSpan = Math.max(maxLng - minLng, MIN_SPAN)
    const latPad = latSpan * FALLBACK_PADDING_RATIO
    const lngPad = lngSpan * FALLBACK_PADDING_RATIO

    const bounds = {
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
    }

    function project(lat: number, lng: number) {
      const left = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100
      const top = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100
      return { left: `${left}%`, top: `${top}%` }
    }

    return {
      user: userLocation ? project(userLocation.lat, userLocation.lng) : null,
      practitioners: withCoords.map((p) => ({ practitioner: p, pos: project(p.latitude, p.longitude) })),
    }
  }, [practitioners, userLocation])

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border"
      style={{
        height: 220,
        width: "100%",
        backgroundColor: "hsl(var(--muted))",
        backgroundImage:
          "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <span className="absolute right-2 top-2 rounded-md bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm">
        Map preview -- add NEXT_PUBLIC_GOOGLE_MAPS_KEY for live map
      </span>

      {points.user && (
        <div
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ ...points.user, backgroundColor: COLOR_USER }}
          title="You"
        />
      )}

      {points.practitioners.map(({ practitioner: p, pos }) => {
        const isSelected = p.id === selectedId
        const color = isSelected ? COLOR_SELECTED : p.plan === "premium" ? COLOR_PREMIUM : COLOR_BASIC
        return (
          <button
            key={p.id}
            type="button"
            title={p.full_name}
            onClick={() => onSelect(p.id)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white shadow transition-transform duration-200 hover:scale-125"
            style={{
              ...pos,
              width: isSelected ? 18 : 14,
              height: isSelected ? 18 : 14,
              backgroundColor: color,
            }}
          >
            {p.plan === "premium" ? "★" : ""}
          </button>
        )
      })}

      <MapLegend />
    </div>
  )
}
