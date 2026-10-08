/**
 * "Arche" — the MindBridge mascot: an arched bridge with a face.
 *
 * Decorative only (aria-hidden): it never carries meaning that isn't also in
 * text next to it. Inline SVG, no dependency. The full variant breathes very
 * slowly (CSS, disabled under prefers-reduced-motion); nothing else animates.
 * Its expression is chosen by the caller for an *event* (a save, an empty
 * state) — never from the patient's mood or anxiety values.
 *
 * Colours come from theme tokens exclusively. Note that --primary-foreground
 * is near-white in light mode but near-black in dark mode, so the face reads
 * dark-on-teal in dark mode. That follows the token, by design.
 *
 * The compact variant (used automatically below 48px) drops the arch opening,
 * feet, cheeks, arms and props: at that size they turn to mud.
 */

export type MascotPose = "calm" | "wave" | "cheer" | "sleepy"

const P = "hsl(var(--primary))"
const A = "hsl(var(--accent))"
const F = "hsl(var(--primary-foreground))"
const M = "hsl(var(--muted-foreground))"

const BODY_FULL =
  "M22 98 L22 64 C22 40 39 22 60 22 C81 22 98 40 98 64 L98 98 Q98 102 94 102 L78 102 Q74 102 74 98 L74 90 C74 82 68 76 60 76 C52 76 46 82 46 90 L46 98 Q46 102 42 102 L26 102 Q22 102 22 98 Z"
const BODY_COMPACT =
  "M22 94 L22 64 C22 40 39 22 60 22 C81 22 98 40 98 64 L98 94 Q98 102 90 102 L30 102 Q22 102 22 94 Z"

const ARM_RIGHT = "M95 58 q12 -6 10 -22"
const ARM_LEFT = "M25 58 q-12 -6 -10 -22"

/** Shared stroke setup for every face feature drawn as a path. */
const faceStroke = { fill: "none", stroke: F, strokeWidth: 3, strokeLinecap: "round" as const }

function Face({ pose }: { pose: MascotPose }) {
  switch (pose) {
    case "calm":
    case "wave":
      return (
        <>
          <circle cx={51} cy={50} r={3.6} fill={F} />
          <circle cx={69} cy={50} r={3.6} fill={F} />
          <path d={pose === "calm" ? "M54 60 Q60 65 66 60" : "M54 60 Q60 67 66 60"} {...faceStroke} />
        </>
      )
    case "cheer":
      return (
        <>
          <path d="M47 51 Q51 45 55 51" {...faceStroke} />
          <path d="M65 51 Q69 45 73 51" {...faceStroke} />
          <path d="M53 59 Q60 70 67 59 Z" fill={F} />
          <g fill="none" stroke={A} strokeWidth={2.5} strokeLinecap="round">
            <path d="M22 21 V31 M17 26 H27" />
            <path d="M100 17 V27 M95 22 H105" />
          </g>
        </>
      )
    case "sleepy":
      return (
        <>
          <path d="M47 49 Q51 53 55 49" {...faceStroke} />
          <path d="M65 49 Q69 53 73 49" {...faceStroke} />
          <circle cx={60} cy={61} r={2.2} fill={F} />
          <text x={92} y={36} fontSize={15} fontWeight="bold" fill={M}>
            z
          </text>
          <text x={103} y={23} fontSize={10} fontWeight="bold" fill={M}>
            z
          </text>
        </>
      )
  }
}

export function Mascot({
  pose = "calm",
  size = 96,
  className,
}: {
  pose?: MascotPose
  size?: number
  className?: string
}) {
  const compact = size < 48

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      // Idle breathing (globals.css, off under reduced motion) — full variant only.
      className={[compact ? "" : "mb-breathe", className ?? ""].join(" ").trim() || undefined}
    >
      {/* Draw order: arms behind the body, then feet, then the face. */}
      {!compact && (pose === "wave" || pose === "cheer") && (
        <g fill="none" stroke={P} strokeWidth={9} strokeLinecap="round">
          <path d={ARM_RIGHT} />
          {pose === "cheer" && <path d={ARM_LEFT} />}
        </g>
      )}

      <path d={compact ? BODY_COMPACT : BODY_FULL} fill={P} />

      {!compact && (
        <>
          <ellipse cx={34} cy={103} rx={10} ry={3.5} fill={A} />
          <ellipse cx={86} cy={103} rx={10} ry={3.5} fill={A} />
          <ellipse cx={44} cy={59} rx={4} ry={2.6} fill={A} opacity={0.75} />
          <ellipse cx={76} cy={59} rx={4} ry={2.6} fill={A} opacity={0.75} />
        </>
      )}

      {compact ? (
        <>
          <circle cx={51} cy={50} r={5} fill={F} />
          <circle cx={69} cy={50} r={5} fill={F} />
          <path d="M54 60 Q60 65 66 60" fill="none" stroke={F} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : (
        <Face pose={pose} />
      )}
    </svg>
  )
}
