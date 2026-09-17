"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import { Plus, Minus } from "lucide-react"
import { createIcon } from "./practitioner-map"

export type LatLng = { lat: number; lng: number }
export type MapView = { center: LatLng; zoom: number }

// Leaflet touches `window` at import time, so this file is only ever loaded
// through next/dynamic with ssr: false (see location-picker-dialog.tsx).

// Standard OpenStreetMap tiles, not the CARTO basemaps the finder uses: CARTO
// now serves "API KEY REQUIRED" watermarks without a key, and OSM's own style
// shows street names and building-level detail, which is what pinning an
// exact cabinet needs. No key involved. Dark mode is a CSS filter on the tile
// pane only (globals.css, .mb-picker-map) so pin and controls keep their colours.
const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
const OSM_MAX_ZOOM = 19

/** Click / tap anywhere on the map moves the pin there. */
function PickOnClick({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  })
  return null
}

/**
 * Leaflet measures its container once. Inside a dialog that is still running
 * its open animation (zoom-in-95) that measurement is wrong, which shows as
 * grey tiles and an off-centre pin — so re-measure whenever the box resizes.
 */
function KeepSized() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)
    const t = setTimeout(() => map.invalidateSize(), 250)
    return () => {
      ro.disconnect()
      clearTimeout(t)
    }
  }, [map])
  return null
}

/** Imperative recentring (geolocation, address hint). `view.key` makes repeats fire. */
function FlyTo({ view }: { view: (MapView & { key: number }) | null }) {
  const map = useMap()
  useEffect(() => {
    if (view) map.flyTo([view.center.lat, view.center.lng], view.zoom, { duration: 0.6 })
  }, [view, map])
  return null
}

function ZoomControls({ zoomInLabel, zoomOutLabel }: { zoomInLabel: string; zoomOutLabel: string }) {
  const map = useMap()
  const btn = "flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-muted"
  return (
    <div className="absolute top-2 z-[1000] flex flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-sm backdrop-blur-sm [inset-inline-end:0.5rem]">
      <button type="button" className={btn} onClick={() => map.zoomIn()} aria-label={zoomInLabel}>
        <Plus className="h-4 w-4" />
      </button>
      <div className="h-px bg-border" />
      <button type="button" className={btn} onClick={() => map.zoomOut()} aria-label={zoomOutLabel}>
        <Minus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function LocationPickerMap({
  initialView,
  flyTo,
  value,
  onPick,
}: {
  /** Only read on mount — later moves go through `flyTo`. */
  initialView: MapView
  flyTo: (MapView & { key: number }) | null
  value: LatLng | null
  onPick: (p: LatLng) => void
}) {
  // Same pin shape as the finder, in the MindBridge teal.
  const icon = useMemo(() => createIcon("hsl(var(--primary))", 34), [])

  return (
    <MapContainer
      center={[initialView.center.lat, initialView.center.lng]}
      zoom={initialView.zoom}
      className="mb-picker-map"
      style={{ height: "100%", width: "100%" }}
      maxZoom={OSM_MAX_ZOOM}
      zoomControl={false}
      scrollWheelZoom
      doubleClickZoom
      touchZoom
    >
      {/* Attribution stays on: the OSM tile policy requires it. */}
      <TileLayer url={OSM_TILES} maxZoom={OSM_MAX_ZOOM} attribution="&copy; OpenStreetMap contributors" />
      <KeepSized />
      <FlyTo view={flyTo} />
      <PickOnClick onPick={onPick} />
      <ZoomControls zoomInLabel="Zoom in" zoomOutLabel="Zoom out" />

      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={icon}
          draggable
          keyboard={false}
          eventHandlers={{
            dragend: (e) => {
              const p = e.target.getLatLng()
              onPick({ lat: p.lat, lng: p.lng })
            },
          }}
        />
      )}
    </MapContainer>
  )
}
