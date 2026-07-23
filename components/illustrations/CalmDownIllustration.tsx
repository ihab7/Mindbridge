import React from "react"

export function CalmDownIllustration({ className }: { className?: string }) {
  const id = React.useId()
  const gradId = `calm-down-grad-${id}`

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
          <stop offset="0%" stopColor="#ff9a9e" />
          <stop offset="100%" stopColor="#fad0c4" />
        </linearGradient>
      </defs>

      <path
        d="M90 140 C20 80 40 20 90 60 C140 20 160 80 90 140"
        fill={`url(#${gradId})`}
      />
    </svg>
  )
}
