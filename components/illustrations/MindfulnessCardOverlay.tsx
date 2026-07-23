import React from "react"

type Variant = "warm" | "cool" | "rose" | "night"

export function MindfulnessCardOverlay({ variant, className }: { variant: Variant; className?: string }) {
  const id = React.useId()
  const g1 = `mf-g1-${variant}-${id}`
  const g2 = `mf-g2-${variant}-${id}`
  const g3 = `mf-g3-${variant}-${id}`

  const palette = (() => {
    if (variant === "warm") {
      return {
        a0: "#fff7e8",
        a1: "#ffd9a8",
        a2: "#ff8f5a",
        b0: "#fffdf6",
        b1: "#ffe9c8",
        b2: "#ffc59c",
        accent: "#ffb17b",
      }
    }
    if (variant === "cool") {
      return {
        a0: "#f1f7ff",
        a1: "#cfe0ff",
        a2: "#8aa8ff",
        b0: "#f7f9ff",
        b1: "#dee7ff",
        b2: "#a7b8ff",
        accent: "#a1b3ff",
      }
    }
    if (variant === "rose") {
      return {
        a0: "#fff4f7",
        a1: "#ffd2de",
        a2: "#ff9bb4",
        b0: "#fff9f2",
        b1: "#ffe2cf",
        b2: "#ffc2a4",
        accent: "#ffb1c2",
      }
    }
    return {
      a0: "#f3f6ff",
      a1: "#d6e3ff",
      a2: "#93b0ff",
      b0: "#f6fbff",
      b1: "#dff0ff",
      b2: "#b3dcff",
      accent: "#b1c5ff",
    }
  })()

  return (
    <svg
      className={className}
      viewBox="0 0 600 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={g1} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={palette.a0} stopOpacity="0" />
          <stop offset="35%" stopColor={palette.a1} stopOpacity="0.95" />
          <stop offset="75%" stopColor={palette.a2} stopOpacity="0.5" />
          <stop offset="100%" stopColor={palette.a0} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g2} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={palette.b0} stopOpacity="0" />
          <stop offset="35%" stopColor={palette.b1} stopOpacity="0.85" />
          <stop offset="85%" stopColor={palette.b2} stopOpacity="0.35" />
          <stop offset="100%" stopColor={palette.b0} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={g3} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(520 130) rotate(90) scale(120 180)">
          <stop offset="0" stopColor={palette.accent} stopOpacity="0.28" />
          <stop offset="1" stopColor={palette.accent} stopOpacity="0" />
        </radialGradient>

        <filter id={`mf-soft-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <g opacity="0.95" filter={`url(#mf-soft-${id})`}>
        <path
          d="M140 78c120-40 240-22 340 10 72 22 112 52 82 86-32 36-124 44-206 36-82-8-150-32-250-22-100 10-152-10-152-44 0-34 58-40 100-66 38-24 42-18 86 0Z"
          fill={`url(#${g1})`}
        />
        <path
          d="M160 132c140-42 268-26 360 0 86 24 128 54 88 88-40 34-144 40-230 32-86-8-160-30-260-20-100 10-148-10-148-44 0-34 46-44 104-56 34-8 48-6 86 0Z"
          fill={`url(#${g2})`}
          opacity="0.85"
        />
      </g>

      <g opacity="0.7" filter={`url(#mf-soft-${id})`}>
        <ellipse cx="520" cy="130" rx="110" ry="70" fill={`url(#${g3})`} />
      </g>

      {variant === "night" ? (
        <g opacity="0.22">
          <circle cx="545" cy="86" r="1.6" fill={palette.accent} />
          <circle cx="570" cy="108" r="1.2" fill={palette.accent} />
          <circle cx="530" cy="112" r="1" fill={palette.accent} />
        </g>
      ) : null}

      {variant === "rose" ? (
        <g opacity="0.18">
          <circle cx="556" cy="98" r="2" fill={palette.accent} />
          <circle cx="536" cy="118" r="1.2" fill={palette.accent} />
        </g>
      ) : null}
    </svg>
  )
}
