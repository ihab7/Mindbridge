export type SoundTheme = {
  inhale: string
  exhale: string
  text:   string
  sub:    string
  ring:   string
  mid:    string
  core:   string
  glow:   string
}

export const SOUND_GRADIENTS: Record<string, SoundTheme> = {
  rain: {
    inhale: "radial-gradient(ellipse at 30% 0%, #d4eaf7 0%, #7fb3d3 45%, #4a8ab5 100%)",
    exhale: "radial-gradient(ellipse at 30% 0%, #a0c0d8 0%, #4a80a8 45%, #1a5080 100%)",
    text: "#0a2038", sub: "#1a3a58",
    ring: "rgba(10,50,90,0.38)",   mid: "rgba(10,50,90,0.52)",
    core: "rgba(10,50,90,0.68)",   glow: "rgba(74,138,181,0.30)",
  },
  forest: {
    inhale: "radial-gradient(ellipse at 20% 10%, #d4edda 0%, #85c98a 45%, #4a9e55 100%)",
    exhale: "radial-gradient(ellipse at 20% 10%, #a0c8a8 0%, #509860 45%, #206830 100%)",
    text: "#082818", sub: "#104020",
    ring: "rgba(8,50,20,0.38)",    mid: "rgba(8,50,20,0.52)",
    core: "rgba(8,50,20,0.68)",    glow: "rgba(74,158,85,0.30)",
  },
  ocean: {
    inhale: "radial-gradient(ellipse at 70% 0%, #cce8f4 0%, #60b8e0 45%, #2a8ab8 100%)",
    exhale: "radial-gradient(ellipse at 70% 0%, #90c0d8 0%, #3088b0 45%, #085888 100%)",
    text: "#061828", sub: "#0e3048",
    ring: "rgba(6,40,70,0.38)",    mid: "rgba(6,40,70,0.52)",
    core: "rgba(6,40,70,0.70)",    glow: "rgba(42,138,184,0.30)",
  },
  fire: {
    inhale: "radial-gradient(ellipse at 30% 0%, #ffe5b0 0%, #ffb347 45%, #ff7b2e 100%)",
    exhale: "radial-gradient(ellipse at 30% 0%, #e0c060 0%, #d88020 45%, #b04800 100%)",
    text: "#5a2000", sub: "#783010",
    ring: "rgba(100,38,0,0.38)",   mid: "rgba(100,38,0,0.52)",
    core: "rgba(100,38,0,0.68)",   glow: "rgba(255,123,46,0.30)",
  },
  wind: {
    inhale: "radial-gradient(ellipse at 60% 0%, #eaf0f8 0%, #b0c8e8 45%, #7a9ec8 100%)",
    exhale: "radial-gradient(ellipse at 60% 0%, #b8c8e0 0%, #7090b8 45%, #405888 100%)",
    text: "#182030", sub: "#283848",
    ring: "rgba(28,42,68,0.36)",   mid: "rgba(28,42,68,0.50)",
    core: "rgba(28,42,68,0.66)",   glow: "rgba(122,158,200,0.30)",
  },
  night: {
    inhale: "radial-gradient(ellipse at 80% 10%, #e0d8f8 0%, #9080d0 45%, #5040a0 100%)",
    exhale: "radial-gradient(ellipse at 80% 10%, #b0a0e0 0%, #6050a8 45%, #281860 100%)",
    text: "#180e38", sub: "#281e50",
    ring: "rgba(30,18,70,0.40)",   mid: "rgba(30,18,70,0.54)",
    core: "rgba(30,18,70,0.72)",   glow: "rgba(80,64,160,0.34)",
  },
}

export const BREATHING_THEMES: Record<string, SoundTheme> = {
  one_minute: {
    inhale: "radial-gradient(ellipse at 30% 0%, #ffe0a0 0%, #ffb347 45%, #ff8c42 100%)",
    exhale: "radial-gradient(ellipse at 30% 0%, #e8c070 0%, #e89030 45%, #d06020 100%)",
    text: "#2a0800", sub: "#5a2800",
    ring: "rgba(90,40,0,0.38)",    mid: "rgba(90,40,0,0.52)",
    core: "rgba(90,40,0,0.68)",    glow: "rgba(255,140,66,0.30)",
  },
  three_minute: {
    inhale: "radial-gradient(ellipse at 30% 0%, #e0c8ff 0%, #b084f8 45%, #8b5cf6 100%)",
    exhale: "radial-gradient(ellipse at 30% 0%, #c0a0f0 0%, #8060d8 45%, #6040b8 100%)",
    text: "#200a40", sub: "#401860",
    ring: "rgba(60,20,120,0.38)",  mid: "rgba(60,20,120,0.52)",
    core: "rgba(60,20,120,0.68)",  glow: "rgba(139,92,246,0.30)",
  },
  calm_down: {
    inhale: "radial-gradient(ellipse at 30% 0%, #ffd0dc 0%, #ff8fab 45%, #ff6b9d 100%)",
    exhale: "radial-gradient(ellipse at 30% 0%, #e8a0b8 0%, #e06080 45%, #c04070 100%)",
    text: "#3a0020", sub: "#600030",
    ring: "rgba(100,0,50,0.38)",   mid: "rgba(100,0,50,0.52)",
    core: "rgba(100,0,50,0.68)",   glow: "rgba(255,107,157,0.30)",
  },
  sleep: {
    inhale: "radial-gradient(ellipse at 30% 0%, #c0e8f8 0%, #80c8e8 45%, #5ba4cf 100%)",
    exhale: "radial-gradient(ellipse at 30% 0%, #90c0e0 0%, #5090b8 45%, #3070a0 100%)",
    text: "#0a1828", sub: "#182840",
    ring: "rgba(10,30,70,0.38)",   mid: "rgba(10,30,70,0.52)",
    core: "rgba(10,30,70,0.68)",   glow: "rgba(91,164,207,0.30)",
  },
}

export const DEFAULT_THEME: SoundTheme = {
  inhale: "radial-gradient(ellipse at 30% 0%, #e0e8f8 0%, #b0c8e8 45%, #80a8d0 100%)",
  exhale: "radial-gradient(ellipse at 30% 0%, #c0c8e0 0%, #8098b8 45%, #5070a0 100%)",
  text: "#1a2840", sub: "#2a3850",
  ring: "rgba(20,40,80,0.38)",   mid: "rgba(20,40,80,0.52)",
  core: "rgba(20,40,80,0.68)",   glow: "rgba(128,168,208,0.30)",
}
