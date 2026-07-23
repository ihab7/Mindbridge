import React from "react"

export function Breathing3minIllustration({ className }: { className?: string }) {
  const id = React.useId()
  const gradId = `breathing-3min-grad-${id}`

  return (
    <svg
      width="300"
      height="200"
      viewBox="0 0 300 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8F4FD" />
          <stop offset="100%" stopColor="#B8E0F7" />
        </linearGradient>
      </defs>

      {/* Cloud shapes */}
      <ellipse cx="100" cy="100" rx="35" ry="25" fill={`url(#${gradId})`} />
      <ellipse cx="140" cy="95" rx="40" ry="30" fill={`url(#${gradId})`} />
      <ellipse cx="180" cy="100" rx="35" ry="25" fill={`url(#${gradId})`} />
      <ellipse cx="120" cy="85" rx="30" ry="20" fill={`url(#${gradId})`} />
      <ellipse cx="160" cy="85" rx="30" ry="20" fill={`url(#${gradId})`} />
    </svg>
  )
}
