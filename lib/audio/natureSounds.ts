/**
 * Shared Web Audio nature-sound synthesis, extracted from the anxiety
 * program's session audio (lib/program/audio.ts) so Sleep Stories can reuse
 * the same generators instead of duplicating them. Behavior is unchanged
 * from the original inline implementation — only the sound-generation code
 * moved here; timer/node bookkeeping stays with the caller.
 */

export type NatureNode = AudioBufferSourceNode | OscillatorNode
export type NatureSoundId = "rain" | "ocean" | "forest" | "fire"

export function createBrownNoise(ctx: AudioContext): AudioBufferSourceNode {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    data[i] = (last + 0.02 * white) / 1.02
    last = data[i]
    data[i] *= 3.5
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}

/** Everything a generator needs from the caller: where to render into, how
 *  to register nodes/timers it creates (for later cleanup), and how to tell
 *  whether it's still the active sound (so in-flight timers can bail out
 *  after a switch/stop). */
export type NatureSoundContext = {
  ctx: AudioContext
  destination: GainNode
  pushNode: (n: NatureNode) => void
  pushTimer: (t: ReturnType<typeof setTimeout>) => void
  isStillActive: () => boolean
}

export function startNatureSound(id: NatureSoundId, sc: NatureSoundContext) {
  const { ctx, destination: gain, pushNode: push, pushTimer, isStillActive: stillActive } = sc

  if (id === "rain") {
    const source = createBrownNoise(ctx)
    const filter = ctx.createBiquadFilter()
    const level = ctx.createGain()
    filter.type = "highpass"
    filter.frequency.value = 400
    level.gain.value = 0.35
    source.connect(filter); filter.connect(level); level.connect(gain)
    source.start(); push(source)

    const drip = () => {
      if (!stillActive()) return
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.frequency.value = 1200 + Math.random() * 800
      g.gain.setValueAtTime(0.03, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      o.connect(g); g.connect(gain); o.start(); o.stop(ctx.currentTime + 0.3)
      pushTimer(setTimeout(drip, 400 + Math.random() * 2000))
    }
    pushTimer(setTimeout(drip, 500))
  } else if (id === "ocean") {
    for (let i = 0; i < 3; i++) {
      const source = createBrownNoise(ctx)
      const filter = ctx.createBiquadFilter()
      const level = ctx.createGain()
      filter.type = "bandpass"; filter.frequency.value = 100 + i * 80; filter.Q.value = 0.5
      level.gain.value = 0.12
      source.connect(filter); filter.connect(level); level.connect(gain)
      source.start(); push(source)

      const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.07 + i * 0.03; lfoGain.gain.value = 0.1
      lfo.connect(lfoGain); lfoGain.connect(level.gain); lfo.start(); push(lfo)
    }
  } else if (id === "forest") {
    const source = createBrownNoise(ctx)
    const filter = ctx.createBiquadFilter()
    const level = ctx.createGain()
    filter.type = "bandpass"; filter.frequency.value = 300; filter.Q.value = 1
    level.gain.value = 0.07
    source.connect(filter); filter.connect(level); level.connect(gain)
    source.start(); push(source)

    const chirp = () => {
      if (!stillActive()) return
      const o = ctx.createOscillator(); const g = ctx.createGain()
      const freq = 1800 + Math.random() * 1200
      o.type = "sine"
      o.frequency.setValueAtTime(freq, ctx.currentTime)
      o.frequency.linearRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.1)
      o.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.2)
      g.gain.setValueAtTime(0, ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.05)
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25)
      o.connect(g); g.connect(gain); o.start(); o.stop(ctx.currentTime + 0.3)
      pushTimer(setTimeout(chirp, 700 + Math.random() * 2500))
    }
    pushTimer(setTimeout(chirp, 400))
  } else if (id === "fire") {
    // Low rumble bed (the "base" of a fire) plus randomized crackle/pop
    // transients layered on top -- new generator, not present in the
    // anxiety program (which only ever offered rain/ocean/forest).
    const source = createBrownNoise(ctx)
    const filter = ctx.createBiquadFilter()
    const level = ctx.createGain()
    filter.type = "lowpass"; filter.frequency.value = 250; filter.Q.value = 0.7
    level.gain.value = 0.18
    source.connect(filter); filter.connect(level); level.connect(gain)
    source.start(); push(source)

    const crackle = () => {
      if (!stillActive()) return
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = "square"
      o.frequency.value = 90 + Math.random() * 200
      g.gain.setValueAtTime(0.06 + Math.random() * 0.05, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      o.connect(g); g.connect(gain); o.start(); o.stop(ctx.currentTime + 0.07)
      pushTimer(setTimeout(crackle, 150 + Math.random() * 500))
    }
    pushTimer(setTimeout(crackle, 300))
  }
}
