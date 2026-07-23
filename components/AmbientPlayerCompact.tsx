"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// ─── Sound definitions ────────────────────────────────────────────────────────

const SOUNDS = [
  { id: "rain",   icon: "🌧", label: "Gentle Rain",    color: "#5a9ec8", type: "rain"   },
  { id: "forest", icon: "🌿", label: "Forest Birds",   color: "#5a9e6e", type: "forest" },
  { id: "ocean",  icon: "🌊", label: "Ocean Waves",    color: "#3a8ec8", type: "ocean"  },
  { id: "fire",   icon: "🔥", label: "Fireplace",      color: "#c47a3a", type: "fire"   },
  { id: "wind",   icon: "🏔", label: "Mountain Wind",  color: "#7a8eb8", type: "wind"   },
  { id: "night",  icon: "🌙", label: "Night Crickets", color: "#7a5ab8", type: "night"  },
] as const

export type SoundId = (typeof SOUNDS)[number]["id"]
type SoundType     = (typeof SOUNDS)[number]["type"]

// ─── Audio engine ─────────────────────────────────────────────────────────────

function createBrownNoise(ctx: AudioContext) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    d[i] = (last + 0.02 * w) / 1.02
    last = d[i]; d[i] *= 3.5
  }
  const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s
}

function createWhiteNoise(ctx: AudioContext) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Phase = "inhale" | "hold" | "exhale"

