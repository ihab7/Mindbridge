// Sleep Stories content: a plain, static module instead of a database table.
// Stories never change per user or per request, so they belong in the repo
// as build-time content, not behind a publish-flag workflow. Add new
// entries directly to SLEEP_STORIES below; there is no sync step.

export type SleepStory = {
  slug: string
  category: "hekaya" | "classic"
  language: "ar" | "en" | "fr"
  title: string
  subtitle?: string
  openerLine?: string
  scriptText: string
  narratorName: string
  audioSrc: string | null // null = transcript only, narration not recorded yet
  durationSec?: number
  ambientBed: "fire" | "rain" | "ocean" | "forest" | "none"
  coverGradient: string // full CSS gradient string
}

export const SLEEP_STORIES: SleepStory[] = [
  // ── Arabic (hekaya) — real recordings ──
  {
    slug: "essera9-wel-alf-dinar",
    language: "ar",
    category: "hekaya",
    title: "الصراق والألف دينار",
    subtitle: "The Thief and the Thousand Dinars",
    openerLine: "كان يا ما كان...",
    narratorName: "Grandfather recording",
    audioSrc: "/sleep-stories/hekaya/essera9-wel-alf-dinar.mp3",
    durationSec: 453,
    ambientBed: "fire",
    coverGradient: "linear-gradient(160deg,#3a1f0f,#6b3410,#8a4a18)",
    scriptText: "[Transcription à venir]",
  },
  {
    slug: "ettajir-ou-oueldou-ou-lashab",
    language: "ar",
    category: "hekaya",
    title: "التاجر وولده والصاحب",
    subtitle: "The Merchant, His Son, and the Friend",
    openerLine: "يُحكى أن...",
    narratorName: "Grandfather recording",
    audioSrc: "/sleep-stories/hekaya/ettajir-ou-oueldou-ou-lashab.mp3",
    durationSec: 923,
    ambientBed: "fire",
    coverGradient: "linear-gradient(160deg,#2a1a20,#4a2530,#6b3540)",
    scriptText: "[Transcription à venir]",
  },

  // ── English (classic) — text now, audio later ──
  {
    slug: "cottage-by-the-millpond",
    language: "en",
    category: "classic",
    title: "The Cottage by the Millpond",
    narratorName: "Synthesized narration",
    audioSrc: "/sleep-stories/classics/cottage-by-the-millpond.mp3",
    durationSec: 33,
    ambientBed: "rain",
    coverGradient: "linear-gradient(160deg,#1a2a38,#2d4256,#3f5a72)",
    scriptText:
      "In a small cottage beside an old millpond, where the water wheel had long since stopped turning, an old miller kept a single candle burning each night. The pond was still as glass, holding the whole sky inside it — every star, the slow moon, the drifting clouds. He would sit by the window and watch the water hold the heavens so gently, so patiently, until his own eyes grew heavy, and he too became still, like the pond, like the wheel, like the quiet house around him.",
  },
  {
    slug: "clockmakers-last-hour",
    language: "en",
    category: "classic",
    title: "The Clockmaker's Last Hour",
    narratorName: "Synthesized narration",
    audioSrc: "/sleep-stories/classics/clockmakers-last-hour.mp3",
    durationSec: 35,
    ambientBed: "none",
    coverGradient: "linear-gradient(160deg,#241f2f,#3a3248,#4f4260)",
    scriptText:
      "In a narrow shop on a narrow street, an old clockmaker wound his very last clock of the evening, as he had done for sixty years. Around him, dozens of clocks ticked in gentle disagreement, a soft orchestra of seconds. He never rushed. He never worried what time it truly was. Tonight, as every night, he simply listened to his clocks breathe together, slower and slower, until even the loudest of them seemed to whisper, until the whole shop grew as quiet and as still as sleep itself.",
  },

  // ── French (classic) — text now, audio later ──
  {
    slug: "maison-au-bord-du-verger",
    language: "fr",
    category: "classic",
    title: "La Maison au Bord du Verger",
    narratorName: "Narration de synthèse",
    audioSrc: "/sleep-stories/classics/maison-au-bord-du-verger.mp3",
    durationSec: 31,
    ambientBed: "fire",
    coverGradient: "linear-gradient(160deg,#1a2438,#2c3a50,#3e5068)",
    scriptText:
      "Au bord d'un vieux verger, une petite maison de pierre gardait la chaleur du jour bien après le coucher du soleil. Une grand-mère y filait la laine près du feu, sans se presser, le geste lent et régulier comme une respiration. Dehors, les pommiers laissaient tomber leurs fruits un à un, doucement, sur l'herbe endormie. Elle disait toujours que la nuit n'était pas faite pour finir les choses, mais pour les laisser reposer, tout doucement, jusqu'au matin.",
  },
  {
    slug: "gardien-du-vieux-phare",
    language: "fr",
    category: "classic",
    title: "Le Gardien du Vieux Phare",
    narratorName: "Narration de synthèse",
    audioSrc: "/sleep-stories/classics/gardien-du-vieux-phare.mp3",
    durationSec: 36,
    ambientBed: "ocean",
    coverGradient: "linear-gradient(160deg,#141f2c,#22384c,#2f4d66)",
    scriptText:
      "Sur la côte bretonne, où les falaises plongent dans une mer grise et patiente, un vieux gardien de phare montait l'escalier de pierre une dernière fois ce soir. Chaque marche lui était familière, usée par des années de pas tranquilles. En bas, les vagues parlaient leur vieux langage, sans hâte, sans fin. Il n'y avait rien à réparer ce soir. Rien à surveiller de trop près. Juste la lumière qui tournait doucement, et la mer qui respirait, encore et encore, tout comme vous respirez maintenant.",
  },
]

export function getStoriesByLanguage(lang: SleepStory["language"]): SleepStory[] {
  return SLEEP_STORIES.filter((s) => s.language === lang)
}

export function getStoryBySlug(slug: string): SleepStory | null {
  return SLEEP_STORIES.find((s) => s.slug === slug) ?? null
}

export function getAvailableLanguages(): SleepStory["language"][] {
  return Array.from(new Set(SLEEP_STORIES.map((s) => s.language)))
}
