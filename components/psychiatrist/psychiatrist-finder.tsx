"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Search, MapPin, Building2 } from "lucide-react"
import { usePractitioners } from "@/hooks/use-practitioners"
import { isOpenNow } from "@/lib/directory"
import { loadStoredOrigin, loadStoredRadiusKm, storeOrigin, storeRadiusKm, type SearchOrigin } from "@/lib/search-origin"
import { PractitionerCard } from "./practitioner-card"
import { PractitionerProfile } from "./practitioner-profile"
import { LocationInput } from "./location-input"

// Leaflet touches `window` at import time, so it can only run in the
// browser -- ssr: false keeps it out of the server-rendered HTML entirely.
const PractitionerMap = dynamic(() => import("./practitioner-map").then((m) => m.PractitionerMap), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full animate-pulse rounded-2xl bg-muted" />,
})

type Filter = "featured" | "verified" | "open_now"
const RADIUS_OPTIONS = [10, 20, 50]

function nextRadiusOption(radiusKm: number): number | null {
  const idx = RADIUS_OPTIONS.indexOf(radiusKm)
  if (idx === -1 || idx === RADIUS_OPTIONS.length - 1) return null
  return RADIUS_OPTIONS[idx + 1]
}

export function PsychiatristFinder({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [origin, setOrigin] = useState<SearchOrigin | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [showLocationEditor, setShowLocationEditor] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])
  const [radiusKm, setRadiusKm] = useState(20)

  // Read the last chosen origin/radius once on mount. Never silently
  // default to a guessed location -- if nothing is stored, origin stays
  // null and the prompt state (below) is what renders.
  useEffect(() => {
    const storedOrigin = loadStoredOrigin()
    const storedRadius = loadStoredRadiusKm()
    if (storedOrigin) setOrigin(storedOrigin)
    if (storedRadius) setRadiusKm(storedRadius)
    setHydrated(true)
  }, [])

  // Persist on every real change, but only after the mount-time read above
  // has completed -- otherwise this would immediately overwrite localStorage
  // with the pre-hydration `null`/default before it's ever read.
  useEffect(() => {
    if (!hydrated) return
    storeOrigin(origin)
  }, [origin, hydrated])

  useEffect(() => {
    if (!hydrated) return
    storeRadiusKm(radiusKm)
  }, [radiusKm, hydrated])

  const { practitioners, loading } = usePractitioners(origin ? { lat: origin.lat, lng: origin.lng } : null, radiusKm)

  const filtered = useMemo(() => {
    return practitioners
      .filter((p) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          p.full_name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
      .filter((p) => !activeFilters.includes("featured") || p.plan === "premium")
      .filter((p) => !activeFilters.includes("verified") || p.is_verified)
      .filter((p) => !activeFilters.includes("open_now") || isOpenNow(p.opening_hours))
  }, [practitioners, searchQuery, activeFilters])

  const selected = filtered.find((p) => p.id === selectedId) ?? null

  function toggleFilter(f: Filter) {
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  function handleLoginRequest() {
    window.location.href = "/register"
  }

  function handleOriginResolved(newOrigin: SearchOrigin) {
    setOrigin(newOrigin)
    setShowLocationEditor(false)
  }

  const nextRadius = nextRadiusOption(radiusKm)

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Find a Psychiatrist Near You</h2>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/[0.15] px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              FREE
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? (
              "Loading practitioners near you..."
            ) : origin ? (
              <>
                {filtered.length} praticiens à moins de {radiusKm} km de {origin.label} ·{" "}
                <Link href="/join" className="text-[11px] font-medium text-primary no-underline hover:underline">
                  Are you a doctor? Join us →
                </Link>
              </>
            ) : (
              <>
                Entrez votre position pour voir les praticiens disponibles ·{" "}
                <Link href="/join" className="text-[11px] font-medium text-primary no-underline hover:underline">
                  Are you a doctor? Join us →
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {origin && !showLocationEditor && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
          <span>
            📍{" "}
            {origin.source === "geolocation"
              ? "Résultats autour de votre position actuelle"
              : `Résultats autour de ${origin.label}`}
          </span>
          <button
            type="button"
            onClick={() => setShowLocationEditor(true)}
            className="shrink-0 text-xs font-medium text-foreground hover:underline"
          >
            Modifier
          </button>
        </div>
      )}

      {origin && showLocationEditor && (
        <div className="mb-4 rounded-lg border border-border bg-muted/20 p-3">
          <LocationInput onResolved={handleOriginResolved} autoFocus />
          <button
            type="button"
            onClick={() => setShowLocationEditor(false)}
            className="mt-2 text-xs text-muted-foreground hover:underline"
          >
            Annuler
          </button>
        </div>
      )}

      {!origin ? (
        <>
          {/* Map still visible, zoomed out over the country -- no radius circle, no distance labels */}
          <div className="mb-4">
            {loading ? (
              <div className="h-[220px] w-full animate-pulse rounded-2xl bg-muted" />
            ) : (
              <PractitionerMap practitioners={filtered} origin={null} selectedId={null} onSelect={() => {}} radiusKm={radiusKm} />
            )}
          </div>

          <LocationPromptState onResolved={handleOriginResolved} />

          {!loading && <JoinCta />}
        </>
      ) : (
        <>
          {/* Search + filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, specialty, or condition..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none ring-ring transition-shadow placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
            <FilterButton label="⭐ Featured" active={activeFilters.includes("featured")} onClick={() => toggleFilter("featured")} />
            <FilterButton label="✅ Verified" active={activeFilters.includes("verified")} onClick={() => toggleFilter("verified")} />
            <FilterButton label="🟢 Open now" active={activeFilters.includes("open_now")} onClick={() => toggleFilter("open_now")} />
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  📍 Radius: {r}km
                </option>
              ))}
            </select>
          </div>

          {/* Map */}
          <div className="mb-4">
            {loading ? (
              <div className="h-[220px] w-full animate-pulse rounded-2xl bg-muted" />
            ) : (
              <PractitionerMap
                practitioners={filtered}
                origin={{ lat: origin.lat, lng: origin.lng }}
                selectedId={selectedId}
                onSelect={setSelectedId}
                radiusKm={radiusKm}
              />
            )}
          </div>

          {/* List + profile */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-[260px_1fr]">
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
              <div className="h-80 animate-pulse rounded-xl bg-muted" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              radiusKm={radiusKm}
              originLabel={origin.label}
              nextRadius={nextRadius}
              onExpandRadius={() => nextRadius && setRadiusKm(nextRadius)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-[260px_1fr]">
              <div className="flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1">
                {filtered.map((p) => (
                  <PractitionerCard key={p.id} practitioner={p} isSelected={p.id === selectedId} onClick={() => setSelectedId(p.id)} />
                ))}
              </div>
              <PractitionerProfile practitioner={selected} isLoggedIn={isLoggedIn} onLoginRequest={handleLoginRequest} />
            </div>
          )}

          {!loading && <JoinCta />}
        </>
      )}
    </div>
  )
}