type Props = {
  defaultSound?:   SoundId
  defaultTimer?:   number
  breathingPhase?: Phase
  activeSound?:    SoundId | null   // controlled from parent
  onSoundChange?:  (sound: SoundId | null) => void
  accentColor?:    string           // activeBg.core from session
  lang?:           string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AmbientPlayerCompact({
  defaultSound,
  defaultTimer: _defaultTimer,
  breathingPhase,
  activeSound,
  onSoundChange,
  accentColor,
}: Props = {}) {
  const [volume, setVolume]         = useState(60)
  const [muted, setMuted]           = useState(false)
  const [preMuteVol, setPreMuteVol] = useState(60)

  const ctxRef      = useRef<AudioContext | null>(null)
  const masterRef   = useRef<GainNode | null>(null)
  const nodesRef    = useRef<Array<AudioBufferSourceNode | OscillatorNode>>([])
  const activeIdRef = useRef<SoundId | null>(null)   // audio engine tracker

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume()
    return ctxRef.current
  }

  const killNodes = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop() } catch { /* already stopped */ } })
    nodesRef.current = []
    masterRef.current?.disconnect()
    masterRef.current = null
  }, [])

  const stopAll = useCallback(() => {
    killNodes()
    activeIdRef.current = null
    onSoundChange?.(null)
  }, [killNodes, onSoundChange])

  function applyGain(v: number) {
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(v / 100, ctxRef.current.currentTime, 0.1)
    }
  }

  function playSound(type: SoundType, vol: number) {
    const ctx = getCtx()
    killNodes()

    const M = ctx.createGain()
    M.gain.value = vol / 100
    M.connect(ctx.destination)
    masterRef.current = M

    const push = (n: AudioBufferSourceNode | OscillatorNode) => nodesRef.current.push(n)

    if (type === "rain") {
      const s = createBrownNoise(ctx), f = ctx.createBiquadFilter(), g = ctx.createGain()
      f.type = "highpass"; f.frequency.value = 400; g.gain.value = 0.4
      s.connect(f); f.connect(g); g.connect(M); s.start(); push(s)
      const drip = () => {
        if (!nodesRef.current.length || activeIdRef.current !== "rain") return
        const o = ctx.createOscillator(), dg = ctx.createGain()
        o.frequency.value = 1200 + Math.random() * 800
        dg.gain.setValueAtTime(0.04, ctx.currentTime)
        dg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        o.connect(dg); dg.connect(M); o.start(); o.stop(ctx.currentTime + 0.3)
        setTimeout(drip, 400 + Math.random() * 2000)
      }
      setTimeout(drip, 500)

    } else if (type === "ocean") {
      for (let i = 0; i < 3; i++) {
        const s = createBrownNoise(ctx), f = ctx.createBiquadFilter(), g = ctx.createGain()
        f.type = "bandpass"; f.frequency.value = 100 + i * 80; f.Q.value = 0.5; g.gain.value = 0.12
        s.connect(f); f.connect(g); g.connect(M); s.start(); push(s)
        const lfo = ctx.createOscillator(), lg = ctx.createGain()
        lfo.frequency.value = 0.07 + i * 0.03; lg.gain.value = 0.1
        lfo.connect(lg); lg.connect(g.gain); lfo.start(); push(lfo)
      }

    } else if (type === "forest") {
      const s = createBrownNoise(ctx), f = ctx.createBiquadFilter(), g = ctx.createGain()
      f.type = "bandpass"; f.frequency.value = 300; f.Q.value = 1; g.gain.value = 0.07
      s.connect(f); f.connect(g); g.connect(M); s.start(); push(s)
      const chirp = () => {
        if (!nodesRef.current.length || activeIdRef.current !== "forest") return
        const o = ctx.createOscillator(), bg = ctx.createGain()
        const fr = 1800 + Math.random() * 1200
        o.type = "sine"; o.frequency.setValueAtTime(fr, ctx.currentTime)
        o.frequency.linearRampToValueAtTime(fr * 1.3, ctx.currentTime + 0.1)
        o.frequency.linearRampToValueAtTime(fr, ctx.currentTime + 0.2)
        bg.gain.setValueAtTime(0, ctx.currentTime)
        bg.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05)
        bg.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25)
        o.connect(bg); bg.connect(M); o.start(); o.stop(ctx.currentTime + 0.3)
        setTimeout(chirp, 700 + Math.random() * 3000)
      }
      setTimeout(chirp, 400)

    } else if (type === "fire") {
      const s = createBrownNoise(ctx), f = ctx.createBiquadFilter(), g = ctx.createGain()
      f.type = "lowpass"; f.frequency.value = 500; g.gain.value = 0.3
      s.connect(f); f.connect(g); g.connect(M); s.start(); push(s)
      const crackle = () => {
        if (!nodesRef.current.length || activeIdRef.current !== "fire") return
        const w = createWhiteNoise(ctx), cg = ctx.createGain()
        cg.gain.setValueAtTime(0.07, ctx.currentTime)
        cg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05 + Math.random() * 0.1)
        w.connect(cg); cg.connect(M); w.start(); w.stop(ctx.currentTime + 0.15); push(w)
        setTimeout(crackle, 100 + Math.random() * 500)
      }
      setTimeout(crackle, 200)

    } else if (type === "wind") {
      const s = createBrownNoise(ctx), f = ctx.createBiquadFilter(), g = ctx.createGain()
      f.type = "bandpass"; f.frequency.value = 200; f.Q.value = 0.8; g.gain.value = 0.18
      s.connect(f); f.connect(g); g.connect(M); s.start(); push(s)
      const lfo = ctx.createOscillator(), lg = ctx.createGain()
      lfo.frequency.value = 0.05; lg.gain.value = 0.13
      lfo.connect(lg); lg.connect(g.gain); lfo.start(); push(lfo)

    } else if (type === "night") {
      const chirp = () => {
        if (!nodesRef.current.length || activeIdRef.current !== "night") return
        for (let i = 0; i < 3; i++) {
          const o = ctx.createOscillator(), g = ctx.createGain()
          o.type = "sine"; o.frequency.value = 3800 + i * 200 + Math.random() * 100
          g.gain.setValueAtTime(0.012, ctx.currentTime + i * 0.02)
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08 + i * 0.02)
          o.connect(g); g.connect(M)
          o.start(ctx.currentTime + i * 0.02); o.stop(ctx.currentTime + 0.12 + i * 0.02); push(o)
        }
        setTimeout(chirp, 150 + Math.random() * 180)
      }
      chirp()
      const frog = () => {
        if (!nodesRef.current.length || activeIdRef.current !== "night") return
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.frequency.value = 180 + Math.random() * 60; o.type = "triangle"
        g.gain.setValueAtTime(0.03, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
        o.connect(g); g.connect(M); o.start(); o.stop(ctx.currentTime + 0.4)
        setTimeout(frog, 2000 + Math.random() * 4000)
      }
      setTimeout(frog, 1200)
    }
  }

  // Deselect on second click (toggle)
  function handleSelect(sound: (typeof SOUNDS)[number]) {
    if (activeSound === sound.id) {
      stopAll()
      return
    }
    activeIdRef.current = sound.id
    playSound(sound.type, muted ? 0 : volume)
    onSoundChange?.(sound.id)
  }

  // Mute toggle
  function handleMute() {
    if (muted) {
      setMuted(false)
      applyGain(preMuteVol)
    } else {
      setPreMuteVol(volume)
      setMuted(true)
      applyGain(0)
    }
  }

  function handleVolume(v: number) {
    setVolume(v)
    if (!muted) applyGain(v)
  }

  // Auto-play defaultSound on mount
  const hasAutoPlayed = useRef(false)
  useEffect(() => {
    if (hasAutoPlayed.current || !defaultSound) return
    const sound = SOUNDS.find(s => s.id === defaultSound)
    if (!sound) return
    hasAutoPlayed.current = true
    const id = setTimeout(() => {
      activeIdRef.current = sound.id
      playSound(sound.type, 60)
      onSoundChange?.(sound.id)
    }, 400)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stop all audio on unmount
  useEffect(() => {
    return () => {
      killNodes()
      try { ctxRef.current?.close() } catch { /* ignore */ }
    }
  }, [killNodes])

  // Compute button box-shadow: active ring + breathing phase pulse
  function getButtonShadow(isActive: boolean, soundColor: string): string {
    if (!isActive) return "none"
    const ringCol = accentColor ?? soundColor
    const ring = `0 0 0 2px ${ringCol}`
    if (breathingPhase === "inhale") return `${ring}, 0 0 0 6px ${soundColor}40`
    if (breathingPhase === "exhale") return `${ring}, 0 0 0 3px ${soundColor}28`
    return ring
  }

  function getPhaseClass(isActive: boolean): string {
    if (!isActive || !breathingPhase) return ""
    if (breathingPhase === "inhale") return "apc-phase-inhale"
    if (breathingPhase === "exhale") return "apc-phase-exhale"
    return ""
  }

  // ─── Compact UI ──────────────────────────────────────────────────────────────

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-2">
      <style>{`
        .apc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          margin-top: -3.5px;
        }
        .apc-slider::-moz-range-thumb {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: none;
        }
        .apc-slider::-webkit-slider-runnable-track {
          height: 3px;
          background: hsl(var(--border));
          border-radius: 2px;
        }
        .apc-slider::-moz-range-track {
          height: 3px;
          background: hsl(var(--border));
          border-radius: 2px;
        }
        .apc-phase-inhale { transition: box-shadow 1.5s ease; }
        .apc-phase-exhale { transition: box-shadow 1.5s ease; }
      `}</style>

      {activeSound === null && (
        <p className="text-center text-[11px] text-muted-foreground">
          Tap a sound to play
        </p>
      )}

      <div className="flex items-center gap-1.5" role="group" aria-label="Ambient sound">
        {SOUNDS.map(s => {
          const isActive = activeSound === s.id
          return (
            <button
              key={s.id}
              type="button"
              title={s.label}
              aria-label={s.label}
              aria-pressed={isActive}
              onClick={() => handleSelect(s)}
              className={[
                "flex items-center justify-center rounded-full text-lg",
                "transition-[transform] duration-150 hover:scale-110 active:scale-95",
                getPhaseClass(isActive),
              ].join(" ")}
              style={{
                width: 40,
                height: 40,
                background: isActive
                  ? (accentColor ?? `color-mix(in srgb, ${s.color} 20%, transparent)`)
                  : "transparent",
                boxShadow: getButtonShadow(isActive, s.color),
                transition: "box-shadow 1.5s ease, transform 150ms, background 1.5s ease",
              }}
            >
              {s.icon}
            </button>
          )
        })}
      </div>

      <div className="flex w-full items-center gap-2 px-1">
        <button
          type="button"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={handleMute}
          className="shrink-0 text-sm text-muted-foreground transition-opacity hover:opacity-70"
        >
          {muted ? "🔇" : "🔈"}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={muted ? 0 : volume}
          onChange={e => handleVolume(parseInt(e.target.value))}
          aria-label="Volume"
          className="apc-slider flex-1 cursor-pointer"
          style={{
            height: 3,
            WebkitAppearance: "none",
            appearance: "none",
            opacity: muted ? 0.4 : 1,
            transition: "opacity 150ms",
          }}
        />

        <span className="w-8 shrink-0 text-right text-[11px] text-muted-foreground">
          {muted ? "0%" : activeSound ? `${volume}%` : "–"}
        </span>
      </div>
    </div>
  )
}
