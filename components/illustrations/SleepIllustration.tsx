import React from "react"

export function SleepIllustration({ className }: { className?: string }) {
  const id = React.useId()
  const gradId = `sleep-grad-${id}`

  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ec5ff" />
          <stop offset="100%" stopColor="#5b7cfa" />
        </linearGradient>
      </defs>

      <path
        d="M110 40 A60 60 0 1 0 110 140 A45 60 0 1 1 110 40"
        fill={`url(#${gradId})`}
      />

      <path
        d="M75 90 Q85 80 95 90"
        stroke="#1f2937"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
