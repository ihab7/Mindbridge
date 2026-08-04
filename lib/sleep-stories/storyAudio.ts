import { startNatureSound, type NatureNode, type NatureSoundId } from "@/lib/audio/natureSounds"
import type { SleepStory } from "./stories"

type AmbientBed = SleepStory["ambientBed"]

type EndedCallback = () => void
type TimerMode = "narration-end" | "duration"

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
  private ambientGain: GainNode | null = null
  private ambientNodes: NatureNode[] = []
  private ambientTimers: Array<ReturnType<typeof setTimeout>> = []
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

  setAmbientBed(bed: AmbientBed) {
    this.ambientBed = bed
    if (this.playing && this.ambientOn) this.startAmbient()
  }

  setAmbientVolume(v: number) {
    this.ambientVol = v
    if (this.ambientGain && this.ctx && this.ambientOn) {
      this.ambientGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1)
    }
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

  private startAmbient() {
    if (this.ambientBed === "none") {
      this.stopAmbient()
      return
    }
    this.ensureAmbientContext()
    if (!this.ctx) return

    this.stopAmbient()
    const ctx = this.ctx
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(ctx.destination)
    this.ambientGain = gain
    gain.gain.setTargetAtTime(this.ambientVol, ctx.currentTime, 0.3)

    startNatureSound(this.ambientBed as NatureSoundId, {
      ctx,
      destination: gain,
      pushNode: (n) => this.ambientNodes.push(n),
      pushTimer: (t) => this.ambientTimers.push(t),
      isStillActive: () => this.ambientGain === gain,
    })
  }

  private stopAmbient() {
    this.ambientTimers.forEach((t) => clearTimeout(t))
    this.ambientTimers = []
    this.ambientNodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        /* already stopped */
      }
    })
    this.ambientNodes = []
    this.ambientGain?.disconnect()
    this.ambientGain = null
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
