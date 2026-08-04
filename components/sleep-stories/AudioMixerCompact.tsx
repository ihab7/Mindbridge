"use client"

import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useT } from "@/components/i18n-provider"
import type { SleepStory } from "@/lib/sleep-stories/stories"

type AmbientBed = SleepStory["ambientBed"]

const AMBIENT_LABEL_KEYS: Record<AmbientBed, string> = {
  fire: "sleepStories.ambient.fire",
  rain: "sleepStories.ambient.rain",
  ocean: "sleepStories.ambient.ocean",
  forest: "sleepStories.ambient.forest",
  none: "sleepStories.ambient.none",
}

function MixerRow({
  icon,
  label,
  on,
  onToggle,
  volume,
  onVolumeChange,
}: {
  icon: string
  label: string
  on: boolean
  onToggle: (v: boolean) => void
  volume: number
  onVolumeChange: (v: number) => void
}) {
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
        disabled={!on}
        onValueChange={([v]) => onVolumeChange(v / 100)}
        className={on ? "" : "opacity-40"}
        aria-label={label}
      />
    </div>
  )
}

export function AudioMixerCompact({
  narrationOn,
  narrationVolume,
  onNarrationOnChange,
  onNarrationVolumeChange,
  ambientBed,
  ambientOn,
  ambientVolume,
  onAmbientOnChange,
  onAmbientVolumeChange,
}: {
  narrationOn: boolean
  narrationVolume: number
  onNarrationOnChange: (v: boolean) => void
  onNarrationVolumeChange: (v: number) => void
  ambientBed: AmbientBed
  ambientOn: boolean
  ambientVolume: number
  onAmbientOnChange: (v: boolean) => void
  onAmbientVolumeChange: (v: number) => void
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
      {ambientBed !== "none" && (
        <MixerRow
          icon="🌙"
          label={t(AMBIENT_LABEL_KEYS[ambientBed])}
          on={ambientOn}
          onToggle={onAmbientOnChange}
          volume={ambientVolume}
          onVolumeChange={onAmbientVolumeChange}
        />
      )}
    </div>
  )
}
