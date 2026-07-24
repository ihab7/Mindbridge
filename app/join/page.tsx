"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useJsApiLoader } from "@react-google-maps/api"
import { Activity, Loader2, MapPin, CheckCircle2 } from "lucide-react"
import { SPECIALTY_TAGS, LANGUAGE_OPTIONS, WEEKDAYS } from "@/lib/directory"

type PlanId = "basic" | "premium"

const PLANS: Record<PlanId, { name: string; price: string; features: [string, boolean][] }> = {
  basic: {
    name: "Basic",
    price: "29 TND/month",
    features: [
      ["Listed in finder", true],
      ["Full profile page", true],
      ["Patient messaging via MindBridge", true],
      ["MindBridge Verified badge", true],
      ["Basic analytics", true],
      ["Featured placement (top of results)", false],
      ["Online booking system", false],
      ["Priority support", false],
    ],
  },
  premium: {
    name: "Premium",
    price: "59 TND/month",
    features: [
      ["Everything in Basic", true],
      ["⭐ Featured badge — appear first", true],
      ["Online booking system", true],
      ["Advanced analytics dashboard", true],
      ["Priority support", true],
      ["Profile highlighted in amber", true],
    ],
  },
}

export default function PractitionerRegisterPage() {
  const { isLoaded } = useJsApiLoader({
    id: "mindbridge-google-maps",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
  })

  const [plan, setPlan] = useState<PlanId>("basic")
  const [fullName, setFullName] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [clinicName, setClinicName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [manualCoords, setManualCoords] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [bio, setBio] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [hours, setHours] = useState<Record<string, { open: boolean; from: string; to: string }>>(() =>
    Object.fromEntries(
      WEEKDAYS.map((d) => [d, { open: d !== "Sunday", from: "09:00", to: "18:00" }]),
    ),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }
  function toggleLanguage(lang: string) {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))
  }

  async function handleLocate() {
    if (!isLoaded || !window.google || (!address && !city)) return
    setGeocoding(true)
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address: `${address}, ${city}, Tunisia` }, (results, status) => {
      setGeocoding(false)
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location
        setCoords({ lat: loc.lat(), lng: loc.lng() })
      } else {
        setError("Could not locate this address automatically — enter coordinates manually below.")
        setManualCoords(true)
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!fullName || !specialty || !city || !address || (!phone && !email)) {
      setError("Please fill in your name, specialty, city, address, and a phone or email.")
      return
    }

    setSubmitting(true)
    try {
      const openingHours = Object.fromEntries(
        Object.entries(hours)
          .filter(([, v]) => v.open)
          .map(([day, v]) => [day, `${v.from}–${v.to}`]),
      )

      const res = await fetch("/api/directory/practitioners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          specialty,
          bio,
          address: clinicName ? `${clinicName}, ${address}` : address,
          city,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          phone,
          email,
          languages,
          experience_years: experienceYears ? Number(experienceYears) : null,
          tags,
          opening_hours: openingHours,
          plan,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Registration failed")
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Application received!</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We&apos;ll review your profile and activate it within 24 hours. You&apos;ll receive a confirmation at{" "}
            <span className="font-medium text-foreground">{email || phone}</span>.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to MindBridge
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="px-6 py-16 text-center"
        style={{ background: "linear-gradient(135deg, #0d1f2d, #1a3a4a)" }}
      >
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-white">MindBridge</span>
        </Link>
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 text-4xl">🏥</div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Join MindBridge as a Practitioner</h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-white/70">
            List your cabinet, reach patients actively seeking mental health support, and manage your appointments —
            all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["500+ Active patients", "30-day free trial", "Setup in 10 minutes"].map((stat) => (
              <span key={stat} className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white">
                {stat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Plan cards */}
        <div className="mb-3 grid gap-4 md:grid-cols-2">
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const p = PLANS[id]
            const isPremium = id === "premium"
            const selected = plan === id
            return (
              <button
                type="button"
                key={id}
                onClick={() => setPlan(id)}
                className={`relative rounded-xl border-2 p-6 text-left transition-colors duration-200 ${
                  selected
                    ? isPremium
                      ? "border-accent bg-accent/[0.08]"
                      : "border-primary bg-primary/[0.06]"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-3 right-4 rounded-full border border-accent/30 bg-accent px-3 py-0.5 text-[11px] font-semibold text-accent-foreground">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground">
                  {isPremium ? "⭐ " : ""}
                  {p.name}
                </h3>
                <p className="mt-1 text-2xl font-bold text-foreground">{p.price}</p>
                <ul className="mt-4 flex flex-col gap-2 text-sm">
                  {p.features.map(([label, included]) => (
                    <li key={label} className={included ? "text-foreground" : "text-muted-foreground line-through"}>
                      {included ? "✅" : "❌"} {label}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
        <p className="mb-10 text-center text-sm text-muted-foreground">
          ✨ Both plans include a 30-day free trial. No credit card required to start.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Personal info */}
          <FormSection title="Personal info">
            <Field label="Full name" required>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} placeholder="Dr. Jane Doe" />
            </Field>
            <Field label="Specialty" required>
              <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} required className={inputClass} placeholder="Psychiatrist & Psychotherapist" />
            </Field>
            <Field label="Years of experience">
              <input type="number" min={0} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Phone number">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+216 ..." />
            </Field>
            <Field label="Email address">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </Field>
          </FormSection>

          {/* Cabinet info */}
          <FormSection title="Cabinet info">
            <Field label="Cabinet / clinic name">
              <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="City" required>
              <input value={city} onChange={(e) => setCity(e.target.value)} required className={inputClass} placeholder="Tunis" />
            </Field>
            <Field label="Full address" required>
              <input value={address} onChange={(e) => setAddress(e.target.value)} required className={inputClass} />
            </Field>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLocate}
                disabled={geocoding || !isLoaded}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {geocoding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                Locate on map
              </button>
              {coords && <span className="text-xs text-muted-foreground">📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>}
              <button
                type="button"
                onClick={() => setManualCoords((v) => !v)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {manualCoords ? "Hide manual coordinates" : "Enter coordinates manually"}
              </button>
            </div>
            {manualCoords && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude">
                  <input type="number" step="any" value={coords?.lat ?? ""} onChange={(e) => setCoords((c) => ({ lat: Number(e.target.value), lng: c?.lng ?? 0 }))} className={inputClass} />
                </Field>
                <Field label="Longitude">
                  <input type="number" step="any" value={coords?.lng ?? ""} onChange={(e) => setCoords((c) => ({ lat: c?.lat ?? 0, lng: Number(e.target.value) }))} className={inputClass} />
                </Field>
              </div>
            )}
          </FormSection>

          {/* Profile content */}
          <FormSection title="Profile content">
            <Field label={`Bio / introduction (${bio.length}/500)`}>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                rows={4}
                className={inputClass}
                placeholder="Tell patients about your approach and experience..."
              />
            </Field>
            <div>
              <p className="mb-1.5 block text-sm font-medium text-foreground">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_TAGS.map((tag) => (
                  <TagButton key={tag} label={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 block text-sm font-medium text-foreground">Languages spoken</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <TagButton key={lang} label={lang} active={languages.includes(lang)} onClick={() => toggleLanguage(lang)} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 block text-sm font-medium text-foreground">Opening hours</p>
              <div className="flex flex-col gap-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
                    <label className="flex w-28 items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={hours[day].open}
                        onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], open: e.target.checked } }))}
                      />
                      {day}
                    </label>
                    {hours[day].open && (
                      <>
                        <input
                          type="time"
                          value={hours[day].from}
                          onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], from: e.target.value } }))}
                          className="rounded-lg border border-input bg-background px-2 py-1 text-sm text-foreground"
                        />
                        <span className="text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={hours[day].to}
                          onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], to: e.target.value } }))}
                          className="rounded-lg border border-input bg-background px-2 py-1 text-sm text-foreground"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FormSection>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "🚀 Start My 30-Day Free Trial"}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-shadow focus:ring-2"

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

function TagButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  )
}