function LocationPromptState({ onResolved }: { onResolved: (origin: SearchOrigin) => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 px-6 py-14 text-center">
      <span className="text-3xl" aria-hidden="true">
        📍
      </span>
      <p className="text-lg font-semibold text-foreground">Où cherchez-vous un psychiatre ?</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Entrez votre ville ou autorisez la localisation pour voir les praticiens près de chez vous.
      </p>
      <div className="mt-2 w-full max-w-md">
        <LocationInput onResolved={onResolved} />
      </div>
    </div>
  )
}

function JoinCta() {
  return (
    <div
      className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl px-6 py-5"
      style={{ background: "linear-gradient(135deg, #0d1f2d 0%, #1a3a4a 100%)" }}
    >
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-white">🏥 Are you a psychiatrist or therapist?</p>
        <p className="mt-1 text-xs leading-relaxed text-white/55">
          Join MindBridge and reach patients actively seeking mental health support. First 30 days free.
        </p>
      </div>
      <Link
        href="/join"
        className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        List your practice →
      </Link>
    </div>
  )
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors duration-200 ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  )
}

function EmptyState({
  radiusKm,
  originLabel,
  nextRadius,
  onExpandRadius,
}: {
  radiusKm: number
  originLabel: string
  nextRadius: number | null
  onExpandRadius: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 py-14 text-center">
      <Building2 className="h-8 w-8 text-muted-foreground" />
      <p className="font-semibold text-foreground">
        Aucun praticien dans un rayon de {radiusKm} km de {originLabel}.
      </p>
      <div className="mt-3 flex gap-2">
        {nextRadius !== null && (
          <button
            type="button"
            onClick={onExpandRadius}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Élargir à {nextRadius} km
          </button>
        )}
        <Link
          href="/register"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <MapPin className="h-4 w-4" /> Notify me when available
        </Link>
      </div>
    </div>
  )
}
