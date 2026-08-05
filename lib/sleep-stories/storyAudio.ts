import { startNatureSound, type NatureNode, type NatureSoundId } from "@/lib/audio/natureSounds"
import type { SleepStory } from "./stories"

type AmbientBed = SleepStory["defaultAmbient"]

type EndedCallback = () => void
type TimerMode = "narration-end" | "duration"

/** One "instance" of an ambient bed: its own gain node (so it can be faded
 *  independently of every other layer) plus the nodes/timers that
 *  `startNatureSound` registers for it. Crossfading is just: spawn a new
 *  layer at gain 0 and ramp it up, while ramping every existing layer down
 *  to 0 over the same span, then tearing the old ones down. */
type AmbientLayer = {
  gain: GainNode
  nodes: NatureNode[]
  timers: Array<ReturnType<typeof setTimeout>>
}

const AMBIENT_CROSSFADE_SEC = 1

/**
 * Dual-channel sleep-story playback: a real HTMLAudioElement for narration
 * (bound to a story's static audioSrc) and a Web Audio ambient bed (reusing
 * lib/audio/natureSounds.ts), each with fully independent on/off + volume --
 * same interaction pattern as the anxiety program's AudioMixer. No
 * speechSynthesis anywhere: narration is always a real recorded file, or
 * absent (loadStory(null) -- the UI shows ComingSoonState in that case, this
 * class simply has nothing to play).
 */
export class StoryAudio {
  private audioEl: HTMLAudioElement | null = null
  private narrationOn = true
  private narrationVol = 0.8

  private ctx: AudioContext | null = null
  private ambientLayers: AmbientLayer[] = []
  private ambientOn = true
  private ambientVol = 0.4
  private ambientBed: AmbientBed = "none"

  private sleepTimer: ReturnType<typeof setTimeout> | null = null
  private timerMode: TimerMode = "narration-end"
  private endedCallbacks: EndedCallback[] = []
  private playing = false

  private handleNarrationEnded = () => {
    if (this.timerMode === "narration-end") {
      this.playing = false
      this.stopAmbient()
      this.notifyEnded()
    }
    // else: a fixed-duration timer is running -- let ambient keep playing
    // (narration just stays finished) until the timer itself fires.
  }

  private notifyEnded() {
    this.endedCallbacks.forEach((cb) => cb())
  }

  /** Null-safe: a story with no recorded audio yet loads to a no-op player
   *  state instead of throwing -- the UI is expected to render
   *  ComingSoonState instead of calling play() in that case. */
  loadStory(audioUrl: string | null) {
    this.teardownNarration()
    if (!audioUrl) return
    const el = new Audio(audioUrl)
    el.preload = "metadata"
    el.volume = this.narrationOn ? this.narrationVol : 0
    el.addEventListener("ended", this.handleNarrationEnded)
    this.audioEl = el
  }

  onEnded(cb: EndedCallback) {
    this.endedCallbacks.push(cb)
  }

  play() {
    if (!this.audioEl) return
    this.playing = true
    void this.audioEl.play()
    this.ensureAmbientContext()
    if (this.ambientOn) this.startAmbient()
  }

  pause() {
    this.playing = false
    this.audioEl?.pause()
    this.stopAmbient()
  }

  seek(sec: number) {
    if (this.audioEl) this.audioEl.currentTime = sec
  }

  isPlaying() {
    return this.playing
  }

  getCurrentTime() {
    return this.audioEl?.currentTime ?? 0
  }

  getDuration() {
    return this.audioEl && !Number.isNaN(this.audioEl.duration) ? this.audioEl.duration : 0
  }

  setNarrationVolume(v: number) {
    this.narrationVol = v
    if (this.audioEl && this.narrationOn) this.audioEl.volume = v
  }

  setNarrationOn(on: boolean) {
    this.narrationOn = on
    if (this.audioEl) this.audioEl.volume = on ? this.narrationVol : 0
  }

  /** Sets the ambient bed without a listener gesture behind it (initial
   *  load, or restoring a saved preference before playback starts). If
   *  ambient is already playing this bed changes with a hard cut -- callers
   *  driven by the icon picker should use `selectAmbient` instead, which
   *  crossfades. */
  setAmbientBed(bed: AmbientBed) {
    this.ambientBed = bed
    if (this.playing && this.ambientOn) this.startAmbient()
  }

  /** Listener picked an ambient icon (including "none"). Turns ambient on
   *  if it was off, and crossfades live into the new bed if something was
   *  already playing -- narration is entirely untouched by any of this. */
  selectAmbient(bed: AmbientBed) {
    const wasOn = this.ambientOn
    const changed = bed !== this.ambientBed
    this.ambientBed = bed
    this.ambientOn = true
    if (!this.playing) return
    if (!changed && wasOn) return
    if (wasOn && changed) this.crossfadeToAmbient(bed)
    else this.startAmbient()
  }

