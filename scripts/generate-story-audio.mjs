// One-off local script: synthesizes narration for the EN/FR "classic" sleep
// stories via Microsoft Edge's free neural TTS service (the `edge-tts`
// Python package, invoked as a subprocess -- see PROVIDER NOTES below) and
// commits the resulting .mp3 files to the repo. Never called at runtime --
// see lib/sleep-stories/storyAudio.ts, which only ever plays a static
// audioSrc file, and ComingSoonState.tsx, which is what renders for any
// story still missing one.
//
// Arabic "hekaya" stories keep their human recordings: this script only ever
// touches entries where category === "classic" && audioSrc === null, so it
// structurally cannot regenerate or overwrite public/sleep-stories/hekaya/.
//
// PROVIDER NOTES
// No API key, no account, no per-call cost. Two implementations of
// edge-tts exist:
//   - npm `edge-tts` (JS port): rejected. Its package.json `main` points at
//     an unbuilt index.ts (fails under plain Node with ERR_UNKNOWN_FILE_
//     EXTENSION), and more importantly it's licensed CC BY-NC-SA 4.0
//     (NonCommercial) -- not usable in a commercial product.
//   - PyPI `edge-tts` (the original, github.com/rany2/edge-tts): used here.
//     LGPLv3, actively maintained, invoked as a subprocess (`python -m
//     edge_tts`) so nothing about it is linked into the app -- it's a pure
//     external CLI call, same as shelling out to ffmpeg.
// Install once: `py -m pip install edge-tts` (or `python3 -m pip install
// edge-tts` on macOS/Linux). This script auto-detects whichever of
// py / python3 / python has the module installed.
//
// Usage:
//   node scripts/generate-story-audio.mjs
//   node scripts/generate-story-audio.mjs --force   (regenerate existing files too)

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, renameSync } from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import os from "node:os"
import crypto from "node:crypto"
import { spawnSync } from "node:child_process"
import ts from "typescript"
import { parseBuffer } from "music-metadata"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const STORIES_PATH = path.join(ROOT, "lib/sleep-stories/stories.ts")
const OUTPUT_DIR = path.join(ROOT, "public/sleep-stories/classics")
const FORCE = process.argv.includes("--force")

// Bedtime pacing, per spec.
const RATE = "-15%"
const PITCH = "-5Hz"
const VOICE = { en: "en-GB-SoniaNeural", fr: "fr-FR-DeniseNeural" } // calmer EN voice; warm FR voice
const NARRATOR_NAME = { en: "Synthesized narration", fr: "Narration de synthèse" }

// ---------------------------------------------------------------------------
// Locate a Python interpreter that has `edge-tts` installed. Tries `py`
// first (the standard launcher on Windows) then falls back to python3/python
// for other platforms.
// ---------------------------------------------------------------------------
function findPythonCommand() {
  for (const cmd of ["py", "python3", "python"]) {
    const res = spawnSync(cmd, ["-m", "edge_tts", "--version"], { stdio: "pipe" })
    if (!res.error && res.status === 0) return cmd
  }
  throw new Error(
    "Could not find a Python interpreter with edge-tts installed. Run: py -m pip install edge-tts (or python3 -m pip install edge-tts)"
  )
}

// ---------------------------------------------------------------------------
// stories.ts is TypeScript; this project has no tsx/ts-node. `typescript` is
// already a devDependency though, so we transpile the file in-memory with
// the compiler API and dynamic-import the result from a throwaway temp file
// instead of adding a new dependency just for this script.
// ---------------------------------------------------------------------------
async function transpileAndImport(sourceText) {
  const { outputText, diagnostics } = ts.transpileModule(sourceText, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
    fileName: "stories.ts",
    reportDiagnostics: true,
  })
  if (diagnostics && diagnostics.length > 0) {
    const msg = diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")).join("\n")
    throw new Error(`stories.ts failed to transpile:\n${msg}`)
  }
  const tmpFile = path.join(os.tmpdir(), `stories.${Date.now()}.${crypto.randomBytes(4).toString("hex")}.mjs`)
  writeFileSync(tmpFile, outputText, "utf8")
  try {
    return await import(pathToFileURL(tmpFile).href)
  } finally {
    unlinkSync(tmpFile)
  }
}

