"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const SOUNDS = [
  { id: "rain",   icon: "🌧", label: "Gentle Rain",    desc: "Soft rainfall",       color: "#5a9ec8", type: "rain"   },
  { id: "forest", icon: "🌿", label: "Forest Birds",   desc: "Birds & trees",       color: "#5a9e6e", type: "forest" },
  { id: "ocean",  icon: "🌊", label: "Ocean Waves",    desc: "Slow waves",          color: "#3a8ec8", type: "ocean"  },
  { id: "fire",   icon: "🔥", label: "Fireplace",      desc: "Warm crackling",      color: "#c47a3a", type: "fire"   },
  { id: "wind",   icon: "🏔", label: "Mountain Wind",  desc: "Gentle breeze",       color: "#7a8eb8", type: "wind"   },
  { id: "night",  icon: "🌙", label: "Night Crickets", desc: "Peaceful night",      color: "#7a5ab8", type: "night"  },
] as const

type SoundId   = (typeof SOUNDS)[number]["id"]
type SoundType = (typeof SOUNDS)[number]["type"]

const WAVE_DELAYS = [0, 0.1, 0.2, 0.15, 0.05, 0.25, 0.1]

function pad(n: number) { return String(n).padStart(2, "0") }

function createBrownNoise(ctx: AudioContext) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    d[i] = (last + 0.02 * w) / 1.02
    last = d[i]
    d[i] *= 3.5
  }
  const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s
}

function createWhiteNoise(ctx: AudioContext) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s
}

export type { SoundId }

type Props = {
  defaultSound?: SoundId
  defaultTimer?: number
}

export function AmbientPlayer({ defaultSound, defaultTimer }: Props = {}) {
  const [activeId, setActiveId]     = useState<SoundId | null>(null)
  const [volume, setVolume]         = useState(60)
  const [elapsed, setElapsed]       = useState(0)
  const [timerGoal, setTimerGoal]   = useState<number | null>(defaultTimer ?? null)

  const ctxRef        = useRef<AudioContext | null>(null)
  const masterRef     = useRef<GainNode | null>(null)
  const nodesRef      = useRef<Array<AudioBufferSourceNode | OscillatorNode>>([])
  const clockRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef    = useRef(0)
  const activeIdRef   = useRef<SoundId | null>(null)

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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

  const stopClock = useCallback(() => {
    if (clockRef.current) { clearInterval(clockRef.current); clockRef.current = null }
  }, [])

  const handleStop = useCallback(() => {
    killNodes()
    stopClock()
    elapsedRef.current = 0
    setActiveId(null)
    setElapsed(0)
    setTimerGoal(null)
    activeIdRef.current = null
  }, [killNodes, stopClock])

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

  function handleSelect(sound: (typeof SOUNDS)[number]) {
    if (activeId === sound.id) { handleStop(); return }
    activeIdRef.current = sound.id
    playSound(sound.type, volume)
    setActiveId(sound.id)
    stopClock()
    elapsedRef.current = 0
    setElapsed(0)
    clockRef.current = setInterval(() => {
      elapsedRef.current += 1
      setElapsed(elapsedRef.current)
    }, 1000)
  }

  function handleVolume(v: number) {
    setVolume(v)
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(v / 100, ctxRef.current.currentTime, 0.1)
    }
  }

  // Auto-play defaultSound on mount (user interaction already happened via the Start button)
  const hasAutoPlayed = useRef(false)
  useEffect(() => {
    if (hasAutoPlayed.current || !defaultSound) return
    const sound = SOUNDS.find(s => s.id === defaultSound)
    if (!sound) return
    hasAutoPlayed.current = true
    const id = setTimeout(() => {
      activeIdRef.current = sound.id
      playSound(sound.type, 60)
      setActiveId(sound.id)
      stopClock()
      elapsedRef.current = 0
      setElapsed(0)
      clockRef.current = setInterval(() => {
        elapsedRef.current += 1
        setElapsed(elapsedRef.current)
      }, 1000)
    }, 400)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount-only — defaultSound is stable from parent

  // Auto-stop when timer goal reached
  useEffect(() => {
    if (timerGoal !== null && elapsed >= timerGoal * 60) handleStop()
  }, [elapsed, timerGoal, handleStop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopClock()
      killNodes()
      try { ctxRef.current?.close() } catch { /* ignore */ }
    }
  }, [killNodes, stopClock])

  const activeSound  = SOUNDS.find(s => s.id === activeId) ?? null
  const progressPct  = timerGoal ? Math.min((elapsed / (timerGoal * 60)) * 100, 100) : 0

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <style>{`
        @keyframes ambientWave {
          0%, 100% { height: 3px; }
          50%       { height: 16px; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Ambient Soundscapes
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {activeSound ? `Now playing: ${activeSound.label}` : "Choose a sound to accompany your session"}
        </p>
      </div>

      {/* Animated waveform */}
      {activeSound && (
        <div className="mb-3 flex items-center gap-[3px]" aria-hidden="true">
          {WAVE_DELAYS.map((delay, i) => (
            <span
              key={i}
              className="inline-block w-[3px] rounded-sm"
              style={{
                background: activeSound.color,
                animation: `ambientWave 0.5s ${delay}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Sound grid */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {SOUNDS.map(s => {
          const isActive = activeId === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s)}
              className="rounded-lg border bg-background p-3 text-center transition-all duration-200 hover:-translate-y-px active:scale-95"
              style={isActive ? { background: s.color + "22", borderColor: s.color + "88", borderWidth: "1.5px" } : {}}
            >
              <div className="mb-1 text-xl leading-none">{s.icon}</div>
              <div className="text-[11px] font-medium text-foreground">{s.label}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">{s.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Volume */}
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Volume</span>
          <span className="text-xs text-muted-foreground">{volume}%</span>
        </div>
        <input
          type="range" min="0" max="100" value={volume}
          onChange={e => handleVolume(parseInt(e.target.value))}
          className="w-full cursor-pointer accent-primary"
        />
      </div>

      {/* Timer + stop — only when a sound is active */}
      {activeSound && (
        <div className="border-t border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Session timer
            </span>
            <span className="font-mono text-lg font-medium tabular-nums text-foreground">
              {pad(Math.floor(elapsed / 60))}:{pad(elapsed % 60)}
            </span>
          </div>

          <div className="mb-3 flex gap-1.5">
            {[5, 10, 15, 20, 30].map(min => {
              const isSet = timerGoal === min
              return (
                <button
                  key={min}
                  type="button"
                  onClick={() => setTimerGoal(g => g === min ? null : min)}
                  className="flex-1 rounded-lg border border-border bg-muted py-1.5 text-[11px] font-medium text-foreground transition-colors"
                  style={isSet ? { background: "#5a9ec8", color: "white", borderColor: "#5a9ec8" } : {}}
                >
                  {min}m
                </button>
              )
            })}
          </div>

          {timerGoal && (
            <div className="mb-3 h-[3px] overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                style={{ width: `${progressPct}%`, background: "#5a9ec8" }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleStop}
            className="w-full rounded-lg border border-border py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            ■&nbsp;&nbsp;Stop sound
          </button>
        </div>
      )}
    </div>
  )
}