  setAmbientVolume(v: number) {
    this.ambientVol = v
    if (!this.ctx || !this.ambientOn) return
    const active = this.ambientLayers[this.ambientLayers.length - 1]
    if (active) active.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1)
  }

  setAmbientOn(on: boolean) {
    this.ambientOn = on
    if (!this.playing) return
    if (on) this.startAmbient()
    else this.stopAmbient()
  }

  /** null = tie the session end to narration finishing naturally.
   *  A specific value keeps ambient playing past narration's end (if the
   *  story is shorter than the chosen timer) until the timer fires. */
  startSleepTimer(minutes: number | null) {
    this.clearSleepTimer()
    this.timerMode = minutes === null ? "narration-end" : "duration"
    if (minutes !== null) {
      this.sleepTimer = setTimeout(() => {
        this.pause()
        this.notifyEnded()
      }, minutes * 60 * 1000)
    }
  }

  private clearSleepTimer() {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer)
      this.sleepTimer = null
    }
  }

  private ensureAmbientContext() {
    if (typeof window === "undefined" || this.ambientBed === "none") return
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === "suspended") void this.ctx.resume()
  }

  /** Fresh start with no existing layer to fade from: used on play(), on
   *  toggling ambient back on, and on picking a bed while ambient was off. */
  private startAmbient() {
    this.stopAmbient()
    const bed = this.ambientBed
    if (bed === "none") return
    this.ensureAmbientContext()
    if (!this.ctx) return

    const layer = this.spawnAmbientLayer(bed, this.ctx)
    this.ambientLayers = [layer]
    layer.gain.gain.setTargetAtTime(this.ambientVol, this.ctx.currentTime, 0.3)
  }

  /** Ramps every currently-playing layer down to silence while ramping a
   *  new one (unless switching to "none") up to the current ambient
   *  volume, over AMBIENT_CROSSFADE_SEC. Old layers are torn down only
   *  after their fade-out finishes, so nothing clicks or cuts. */
  private crossfadeToAmbient(bed: AmbientBed) {
    this.ensureAmbientContext()
    if (!this.ctx) return
    const ctx = this.ctx

    const oldLayers = this.ambientLayers
    this.ambientLayers = []

    if (bed !== "none") {
      const layer = this.spawnAmbientLayer(bed, ctx)
      this.ambientLayers = [layer]
      layer.gain.gain.setValueAtTime(0, ctx.currentTime)
      layer.gain.gain.linearRampToValueAtTime(this.ambientVol, ctx.currentTime + AMBIENT_CROSSFADE_SEC)
    }

    oldLayers.forEach((layer) => {
      layer.gain.gain.cancelScheduledValues(ctx.currentTime)
      layer.gain.gain.setValueAtTime(layer.gain.gain.value, ctx.currentTime)
      layer.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + AMBIENT_CROSSFADE_SEC)
      layer.timers.push(
        setTimeout(() => this.teardownLayer(layer), AMBIENT_CROSSFADE_SEC * 1000 + 100)
      )
    })
  }

  private spawnAmbientLayer(bed: Exclude<AmbientBed, "none">, ctx: AudioContext): AmbientLayer {
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(ctx.destination)
    const layer: AmbientLayer = { gain, nodes: [], timers: [] }

    startNatureSound(bed as NatureSoundId, {
      ctx,
      destination: gain,
      pushNode: (n) => layer.nodes.push(n),
      pushTimer: (t) => layer.timers.push(t),
      isStillActive: () => this.ambientLayers.includes(layer),
    })
    return layer
  }

  private teardownLayer(layer: AmbientLayer) {
    layer.timers.forEach((t) => clearTimeout(t))
    layer.nodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        /* already stopped */
      }
    })
    layer.gain.disconnect()
  }

  private stopAmbient() {
    this.ambientLayers.forEach((l) => this.teardownLayer(l))
    this.ambientLayers = []
  }

  private teardownNarration() {
    if (this.audioEl) {
      this.audioEl.pause()
      this.audioEl.removeEventListener("ended", this.handleNarrationEnded)
      this.audioEl.src = ""
      this.audioEl = null
    }
  }

  /** Stops everything immediately -- must be called on player
   *  close/unmount so no audio persists after navigating away. */
  destroy() {
    this.playing = false
    this.clearSleepTimer()
    this.teardownNarration()
    this.stopAmbient()
    try {
      this.ctx?.close()
    } catch {
      /* ignore */
    }
    this.ctx = null
    this.endedCallbacks = []
  }
}
