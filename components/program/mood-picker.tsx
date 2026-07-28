"use client"

import { sessionAudio } from "@/lib/program/audio"

const MOODS = [
  { value: 1, emoji: "😣" },
  { value: 2, emoji: "😟" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
]

export function MoodPicker({
  value,
  onChange,
  label,
  labelledBy,
}: {
  value: number | null
  onChange: (v: number) => void
  label: string
  labelledBy?: string
}) {
  return (
    <div role="group" aria-label={label} id={labelledBy}>
      <div className="flex items-center justify-center gap-2">
        {MOODS.map((m) => {
          const selected = value === m.value
          return (
            <button
              key={m.value}
              type="button"
              aria-label={`${m.value}/5`}
              aria-pressed={selected}
              onClick={() => {
                onChange(m.value)
                sessionAudio.sfx("select")
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl transition-all duration-200"
              style={{
                transitionTimingFunction: "cubic-bezier(0.34,1.6,0.64,1)",
                background: selected ? "white" : "rgba(255,255,255,0.12)",
                transform: selected ? "scale(1.22)" : "scale(1)",
                boxShadow: selected ? "0 4px 14px rgba(0,0,0,0.20)" : "none",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = selected ? "scale(1.22)" : "scale(1)")}
            >
              {m.emoji}
            </button>
          )
        })}
      </div>
    </div>
  )
}
