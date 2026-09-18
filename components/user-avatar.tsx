"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * One avatar for the whole app: the profile photo when there is one, else the
 * initial the app has always shown (`name.charAt(0)`, unchanged). Callers keep
 * their own circle styling (size, colours) through `className`; the photo
 * simply fills that circle. A photo that fails to load (deleted, no access)
 * falls back to the initial instead of a broken image.
 */
export function UserAvatar({
  src,
  name,
  size,
  className,
  decorative = false,
}: {
  src?: string | null
  name: string
  /** The name is already shown next to the avatar: hide it from screen readers to avoid reading it twice. */
  decorative?: boolean
  /** Optional pixel size; omit to size through className (e.g. "h-12 w-12"). */
  size?: number
  className?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showPhoto = Boolean(src) && failedSrc !== src
  const style = size ? { width: size, height: size } : undefined

  return (
    <span
      className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full", className)}
      style={style}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- same-origin, access-controlled route; next/image adds nothing here
        <img
          src={src!}
          alt={decorative ? "" : name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <span aria-hidden="true">{name.charAt(0)}</span>
      )}
      {!showPhoto && !decorative && <span className="sr-only">{name}</span>}
    </span>
  )
}
