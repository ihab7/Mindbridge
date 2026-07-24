"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Search, MapPin, Building2 } from "lucide-react"
import { usePractitioners } from "@/hooks/use-practitioners"
import { isOpenNow } from "@/lib/directory"
import { PractitionerCard } from "./practitioner-card"
import { PractitionerProfile } from "./practitioner-profile"

// Leaflet touches `window` at import time, so it can only run in the
// browser -- ssr: false keeps it out of the server-rendered HTML entirely.
const PractitionerMap = dynamic(() => import("./practitioner-map").then((m) => m.PractitionerMap), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full animate-pulse rounded-2xl bg-muted" />,
})

const TUNIS_CENTER = { lat: 36.81, lng: 10.18 }
type Filter = "featured" | "verified" | "open_now"

export function PsychiatristFinder({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])
  const [radiusKm, setRadiusKm] = useState(20)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true)
      setUserLocation(TUNIS_CENTER)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setLocationDenied(true)
        setUserLocation(TUNIS_CENTER)
      },
      { timeout: 8000 },
    )
  }, [])

  const { practitioners, loading } = usePractitioners(userLocation, radiusKm)

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
            ) : (
              <>
                {filtered.length} verified practitioners near you ·{" "}
                <Link href="/join" className="text-[11px] font-medium text-primary no-underline hover:underline">
                  Are you a doctor? Join us →
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {locationDenied && !bannerDismissed && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
          <span>📍 We&apos;re using Tunis as your location. Allow location access for better results.</span>
          <button type="button" onClick={() => setBannerDismissed(true)} className="text-xs font-medium text-foreground hover:underline">
            Dismiss
          </button>
        </div>
      )}

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
          <option value={10}>📍 Radius: 10km</option>
          <option value={20}>📍 Radius: 20km</option>
          <option value={50}>📍 Radius: 50km</option>
        </select>
      </div>

      {/* Map */}
      <div className="mb-4">
        {loading ? (
          <div className="h-[220px] w-full animate-pulse rounded-2xl bg-muted" />
        ) : (
          <PractitionerMap
            practitioners={filtered}
            userLocation={userLocation}
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
        <EmptyState onExpandRadius={() => setRadiusKm(50)} />
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

function EmptyState({ onExpandRadius }: { onExpandRadius: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 py-14 text-center">
      <Building2 className="h-8 w-8 text-muted-foreground" />
      <p className="font-semibold text-foreground">No MindBridge practitioners in your area yet</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        We&apos;re growing our network. Try expanding your search radius.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onExpandRadius}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search in 50km
        </button>
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
