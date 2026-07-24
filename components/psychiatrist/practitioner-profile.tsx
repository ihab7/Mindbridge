"use client"

import Link from "next/link"
import { CheckCircle2, Lock, MapPin, Phone, Share2, Globe, Mail, Users } from "lucide-react"
import type { PractitionerWithDistance } from "@/hooks/use-practitioners"

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export function PractitionerProfile({
  practitioner,
  isLoggedIn,
  onLoginRequest,
}: {
  practitioner: PractitionerWithDistance | null
  isLoggedIn: boolean
  onLoginRequest: () => void
}) {
  if (!practitioner) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <Users className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          ← Select a practitioner from the list to view their full profile
        </p>
      </div>
    )
  }

  const isPremium = practitioner.plan === "premium"
  const tagline = practitioner.bio ? practitioner.bio.split(".")[0].trim() : ""

  async function handleShare() {
    if (!isLoggedIn) return onLoginRequest()
    const shareData = {
      title: practitioner!.full_name,
      text: `${practitioner!.full_name} — ${practitioner!.specialty} on MindBridge`,
      url: typeof window !== "undefined" ? window.location.href : "",
    }
    if (navigator.share) {
      navigator.share(shareData).catch(() => {})
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url)
      alert("Profile link copied to clipboard")
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div
        className={`-m-6 mb-0 rounded-t-xl border-t-4 p-6 ${
          isPremium ? "border-t-accent bg-accent/[0.04]" : "border-t-primary bg-primary/[0.04]"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white ${
              isPremium ? "bg-accent" : "bg-primary"
            }`}
          >
            {practitioner.full_name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{practitioner.full_name}</h3>
              {isPremium && (
                <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/[0.15] px-2 py-0.5 text-[11px] font-semibold text-accent-foreground/80">
                  ⭐ Featured
                </span>
              )}
              {practitioner.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/[0.15] px-2 py-0.5 text-[11px] font-medium text-primary">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-primary">{practitioner.specialty}</p>
            {tagline && <p className="mt-1 text-xs italic leading-relaxed text-primary/85">&ldquo;{tagline}.&rdquo;</p>}
            <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
              {practitioner.experience_years != null && <span>{practitioner.experience_years} years experience</span>}
              {practitioner.distanceKm != null && <span>{practitioner.distanceKm.toFixed(1)} km away</span>}
              {practitioner.city && <span>{practitioner.city}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Contact block */}
      <div>
        <SectionLabel icon="📞" label="Contact" />
        {!isLoggedIn ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-gradient-to-br from-primary/[0.08] to-primary/[0.03] p-6 text-center">
            <span className="text-3xl">🔒</span>
            <p className="text-sm font-semibold text-foreground">Contact info & booking</p>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Create a free MindBridge account to view contact details and book a consultation — it&apos;s completely
              free.
            </p>
            <button
              type="button"
              onClick={onLoginRequest}
              className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign up free →
            </button>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
            {practitioner.phone && (
              <a href={`tel:${practitioner.phone}`} className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
                <Phone className="h-4 w-4 text-primary" /> {practitioner.phone}
              </a>
            )}
            {practitioner.address && (
              <div className="flex items-start gap-2 text-sm text-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {practitioner.address}
              </div>
            )}
            {practitioner.website && (
              <a
                href={practitioner.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
              >
                <Globe className="h-4 w-4 text-primary" /> {practitioner.website}
              </a>
            )}
            <div className="mt-1 flex flex-wrap gap-2">
              {practitioner.phone && (
                <a
                  href={`tel:${practitioner.phone}`}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  📅 Book consultation
                </a>
              )}
              {practitioner.email && (
                <a
                  href={`mailto:${practitioner.email}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* About */}
      {practitioner.bio && (
        <div>
          <SectionLabel icon="💬" label="About" />
          <div className="rounded-r-lg border-l-[3px] border-primary bg-primary/[0.06] px-3.5 py-3">
            <p className="text-[13px] leading-relaxed text-muted-foreground">{practitioner.bio}</p>
          </div>
        </div>
      )}

      {/* Specialties */}
      {practitioner.tags.length > 0 && (
        <div>
          <SectionLabel icon="🎯" label="Specialties" />
          <div className="flex flex-wrap gap-1.5">
            {practitioner.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/25 bg-primary/[0.12] px-3 py-1 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {practitioner.languages.length > 0 && (
        <div>
          <SectionLabel icon="🌐" label="Languages" />
          <div className="flex flex-wrap gap-1.5">
            {practitioner.languages.map((lang) => (
              <span
                key={lang}
                className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/[0.12] px-3 py-1 text-xs font-medium text-primary"
              >
                🌐 {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {Object.keys(practitioner.opening_hours ?? {}).length > 0 && (
        <div>
          <SectionLabel icon="🕐" label="Availability" />
          <div className="flex flex-col gap-0.5 text-sm">
            {Object.entries(practitioner.opening_hours).map(([days, hours], i) => {
              const closed = hours.trim().toLowerCase() === "closed"
              return (
                <div
                  key={days}
                  className={`flex justify-between rounded-md px-2.5 py-1.5 ${i % 2 === 0 ? "bg-muted/40" : ""}`}
                >
                  <span className="font-medium text-foreground">{days}</span>
                  <span className={`font-medium ${closed ? "text-destructive" : "text-[#22c55e]"}`}>{hours}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Share2 className="h-4 w-4" /> Share profile
        </button>
      </div>
    </div>
  )
}
