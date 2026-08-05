"use client"

import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useT } from "@/components/i18n-provider"
import type { SleepStory } from "@/lib/sleep-stories/stories"

type AmbientBed = SleepStory["defaultAmbient"]

const AMBIENT_LABEL_KEYS: Record<AmbientBed, string> = {
  fire: "sleepStories.ambient.fire",
  rain: "sleepStories.ambient.rain",
  ocean: "sleepStories.ambient.ocean",
  forest: "sleepStories.ambient.forest",
  none: "sleepStories.ambient.none",
}

const AMBIENT_ICONS: Record<AmbientBed, string> = {
  rain: "🌧",
  ocean: "🌊",
  fire: "🔥",
  forest: "🌿",
  none: "✕",
}

// Picker order stays fixed in source order -- a `dir="rtl"` ancestor already
// mirrors this flex row visually (the inline axis follows `direction`), so
// the glyphs themselves are never flipped, only their reading order is.
const AMBIENT_PICKER_ORDER: AmbientBed[] = ["rain", "ocean", "fire", "forest", "none"]

function MixerRow({
  icon,
  label,
  on,
  onToggle,
  volume,
  onVolumeChange,
  sliderDisabled,
}: {
  icon: string
  label: string
  on: boolean
  onToggle: (v: boolean) => void
  volume: number
  onVolumeChange: (v: number) => void
  sliderDisabled?: boolean
}) {
  const disabled = sliderDisabled ?? !on
  return (
    <div className="flex items-center gap-3">
      <span className="flex min-w-[110px] items-center gap-1.5 text-sm text-card-foreground">
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
      <Switch checked={on} onCheckedChange={onToggle} aria-label={label} />
      <Slider
        value={[Math.round(volume * 100)]}
        max={100}
        step={1}
        disabled={disabled}
        onValueChange={([v]) => onVolumeChange(v / 100)}
        className={disabled ? "opacity-40" : ""}
        aria-label={label}
      />
    </div>
  )
}

function AmbientIconButton({
  bed,
  active,
  label,
  onSelect,
}: {
  bed: AmbientBed
  active: boolean
  label: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base transition-colors ${
        active
          ? "border-primary bg-primary/15 text-foreground"
          : "border-border/60 bg-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <span aria-hidden="true">{AMBIENT_ICONS[bed]}</span>
    </button>
  )
}

export function AudioMixerCompact({
  narrationOn,
  narrationVolume,
  onNarrationOnChange,
  onNarrationVolumeChange,
  ambient,
  ambientOn,
  ambientVolume,
  onAmbientOnChange,
  onAmbientVolumeChange,
  onAmbientSelect,
}: {
  narrationOn: boolean
  narrationVolume: number
  onNarrationOnChange: (v: boolean) => void
  onNarrationVolumeChange: (v: number) => void
  ambient: AmbientBed
  ambientOn: boolean
  ambientVolume: number
  onAmbientOnChange: (v: boolean) => void
  onAmbientVolumeChange: (v: number) => void
  onAmbientSelect: (bed: AmbientBed) => void
}) {
  const t = useT()

  return (
    <div className="w-full space-y-3 rounded-xl border border-border bg-card/60 p-3">
      <MixerRow
        icon="🎙"
        label={t("sleepStories.mixer.narration")}
        on={narrationOn}
        onToggle={onNarrationOnChange}
        volume={narrationVolume}
        onVolumeChange={onNarrationVolumeChange}
      />

      <div className="space-y-2 border-t border-border/60 pt-3">
        <MixerRow
          icon="🎵"
          label={t("sleepStories.mixer.ambient")}
          on={ambientOn}
          onToggle={onAmbientOnChange}
          volume={ambientVolume}
          onVolumeChange={onAmbientVolumeChange}
          sliderDisabled={!ambientOn || ambient === "none"}
        />
        {/* Dimmed (not disabled) while ambient is off: tapping an icon here
            is still expected to pick a bed AND flip the toggle back on. */}
        <div className={`flex items-center justify-center gap-2 transition-opacity ${ambientOn ? "" : "opacity-40"}`}>
          {AMBIENT_PICKER_ORDER.map((bed) => (
            <AmbientIconButton
              key={bed}
              bed={bed}
              active={ambient === bed}
              label={t(AMBIENT_LABEL_KEYS[bed])}
              onSelect={() => onAmbientSelect(bed)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
