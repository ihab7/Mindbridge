import type { ProgramSoundId } from "./types"

export type PlayerSoundTheme = {
  gradient: string
  text: string
  circleOuter: string
  circleInner: string
  ring: string
}

/** Full-screen player backgrounds, keyed by the active nature sound. Purely visual —
 *  switching sound updates this even when the nature audio channel is muted. */
export const PLAYER_SOUND_THEMES: Record<ProgramSoundId, PlayerSoundTheme> = {
  rain: {
    gradient: "linear-gradient(160deg,#d4eaf7 0%,#7fb3d3 50%,#4a8ab5 100%)",
    text: "#0a2038",
    circleOuter: "rgba(10,50,90,0.32)",
    circleInner: "rgba(10,50,90,0.60)",
    ring: "#0a2038",
  },
  ocean: {
    gradient: "linear-gradient(160deg,#cce8f4 0%,#60b8e0 50%,#2a8ab8 100%)",
    text: "#061828",
    circleOuter: "rgba(6,40,70,0.32)",
    circleInner: "rgba(6,40,70,0.60)",
    ring: "#061828",
  },
  forest: {
    gradient: "linear-gradient(160deg,#d4edda 0%,#85c98a 50%,#4a9e55 100%)",
    text: "#082818",
    circleOuter: "rgba(8,50,20,0.32)",
    circleInner: "rgba(8,50,20,0.60)",
    ring: "#082818",
  },
}

export const SOUND_ICONS: Record<ProgramSoundId, string> = {
  rain: "🌧",
  ocean: "🌊",
  forest: "🌿",
}
