"use client"

import { useEffect, useId, useRef, useState } from "react"
import { LocateFixed, Loader2, MapPin } from "lucide-react"
import { geocodeSuggestions, reverseGeocode, type GeocodeSuggestion } from "@/lib/geocode"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { SearchOrigin } from "@/lib/search-origin"

// Biases Nominatim results to Tunisia without hard-excluding other
// countries. Kept as a single constant so it's easy to make configurable
// (e.g. per-deployment) later.
const COUNTRY_CODES = "tn"
const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 600

export function LocationInput({
  onResolved,
  autoFocus = false,
}: {
  onResolved: (origin: SearchOrigin) => void
  autoFocus?: boolean
}) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // Fires at most once per debounce window, and never below the minimum
  // query length -- keeps this well under Nominatim's 1 req/sec policy.
  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setSearching(false)
      return
    }

    let cancelled = false
    setSearching(true)
    geocodeSuggestions(trimmed, { countryCodes: COUNTRY_CODES })
      .then((results) => {
        if (!cancelled) setSuggestions(results)
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })
      .finally(() => {
        if (!cancelled) setSearching(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  function selectSuggestion(s: GeocodeSuggestion) {
    setQuery(s.label)
    setSuggestions([])
    setSuggestionsOpen(false)
    setGeoError(null)
    onResolved({ lat: s.lat, lng: s.lng, label: s.label, source: "manual" })
  }

  function handleLocate() {
    setGeoError(null)

    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas prise en charge par ce navigateur. Entrez votre ville ci-dessous.")
      inputRef.current?.focus()
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const label = await reverseGeocode(latitude, longitude)
          onResolved({ lat: latitude, lng: longitude, label, source: "geolocation" })
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Accès à la position refusé. Entrez votre ville ci-dessous.")
          inputRef.current?.focus()
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError("Position introuvable. Essayez de saisir votre ville.")
        } else {
          setGeoError("La localisation a pris trop de temps. Réessayez ou saisissez votre ville.")
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <div className="relative min-w-[220px] flex-1">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={suggestionsOpen && suggestions.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSuggestionsOpen(true)
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => {
              // Delay so a click on a suggestion registers before the list unmounts.
              setTimeout(() => setSuggestionsOpen(false), 150)
            }}
            placeholder="Votre ville ou adresse..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:ring-2"
          />

          {suggestionsOpen && (searching || suggestions.length > 0) && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg"
            >
              {searching && suggestions.length === 0 && (
                <li className="px-3 py-2 text-xs text-muted-foreground">Recherche…</li>
              )}
              {suggestions.map((s, i) => (
                <li key={`${s.lat}-${s.lng}-${i}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(s)}
                    className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          Me localiser
        </button>
      </div>

      {geoError && <p className="text-xs text-destructive">{geoError}</p>}
    </div>
  )
}