// ---------------------------------------------------------------------------
// TTS
// ---------------------------------------------------------------------------
function addPauseBreaks(text) {
  // The edge-tts CLI always auto-wraps plain text into its own SSML
  // envelope -- it doesn't accept pre-authored SSML tags as passthrough, so
  // literal <break/> tags would just get read aloud. Putting each sentence
  // on its own line is the practical stand-in for short inter-sentence
  // pauses on a bedtime-paced narration.
  return text.split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ])/).join("\n\n")
}

function synthesizeToFile(pythonCmd, text, voice, outPath) {
  const tmpTextFile = path.join(os.tmpdir(), `story-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.txt`)
  writeFileSync(tmpTextFile, text, "utf8")
  try {
    const res = spawnSync(
      pythonCmd,
      ["-m", "edge_tts", "-f", tmpTextFile, "-v", voice, `--rate=${RATE}`, `--pitch=${PITCH}`, "--write-media", outPath],
      { stdio: "pipe" }
    )
    if (res.error) throw res.error
    if (res.status !== 0) {
      const stderr = res.stderr ? res.stderr.toString() : ""
      throw new Error(`edge-tts exited with code ${res.status}: ${stderr.slice(0, 500)}`)
    }
  } finally {
    unlinkSync(tmpTextFile)
  }
}

async function probeDurationFromFile(filePath) {
  const meta = await parseBuffer(readFileSync(filePath), "audio/mpeg")
  return meta.format.duration ?? 0
}

