"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Loader2, LocateFixed, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { geocodeAddress, reverseGeocodeAddress } from "@/lib/geocode"
import type { LatLng, MapView } from "./location-picker-map"

const LocationPickerMap = dynamic(() => import("./location-picker-map").then((m) => m.LocationPickerMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/40">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ),
})

export type PickedLocation = LatLng & {
  /** Street line from reverse geocoding; "" when the lookup failed. */
  address: string
  city: string
  /** Human-readable preview; "" when the lookup failed. */
  label: string
}

// Whole-country view, same default the patient finder uses.
const TUNISIA_VIEW: MapView = { center: { lat: 34.0, lng: 9.5 }, zoom: 6 }
const SELECTED_ZOOM = 17
const LOOKUP_DEBOUNCE_MS = 600
const LOOKUP_TIMEOUT_MS = 6000

type Lookup =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; address: string; city: string; label: string }
  | { status: "failed" }

type GeoState = { status: "idle" } | { status: "locating" } | { status: "error"; message: string } | { status: "info"; message: string }

/**
 * Lets a practitioner put a pin on their cabinet. The map lives only while the
 * dialog is open (Radix unmounts closed content), so every opening starts from
 * `value` — reopening shows the previously confirmed pin, ready to move.
 */
export function LocationPickerDialog({
  open,
  onOpenChange,
  value,
  addressHint,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The currently confirmed location, if any. */
  value: PickedLocation | null
  /** What the practitioner typed so far — used only to centre the map when no pin exists yet. */
  addressHint: { address: string; city: string }
  onConfirm: (location: PickedLocation) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <PickerBody
          value={value}
          addressHint={addressHint}
          onCancel={() => onOpenChange(false)}
          onConfirm={(loc) => {
            onConfirm(loc)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function PickerBody({
  value,
  addressHint,
  onCancel,
  onConfirm,
}: {
  value: PickedLocation | null
  addressHint: { address: string; city: string }
  onCancel: () => void
  onConfirm: (location: PickedLocation) => void
}) {
  const [draft, setDraft] = useState<LatLng | null>(value ? { lat: value.lat, lng: value.lng } : null)
  const [lookup, setLookup] = useState<Lookup>(
    value?.label ? { status: "done", address: value.address, city: value.city, label: value.label } : { status: "idle" },
  )
  const [geo, setGeo] = useState<GeoState>({ status: "idle" })
  const [flyTo, setFlyTo] = useState<(MapView & { key: number }) | null>(null)
  const [initialView] = useState<MapView>(() =>
    value ? { center: { lat: value.lat, lng: value.lng }, zoom: SELECTED_ZOOM } : TUNISIA_VIEW,
  )

  const fly = useCallback((center: LatLng, zoom: number) => {
    setFlyTo({ center, zoom, key: Date.now() })
  }, [])

  // No pin yet: centre on whatever the practitioner already typed, without
  // placing a pin — the exact spot is theirs to choose.
  useEffect(() => {
    if (value) return
    const address = addressHint.address.trim()
    const city = addressHint.city.trim()
    if (!address && !city) return
    let cancelled = false
    ;(async () => {
      const street = address ? await geocodeAddress([address, city, "Tunisia"].filter(Boolean).join(", ")).catch(() => null) : null
      if (cancelled) return
      if (street) return fly({ lat: street.lat, lng: street.lng }, 16)
      if (!city) return
      const town = await geocodeAddress(`${city}, Tunisia`).catch(() => null)
      if (!cancelled && town) fly({ lat: town.lat, lng: town.lng }, 13)
    })()
    return () => {
      cancelled = true
    }
    // Runs once per opening; the hint is a snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reverse-geocode the pin, debounced so dragging doesn't hammer Nominatim
  // (1 req/s policy). Stale requests are aborted.
  useEffect(() => {
    if (!draft) return
    // The pin we were opened with already has its address — no lookup.
    // (A comparison, not a one-shot flag: dev Strict Mode runs effects twice.)
    if (value?.label && draft.lat === value.lat && draft.lng === value.lng) {
      setLookup({ status: "done", address: value.address, city: value.city, label: value.label })
      return
    }
    setLookup({ status: "loading" })
    const controller = new AbortController()
    let superseded = false
    const debounce = setTimeout(async () => {
      // A timed-out request resolves to null like any other failure.
      const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS)
      const result = await reverseGeocodeAddress(draft.lat, draft.lng, controller.signal)
      clearTimeout(timeout)
      if (superseded) return
      setLookup(result ? { status: "done", ...result } : { status: "failed" })
    }, LOOKUP_DEBOUNCE_MS)
    return () => {
      superseded = true
      clearTimeout(debounce)
      controller.abort()
    }
    // `value` is fixed for the life of this body (remounted on every opening).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const handlePick = useCallback((p: LatLng) => {
    setDraft(p)
    setGeo((g) => (g.status === "error" ? { status: "idle" } : g))
  }, [])

  function locateMe() {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeo({ status: "error", message: "Your browser doesn't support location access. Tap the map to place your cabinet." })
      return
    }
    if (!window.isSecureContext) {
      setGeo({
        status: "error",
        message: "Location access needs a secure (HTTPS) connection. Tap the map to place your cabinet instead.",
      })
      return
    }
    setGeo({ status: "locating" })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setDraft(p)
        fly(p, SELECTED_ZOOM)
        const accuracy = Math.round(pos.coords.accuracy)
        setGeo(
          accuracy > 100
            ? { status: "info", message: `Approximate position (±${accuracy} m). Drag the pin onto your cabinet's exact spot.` }
            : { status: "idle" },
        )
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. You can still tap the map to place your cabinet."
            : err.code === err.TIMEOUT
              ? "Finding your location took too long. Try again, or tap the map to place your cabinet."
              : "Your location isn't available right now. Tap the map to place your cabinet."
        setGeo({ status: "error", message })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  function confirm() {
    if (!draft) return
    const resolved = lookup.status === "done" ? lookup : { address: "", city: "", label: "" }
    onConfirm({ lat: draft.lat, lng: draft.lng, address: resolved.address, city: resolved.city, label: resolved.label })
  }

  const lookingUp = lookup.status === "loading"

  return (
    <>
      <DialogHeader className="px-5 pb-3 pt-5 text-start sm:text-start">
        {/* pr-8, not pe-8: the shared dialog pins its close button to the physical right in both directions. */}
        <DialogTitle className="pr-8 text-base">Locate your cabinet</DialogTitle>
        <DialogDescription>Tap the map to place the pin, then drag it to adjust.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
        <button
          type="button"
          onClick={locateMe}
          disabled={geo.status === "locating"}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          {geo.status === "locating" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LocateFixed className="h-3.5 w-3.5 text-primary" />
          )}
          Use my current location
        </button>
        {(geo.status === "error" || geo.status === "info") && (
          <p
            role="status"
            className={`basis-full text-xs ${geo.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {geo.message}
          </p>
        )}
      </div>

      <div className="relative h-[48dvh] min-h-[260px] border-y border-border sm:h-[400px]">
        <LocationPickerMap initialView={initialView} flyTo={flyTo} value={draft} onPick={handlePick} />
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="flex min-h-[2.5rem] items-start gap-2" aria-live="polite">
          <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${draft ? "text-primary" : "text-muted-foreground"}`} />
          {draft ? (
            <div className="min-w-0 text-sm">
              <p className="text-foreground">
                {lookup.status === "done"
                  ? lookup.label
                  : lookingUp
                    ? "Finding the address…"
                    : "Address not found — the pin position will still be saved."}
              </p>
              <p className="mt-0.5 text-xs tabular-nums text-muted-foreground" dir="ltr">
                {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No location selected yet.</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!draft || lookingUp}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {lookingUp && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm location
          </button>
        </DialogFooter>
      </div>
    </>
  )
}
