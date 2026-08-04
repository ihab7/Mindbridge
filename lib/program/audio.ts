import type { ProgramSoundId } from "./types"
import { startNatureSound, type NatureNode } from "@/lib/audio/natureSounds"

type ToneDirection = "in" | "out"
type SfxKind = "tap" | "select" | "toggle" | "tick" | "chime" | "complete"

/**
 * Dual-channel session audio: guide tones and nature sounds are independent
 * gain stages with independent on/off state. Muting or adjusting one never
 * touches the other. One-shot UI sfx bypass both channels entirely and are
 * silenced only by the master mute.
 *
 * AudioContext is created lazily (see `init()`) — never on mount — so the
 * browser's autoplay policy is satisfied by calling it from a user gesture.
 */
class SessionAudio {
  private ctx: AudioContext | null = null

  private masterMuted = false

  private natureOn = true
  private natureVol = 0.5
  private natureGain: GainNode | null = null
  private natureNodes: NatureNode[] = []
  private natureTimers: Array<ReturnType<typeof setTimeout>> = []
  private currentSound: ProgramSoundId = "rain"

  private toneOn = true
  private toneVol = 0.5
  private toneGain: GainNode | null = null

  init() {
    if (typeof window === "undefined") return
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    const ctx = this.ctx
    if (ctx.state === "suspended") void ctx.resume()
    if (!this.toneGain) {
      this.toneGain = ctx.createGain()
      this.toneGain.gain.value = this.toneOn && !this.masterMuted ? this.toneVol : 0
      this.toneGain.connect(ctx.destination)
    }
  }

  // ── nature channel ──────────────────────────────────────────────────────

  private clearNatureTimers() {
    this.natureTimers.forEach((t) => clearTimeout(t))
    this.natureTimers = []
  }

  startNature() {
    if (!this.ctx) return
    this.stopNature()

    const ctx = this.ctx
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(ctx.destination)
    this.natureGain = gain

    const targetVol = this.masterMuted ? 0 : this.natureVol
    gain.gain.setTargetAtTime(targetVol, ctx.currentTime, 0.3)

    startNatureSound(this.currentSound, {
      ctx,
      destination: gain,
      pushNode: (n: NatureNode) => this.natureNodes.push(n),
      pushTimer: (t) => this.natureTimers.push(t),
      isStillActive: () => this.natureGain === gain,
    })
  }

  stopNature() {
    this.clearNatureTimers()
    this.natureNodes.forEach((n) => { try { n.stop() } catch { /* already stopped */ } })
    this.natureNodes = []
    this.natureGain?.disconnect()
    this.natureGain = null
  }

  setNatureOn(on: boolean) {
    this.natureOn = on
    if (!this.ctx) return
    if (on) this.startNature()
    else this.stopNature()
  }

  setNatureVolume(v: number) {
    this.natureVol = v
    if (this.natureGain && this.ctx && !this.masterMuted) {
      this.natureGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1)
    }
  }

  switchSound(id: ProgramSoundId) {
    this.currentSound = id
    if (this.natureOn && this.natureGain) this.startNature()
  }

  getCurrentSound() {
    return this.currentSound
  }

  // ── tone channel ─────────────────────────────────────────────────────────

  setToneOn(on: boolean) {
    this.toneOn = on
    if (this.toneGain && this.ctx && !this.masterMuted) {
      this.toneGain.gain.setTargetAtTime(on ? this.toneVol : 0, this.ctx.currentTime, 0.15)
    }
  }

  setToneVolume(v: number) {
    this.toneVol = v
    if (this.toneGain && this.ctx && this.toneOn && !this.masterMuted) {
      this.toneGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1)
    }
  }

  playBreathTone(direction: ToneDirection, durSec: number) {
    if (!this.ctx || !this.toneGain) return
    if (this.masterMuted || !this.toneOn) return

    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    const [from, to] = direction === "in" ? [220, 330] : [330, 220]
    osc.frequency.setValueAtTime(from, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(to, ctx.currentTime + durSec)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.8)
    gain.gain.setValueAtTime(0.5, ctx.currentTime + Math.max(durSec - 0.4, 0.8))
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durSec)

    osc.connect(gain); gain.connect(this.toneGain)
    osc.start(); osc.stop(ctx.currentTime + durSec + 0.05)
  }

  // ── one-shot ui sfx (bypasses both channels) ────────────────────────────

  sfx(kind: SfxKind) {
    if (!this.ctx || this.masterMuted) return
    const ctx = this.ctx

    const tone = (freqFrom: number, freqTo: number, dur: number, vol: number, type: OscillatorType = "sine") => {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = type
      o.frequency.setValueAtTime(freqFrom, ctx.currentTime)
      if (freqTo !== freqFrom) o.frequency.linearRampToValueAtTime(freqTo, ctx.currentTime + dur * 0.6)
      g.gain.setValueAtTime(vol, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
      o.connect(g); g.connect(ctx.destination)
      o.start(); o.stop(ctx.currentTime + dur + 0.02)
    }

    const chord = (freqs: number[], stagger: number, vol: number, decay: number) => {
      freqs.forEach((f, i) => {
        const start = ctx.currentTime + i * stagger
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.type = "sine"; o.frequency.value = f
        g.gain.setValueAtTime(vol, start)
        g.gain.exponentialRampToValueAtTime(0.0001, start + decay)
        o.connect(g); g.connect(ctx.destination)
        o.start(start); o.stop(start + decay + 0.02)
      })
    }

    switch (kind) {
      case "tap": tone(600, 900, 0.15, 0.1); break
      case "select": tone(880, 880, 0.2, 0.09, "triangle"); break
      case "toggle": tone(440, 660, 0.12, 0.08); break
      case "tick": tone(1000, 1000, 0.06, 0.06); break
      case "chime": chord([523.25, 659.25, 783.99], 0.12, 0.1, 0.8); break
      case "complete": chord([523.25, 659.25, 783.99, 1046.5], 0.15, 0.12, 1.2); break
    }
  }

  // ── master ───────────────────────────────────────────────────────────────

  setMasterMuted(muted: boolean) {
    this.masterMuted = muted
    if (!this.ctx) return
    if (muted) {
      this.natureGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
      this.toneGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
    } else {
      if (this.natureOn) this.natureGain?.gain.setTargetAtTime(this.natureVol, this.ctx.currentTime, 0.1)
      if (this.toneOn) this.toneGain?.gain.setTargetAtTime(this.toneVol, this.ctx.currentTime, 0.1)
    }
  }

  isMasterMuted() {
    return this.masterMuted
  }

  destroy() {
    this.clearNatureTimers()
    this.stopNature()
    this.toneGain?.disconnect()
    this.toneGain = null
    try { this.ctx?.close() } catch { /* ignore */ }
    this.ctx = null
  }
}

export const sessionAudio = new SessionAudio()
