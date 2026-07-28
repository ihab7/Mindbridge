"use client"

export function TriggerChips({
  options,
  selected,
  onToggle,
  textColor,
}: {
  options: string[]
  selected: string[]
  onToggle: (label: string) => void
  textColor: string
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {options.map((label) => {
        const on = selected.includes(label)
        return (
          <button
            key={label}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(label)}
            className="rounded-full px-3.5 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.93]"
            style={{
              transitionTimingFunction: "cubic-bezier(0.34,1.5,0.64,1)",
              background: on ? "white" : "rgba(255,255,255,0.20)",
              color: on ? textColor : "white",
              fontWeight: on ? 500 : 400,
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
