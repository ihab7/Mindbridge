"use client"

import { useState } from "react"
import { useT } from "@/components/i18n-provider"
import { sessionAudio } from "@/lib/program/audio"
import { SOUND_ICONS } from "@/lib/program/theme"
import type { ProgramSoundId } from "@/lib/program/types"

const SOUNDS: ProgramSoundId[] = ["rain", "ocean", "forest"]

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200"
        style={{
          left: on ? 18 : 2,
          background: on ? "hsl(var(--primary))" : "white",
          transitionTimingFunction: "cubic-bezier(0.34,1.5,0.64,1)",
        }}
      />
    </button>
  )
}

export function AudioMixer({
  defaultSound,
  onSoundChange,
}: {
  defaultSound: ProgramSoundId
  onSoundChange: (id: ProgramSoundId) => void
}) {
  const t = useT()

  const [toneOn, setToneOn] = useState(true)
  const [toneVol, setToneVol] = useState(50)
  const [natureOn, setNatureOn] = useState(true)
  const [natureVol, setNatureVol] = useState(50)
  const [sound, setSound] = useState<ProgramSoundId>(defaultSound)

  function handleToneOn(v: boolean) {
    setToneOn(v)
    sessionAudio.setToneOn(v)
    sessionAudio.sfx("toggle")
  }

  function handleNatureOn(v: boolean) {
    setNatureOn(v)
    sessionAudio.setNatureOn(v)
    sessionAudio.sfx("toggle")
  }

  function handleSound(id: ProgramSoundId) {
    setSound(id)
    sessionAudio.switchSound(id)
    sessionAudio.sfx("select")
    onSoundChange(id)
  }

  return (
    <div className="w-full max-w-sm rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.20)" }}>
      <div className="flex items-center gap-3">
        <span className="min-w-[78px] text-xs font-medium text-white">🎵 {t("program.audio.tones")}</span>
        <Toggle on={toneOn} onChange={handleToneOn} label={t("program.audio.tones")} />
        <input
          type="range"
          min={0}
          max={100}
          value={toneVol}
          disabled={!toneOn}
          onChange={(e) => {
            const v = Number(e.target.value)
            setToneVol(v)
            sessionAudio.setToneVolume(v / 100)
          }}
          className="flex-1 cursor-pointer accent-white"
          style={{ opacity: toneOn ? 1 : 0.3, pointerEvents: toneOn ? "auto" : "none" }}
          aria-label={t("program.audio.tones")}
        />
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span className="min-w-[78px] text-xs font-medium text-white">🌿 {t("program.audio.nature")}</span>
        <Toggle on={natureOn} onChange={handleNatureOn} label={t("program.audio.nature")} />
        <input
          type="range"
          min={0}
          max={100}
          value={natureVol}
          disabled={!natureOn}
          onChange={(e) => {
            const v = Number(e.target.value)
            setNatureVol(v)
            sessionAudio.setNatureVolume(v / 100)
          }}
          className="flex-1 cursor-pointer accent-white"
          style={{ opacity: natureOn ? 1 : 0.3, pointerEvents: natureOn ? "auto" : "none" }}
          aria-label={t("program.audio.nature")}
        />
      </div>

      <div
        className="mt-2.5 flex items-center justify-center gap-3"
        style={{ opacity: natureOn ? 1 : 0.35, pointerEvents: natureOn ? "auto" : "none" }}
      >
        {SOUNDS.map((id) => {
          const active = sound === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSound(id)}
              aria-label={id}
              aria-pressed={active}
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.15] active:scale-90"
              style={{
                background: active ? "rgba(255,255,255,0.45)" : "transparent",
                border: active ? "2px solid white" : "2px solid transparent",
                transform: active ? "scale(1.12)" : undefined,
              }}
            >
              {SOUND_ICONS[id]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