// ---------------------------------------------------------------------------
// stories.ts patcher -- edits only the named story's object block via brace
// matching on the source text, so untouched entries (including both Hekaya
// stories) are never rewritten, reformatted, or even re-serialized.
// ---------------------------------------------------------------------------
function updateStoryBlock(fileText, slug, { audioSrc, durationSec, narratorName }) {
  const anchor = `slug: "${slug}"`
  const anchorIdx = fileText.indexOf(anchor)
  if (anchorIdx === -1) throw new Error(`Could not find story block for slug "${slug}" in stories.ts`)

  const braceStart = fileText.lastIndexOf("{", anchorIdx)
  let depth = 0
  let braceEnd = -1
  for (let i = braceStart; i < fileText.length; i++) {
    if (fileText[i] === "{") depth++
    else if (fileText[i] === "}") {
      depth--
      if (depth === 0) {
        braceEnd = i
        break
      }
    }
  }
  if (braceEnd === -1) throw new Error(`Could not find end of story block for slug "${slug}"`)

  let block = fileText.slice(braceStart, braceEnd + 1)
  if (!/audioSrc:\s*null/.test(block)) {
    throw new Error(`Story "${slug}" does not have audioSrc: null -- refusing to modify it`)
  }

  block = block.replace(/audioSrc:\s*null/, `audioSrc: ${JSON.stringify(audioSrc)},\n    durationSec: ${durationSec}`)
  block = block.replace(/narratorName:\s*"[^"]*"/, `narratorName: ${JSON.stringify(narratorName)}`)

  return fileText.slice(0, braceStart) + block + fileText.slice(braceEnd + 1)
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  const pythonCmd = findPythonCommand()
  console.log(`Using edge-tts via: ${pythonCmd} -m edge_tts`)

  mkdirSync(OUTPUT_DIR, { recursive: true })

  const originalSource = readFileSync(STORIES_PATH, "utf8")
  const { SLEEP_STORIES: originalStories } = await transpileAndImport(originalSource)

  const targets = originalStories.filter((s) => s.category === "classic" && s.audioSrc === null)
  if (targets.length === 0) {
    console.log("No classic stories with audioSrc: null found -- nothing to do.")
    return
  }

  let storiesFileText = originalSource
  let storiesFileDirty = false
  const results = []

  for (const story of targets) {
    const outPath = path.join(OUTPUT_DIR, `${story.slug}.mp3`)
    const relSrc = `/sleep-stories/classics/${story.slug}.mp3`
    const voice = VOICE[story.language]

    if (existsSync(outPath) && !FORCE) {
      // Re-running is cheap: reuse the file already on disk, just make sure
      // stories.ts reflects it (covers the case of a previous run that wrote
      // the mp3 but was interrupted before the stories.ts write).
      console.log(`Skip ${story.slug} (already exists on disk, use --force to regenerate)`)
      try {
        const existingDuration = Math.round(await probeDurationFromFile(outPath))
        storiesFileText = updateStoryBlock(storiesFileText, story.slug, {
          audioSrc: relSrc,
          durationSec: existingDuration,
          narratorName: NARRATOR_NAME[story.language],
        })
        storiesFileDirty = true
        results.push({
          slug: story.slug,
          language: story.language,
          voice,
          durationSec: existingDuration,
          outPath: path.relative(ROOT, outPath),
          charCount: 0,
          note: "reused existing file",
        })
      } catch {
        // stories.ts already had this entry updated by a prior run; nothing to do.
      }
      continue
    }

    const inputText = addPauseBreaks(story.scriptText)
    const charCount = story.scriptText.length

    console.log(`Generating ${story.slug} (${story.language}, voice=${voice})...`)
    const tmpPath = `${outPath}.tmp`
    try {
      synthesizeToFile(pythonCmd, inputText, voice, tmpPath)
    } catch (err) {
      console.error(`FAILED ${story.slug}: ${err.message}`)
      if (existsSync(tmpPath)) unlinkSync(tmpPath)
      continue
    }

    let duration
    try {
      duration = await probeDurationFromFile(tmpPath)
    } catch (err) {
      console.error(`FAILED ${story.slug}: could not probe duration (${err.message})`)
      unlinkSync(tmpPath)
      continue
    }
    if (!duration) {
      console.error(`FAILED ${story.slug}: empty or unparseable audio, skipping`)
      unlinkSync(tmpPath)
      continue
    }

    // Only now -- after the file is confirmed complete and parseable -- does
    // it get promoted to its real name, so a crash mid-synthesis never
    // leaves a truncated .mp3 visible at the final path.
    renameSync(tmpPath, outPath)

    const durationSecRounded = Math.round(duration)
    storiesFileText = updateStoryBlock(storiesFileText, story.slug, {
      audioSrc: relSrc,
      durationSec: durationSecRounded,
      narratorName: NARRATOR_NAME[story.language],
    })
    storiesFileDirty = true

    results.push({
      slug: story.slug,
      language: story.language,
      voice,
      durationSec: durationSecRounded,
      outPath: path.relative(ROOT, outPath),
      charCount,
      note: "",
    })
  }

  if (storiesFileDirty) {
    // Validate the rewritten source before touching disk: re-transpile it,
    // confirm the story count is unchanged and that every untouched entry
    // (crucially, both Hekaya entries) is byte-identical to the original.
    const { SLEEP_STORIES: patchedStories } = await transpileAndImport(storiesFileText)
    if (patchedStories.length !== originalStories.length) {
      throw new Error(
        `Refusing to write stories.ts: story count changed (${originalStories.length} -> ${patchedStories.length})`
      )
    }
    const touchedSlugs = new Set(results.map((r) => r.slug))
    for (let i = 0; i < originalStories.length; i++) {
      const before = originalStories[i]
      const after = patchedStories[i]
      if (touchedSlugs.has(before.slug)) continue
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        throw new Error(`Refusing to write stories.ts: untouched story "${before.slug}" would change`)
      }
    }

    const tmpStoriesPath = `${STORIES_PATH}.tmp`
    writeFileSync(tmpStoriesPath, storiesFileText, "utf8")
    renameSync(tmpStoriesPath, STORIES_PATH)
    console.log(`\nUpdated ${path.relative(ROOT, STORIES_PATH)}`)
  }

  console.log("\n=== Summary ===")
  if (results.length === 0) {
    console.log("No files generated or reused.")
  } else {
    for (const r of results) {
      const mm = `${Math.floor(r.durationSec / 60)}:${String(r.durationSec % 60).padStart(2, "0")}`
      console.log(
        `  ${r.slug.padEnd(28)} voice=${r.voice.padEnd(20)} duration=${mm.padEnd(6)} chars=${String(
          r.charCount
        ).padEnd(6)} cost=$0.00 (free)  ${r.outPath}${r.note ? "  (" + r.note + ")" : ""}`
      )
    }
    const totalChars = results.reduce((a, r) => a + r.charCount, 0)
    console.log(`\nTotal: ${totalChars} chars, $0.00 (edge-tts is free)`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
