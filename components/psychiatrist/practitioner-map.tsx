"use client"

import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle, useMap } from "react-leaflet"
import { useTheme } from "next-themes"
import { Plus, Minus, LocateFixed, Maximize2, Minimize2 } from "lucide-react"
import L from "leaflet"
import type { PractitionerWithDistance } from "@/hooks/use-practitioners"

const TUNIS_CENTER: [number, number] = [36.81, 10.18]
const COLLAPSED_HEIGHT = 220
const EXPANDED_HEIGHT = 420

const TILE_URLS = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
}

// Inner ".mb-pin" div is what actually scales on hover (see globals.css) --
// the outer wrapper Leaflet positions via inline transform, so it's left alone.
function createIcon(color: string, size = 32) {
  return L.divIcon({
    className: "",
    html: `
      <div class="mb-pin" style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

function createUserIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">
        <span class="absolute inline-flex h-4 w-4 animate-pulse-ring rounded-full bg-[#3b82f6]"></span>
        <div style="width:14px; height:14px; border-radius:50%; background:#3b82f6; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); position:relative; z-index:1;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

const ICONS = {
  premium: createIcon("#f59e0b"),
  basic: createIcon("#22c55e"),
  selected: createIcon("#e63946"),
  user: createUserIcon(),
}

// Flies the map to a new center whenever it changes (e.g. selecting a card).
function MapController({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 0.8 })
    }
  }, [center, zoom, map])
  return null
}

// Fits every marker (practitioners + user) in view when nothing is selected.
// Without this, a fixed zoom can leave farther-out practitioners outside the
// map's visible bounds in a short container.
function FitBoundsController({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 13)
      return
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [28, 28], maxZoom: 14 })
  }, [positions, map])
  return null
}

// Leaflet caches pixel dimensions -- after the container's CSS height
// changes (expand/collapse), it needs a nudge once the transition settles.
function ResizeOnChange({ trigger }: { trigger: unknown }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 260)
    return () => clearTimeout(t)
  }, [trigger, map])
  return null
}

// Scroll-to-zoom only while the cursor is actually over the map, so the page
// itself never gets hijacked mid-scroll.
function ScrollZoomOnHover() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const enable = () => map.scrollWheelZoom.enable()
    const disable = () => map.scrollWheelZoom.disable()
    el.addEventListener("mouseenter", enable)
    el.addEventListener("mouseleave", disable)
    return () => {
      el.removeEventListener("mouseenter", enable)
      el.removeEventListener("mouseleave", disable)
    }
  }, [map])
  return null
}

function MapControls({
  userLocation,
  expanded,
  onToggleExpand,
}: {
  userLocation: { lat: number; lng: number } | null
  expanded: boolean
  onToggleExpand: () => void
}) {
  const map = useMap()
  const btn =
    "flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-40"
  const group = "flex flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-sm backdrop-blur-sm"

  return (
    <div className="absolute right-2 top-2 z-[1000] flex flex-col gap-1.5">
      <div className={group}>
        <button type="button" className={btn} onClick={() => map.zoomIn()} aria-label="Zoom in">
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border" />
        <button type="button" className={btn} onClick={() => map.zoomOut()} aria-label="Zoom out">
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {userLocation && (
        <button
          type="button"
          className={`${group} ${btn}`}
          onClick={() => map.flyTo([userLocation.lat, userLocation.lng], 14, { animate: true, duration: 0.6 })}
          aria-label="Recenter on my location"
          title="Recenter on my location"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      )}

      <button
        type="button"
        className={`${group} ${btn}`}
        onClick={onToggleExpand}
        aria-label={expanded ? "Collapse map" : "Expand map"}
        title={expanded ? "Collapse map" : "Expand map"}
      >
        {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

export function PractitionerMap({
  practitioners,
  userLocation,
  selectedId,
  onSelect,
  radiusKm = 20,
}: {
  practitioners: PractitionerWithDistance[]
  userLocation: { lat: number; lng: number } | null
  selectedId: string | null
  onSelect: (id: string) => void
  radiusKm?: number
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => setMounted(true), [])
  const tileUrl = mounted && resolvedTheme === "dark" ? TILE_URLS.dark : TILE_URLS.light

  const defaultCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : TUNIS_CENTER

  const selectedDoc = practitioners.find((p) => p.id === selectedId)
  const flyTarget: [number, number] | null =
    selectedDoc && selectedDoc.latitude != null && selectedDoc.longitude != null
      ? [selectedDoc.latitude, selectedDoc.longitude]
      : null

  const withCoords = useMemo(
    () => practitioners.filter((p): p is PractitionerWithDistance & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null,
    ),
    [practitioners],
  )

  const allPositions = useMemo<[number, number][]>(() => {
    const pts = withCoords.map((p): [number, number] => [p.latitude, p.longitude])
    if (userLocation) pts.push([userLocation.lat, userLocation.lng])
    return pts
  }, [withCoords, userLocation])

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border"
      style={{ height: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT, width: "100%", transition: "height 0.25s ease" }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        doubleClickZoom
        touchZoom
      >
        <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap contributors &copy; CARTO" />

        {flyTarget ? (
          <MapController center={flyTarget} zoom={15} />
        ) : (
          <FitBoundsController positions={allPositions} />
        )}
        <ResizeOnChange trigger={expanded} />
        <ScrollZoomOnHover />

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={ICONS.user}>
              <Popup>
                <div className="text-xs font-semibold text-foreground">📍 Your location</div>
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: "#2a9d8f", fillColor: "#2a9d8f", fillOpacity: 0.04, weight: 1, dashArray: "4 4" }}
            />
          </>
        )}

        {withCoords.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={p.id === selectedId ? ICONS.selected : p.plan === "premium" ? ICONS.premium : ICONS.basic}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Tooltip className="mb-tooltip" direction="top" offset={[0, -30]} opacity={1}>
              {p.full_name} · {p.specialty}
            </Tooltip>
            <Popup>
              <div className="min-w-[160px] p-1">
                <div className="mb-0.5 text-xs font-bold text-foreground">{p.full_name}</div>
                <div className="mb-1.5 text-[11px] text-[#2a9d8f]">{p.specialty}</div>
                {p.address && <div className="mb-1.5 text-[10px] text-muted-foreground">📍 {p.address}</div>}
                {p.plan === "premium" && (
                  <span className="rounded-full border border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.15)] px-1.5 py-0.5 text-[9px] font-bold text-[#d97706]">
                    ⭐ Featured
                  </span>
                )}
                <div className="mt-2">
                  <button
                    onClick={() => onSelect(p.id)}
                    className="w-full rounded-md bg-[#2a9d8f] py-1 text-[11px] font-semibold text-white"
                  >
                    View profile →
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapControls userLocation={userLocation} expanded={expanded} onToggleExpand={() => setExpanded((v) => !v)} />
      </MapContainer>

      <div className="pointer-events-none absolute bottom-2 left-2 z-[1000] flex items-center gap-3 rounded-lg bg-card/90 px-2.5 py-1.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
        <span>🔵 You</span>
        <span>🟢 Basic</span>
        <span>⭐ Premium</span>
      </div>
    </div>
  )
}
