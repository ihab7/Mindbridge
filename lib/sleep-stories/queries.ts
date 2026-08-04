import { getSql } from "@/lib/db"
import { getStoriesByLanguage, type SleepStory } from "./stories"

export async function logStoryPlay(params: {
  storySlug: string
  patientId: number
  completed: boolean
  timerMinutes: number | null
}): Promise<void> {
  const sql = getSql()
  await sql`
    INSERT INTO sleep_story_plays (story_id, patient_id, completed, timer_minutes)
    VALUES (${params.storySlug}, ${params.patientId}, ${params.completed}, ${params.timerMinutes})
  `
}

/** Best story to deep-link the sleep nudge to: prefer one with real
 *  narration already recorded in the patient's language, else the first
 *  story in that language, else null (caller falls back to the library
 *  page). No DB involved -- SLEEP_STORIES is static. */
export function getBestNudgeStory(language: SleepStory["language"]): SleepStory | null {
  const inLanguage = getStoriesByLanguage(language)
  if (inLanguage.length === 0) return null
  return inLanguage.find((s) => s.audioSrc !== null) ?? inLanguage[0]
}
