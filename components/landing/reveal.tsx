"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Scroll-in wrapper. The hidden state lives in CSS (see the landing page's
 * <style> block) rather than in inline styles so that
 * prefers-reduced-motion can neutralise it without this component knowing:
 * under that query `.reveal` is already at its final position, and the class
 * added here is a no-op.
 */
export function Reveal({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode
  delayMs?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No IntersectionObserver (very old browser, some test runners): show the
    // content rather than leaving it invisible forever.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            observer.unobserve(entry.target) // fires once, never replays
          }
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  )
}
