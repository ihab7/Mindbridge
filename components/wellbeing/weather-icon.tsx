"use client"

import { IconSunHigh, IconSunLow, IconCloud, IconCloudRain, IconMinus } from "@tabler/icons-react"
import type { Weather } from "@/lib/wellbeing/weeklySummary"

// Tabler has no dedicated "partly cloudy" glyph, so the five bands read as a
// single clearness gradient: bright sun -> low sun -> cloud -> rain -> (none).
const ICONS: Record<Weather, typeof IconSunHigh> = {
  sun: IconSunHigh,
  "cloud-sun": IconSunLow,
  cloud: IconCloud,
  "cloud-rain": IconCloudRain,
  none: IconMinus,
}

export function WeatherIcon({ weather, size = 22 }: { weather: Weather; size?: number }) {
  const Icon = ICONS[weather]
  // Colour is CONSTANT across every weather state: the app teal for real
  // weather, muted grey only for "no entry". A difficult (rainy) day is never
  // red or amber — the icon shape carries the meaning, not the colour.
  const className = weather === "none" ? "text-muted-foreground" : "text-primary"
  return <Icon size={size} className={className} stroke={1.75} aria-hidden />
}
