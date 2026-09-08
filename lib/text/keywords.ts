// Shared keyword extraction. Originally private to
// lib/program/ai/buildPatientDigest.ts; extracted here so the practitioner
// wellbeing panel can reuse the exact same tokenizer/counter rather than
// duplicating it. Pure string processing — no DB, safe on the client.

/** Small, combined en/fr/ar stopword set — the patient's language isn't a
 *  tracked field, so keyword extraction filters against all three at once
 *  rather than guessing. */
export const STOPWORDS = new Set(
  [
    // English
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being", "to", "of", "in",
    "on", "for", "with", "at", "by", "from", "about", "as", "it", "this", "that", "i", "me", "my", "we", "our",
    "you", "your", "he", "she", "they", "them", "not", "no", "so", "just", "very", "really", "have", "has",
    "had", "do", "does", "did", "will", "would", "can", "could", "should", "if", "then", "than", "there",
    // French
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "mais", "est", "sont", "était", "être",
    "à", "en", "sur", "pour", "avec", "au", "aux", "par", "ce", "cette", "ces", "je", "me", "mon", "ma", "nous",
    "notre", "vous", "votre", "il", "elle", "ils", "elles", "ne", "pas", "si", "que", "qui", "dans", "plus",
    // Arabic
    "في", "من", "إلى", "على", "أن", "هذا", "هذه", "ذلك", "التي", "الذي", "و", "أو", "لا", "لم", "لن", "ما",
    "هو", "هي", "أنا", "نحن", "انت", "أنت", "مع", "عن", "كل", "بعد", "قبل", "كان", "كانت",
  ].map((w) => w.toLowerCase())
)

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

export function topKeywords(texts: string[], limit: number): { word: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const text of texts) {
    if (!text) continue
    for (const word of tokenize(text)) {
      counts.set(word, (counts.get(word) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }))
}
