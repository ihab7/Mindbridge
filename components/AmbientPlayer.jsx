import { useState, useRef, useEffect, useCallback } from "react";

// ─── Soundscape data (using free Web Audio API synthesis — no external files needed) ───
const SOUNDSCAPES = [
  {
    id: "rain",
    label: { en: "Gentle Rain", fr: "Pluie Douce", ar: "مطر ناعم" },
    icon: "🌧️",
    color: "#4a90b8",
    gradient: "linear-gradient(135deg, #1a3a4a 0%, #2d6a8a 50%, #1a3a4a 100%)",
    description: { en: "Soft rainfall on leaves", fr: "Pluie douce sur les feuilles", ar: "مطر ناعم على الأوراق" },
    type: "rain",
  },
  {
    id: "forest",
    label: { en: "Forest Birds", fr: "Forêt", ar: "طيور الغابة" },
    icon: "🌿",
    color: "#4a8a5a",
    gradient: "linear-gradient(135deg, #1a3a20 0%, #2d6a3a 50%, #1a3a20 100%)",
    description: { en: "Birds & rustling trees", fr: "Oiseaux et arbres", ar: "طيور وأشجار" },
    type: "forest",
  },
  {
    id: "ocean",
    label: { en: "Ocean Waves", fr: "Vagues", ar: "أمواج البحر" },
    icon: "🌊",
    color: "#3a7ab8",
    gradient: "linear-gradient(135deg, #0d2a3a 0%, #1a5a8a 50%, #0d2a3a 100%)",
    description: { en: "Slow rolling waves", fr: "Vagues lentes", ar: "أمواج هادئة" },
    type: "ocean",
  },
  {
    id: "fireplace",
    label: { en: "Fireplace", fr: "Cheminée", ar: "موقد النار" },
    icon: "🔥",
    color: "#c47a3a",
    gradient: "linear-gradient(135deg, #3a1a0a 0%, #8a3a10 50%, #3a1a0a 100%)",
    description: { en: "Warm crackling fire", fr: "Feu crépitant", ar: "نار دافئة" },
    type: "fire",
  },
  {
    id: "wind",
    label: { en: "Mountain Wind", fr: "Vent de Montagne", ar: "ريح الجبل" },
    icon: "🏔️",
    color: "#8a9ab8",
    gradient: "linear-gradient(135deg, #1a2a3a 0%, #3a5a7a 50%, #1a2a3a 100%)",
    description: { en: "Gentle mountain breeze", fr: "Brise de montagne", ar: "نسيم جبلي" },
    type: "wind",
  },
  {
    id: "night",
    label: { en: "Night Crickets", fr: "Grillons Nocturnes", ar: "صراصير الليل" },
    icon: "🌙",
    color: "#5a4a8a",
    gradient: "linear-gradient(135deg, #0d0d2a 0%, #2a1a5a 50%, #0d0d2a 100%)",
    description: { en: "Peaceful night sounds", fr: "Sons nocturnes apaisants", ar: "أصوات الليل الهادئة" },
    type: "night",
  },
];

// ─── Web Audio Engine ───
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.nodes = [];
    this.gainNode = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  stop() {
    this.nodes.forEach((n) => {
      try { n.stop(); } catch (_) {}
    });
    this.nodes = [];
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  setVolume(vol) {
    if (this.gainNode) this.gainNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
  }

  createMasterGain(vol) {
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = vol;
    this.gainNode.connect(this.ctx.destination);
    return this.gainNode;
  }

  noise(type = "brown") {
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "brown") {
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else {
        data[i] = white;
      }
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  playRain(master) {
    const src = this.noise("brown");
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 400;
    const g = this.ctx.createGain();
    g.gain.value = 0.4;
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
    this.nodes.push(src);

    // add occasional drips
    const drip = () => {
      if (this.nodes.length === 0) return;
      const osc = this.ctx.createOscillator();
      const dg = this.ctx.createGain();
      osc.frequency.value = 1200 + Math.random() * 800;
      dg.gain.setValueAtTime(0.05, this.ctx.currentTime);
      dg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(dg);
      dg.connect(master);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
      setTimeout(drip, 300 + Math.random() * 2000);
    };
    setTimeout(drip, 500);
  }

  playOcean(master) {
    for (let i = 0; i < 3; i++) {
      const src = this.noise("brown");
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 100 + i * 80;
      filter.Q.value = 0.5;
      const g = this.ctx.createGain();
      g.gain.value = 0;
      src.connect(filter);
      filter.connect(g);
      g.connect(master);
      src.start();
      this.nodes.push(src);

      // wave LFO
      const lfoRate = 0.08 + i * 0.03;
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = lfoRate;
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      g.gain.value = 0.15;
      lfo.start();
      this.nodes.push(lfo);
    }
  }

  playForest(master) {
    // base wind
    const src = this.noise("brown");
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 300;
    filter.Q.value = 1;
    const g = this.ctx.createGain();
    g.gain.value = 0.08;
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
    this.nodes.push(src);

    // birds
    const chirp = () => {
      if (this.nodes.length === 0) return;
      const osc = this.ctx.createOscillator();
      const bg = this.ctx.createGain();
      const freq = 1800 + Math.random() * 1200;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq * 1.3, this.ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + 0.2);
      bg.gain.setValueAtTime(0, this.ctx.currentTime);
      bg.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.05);
      bg.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.25);
      osc.connect(bg);
      bg.connect(master);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
      setTimeout(chirp, 800 + Math.random() * 3000);
    };
    setTimeout(chirp, 600);
  }

  playFire(master) {
    const src = this.noise("brown");
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    const g = this.ctx.createGain();
    g.gain.value = 0.3;
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
    this.nodes.push(src);

    // crackles
    const crackle = () => {
      if (this.nodes.length === 0) return;
      const wn = this.noise("white");
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(0.08, this.ctx.currentTime);
      cg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05 + Math.random() * 0.1);
      wn.connect(cg);
      cg.connect(master);
      wn.start();
      wn.stop(this.ctx.currentTime + 0.15);
      this.nodes.push(wn);
      setTimeout(crackle, 100 + Math.random() * 600);
    };
    setTimeout(crackle, 300);
  }

  playWind(master) {
    const src = this.noise("brown");
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 200;
    filter.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.value = 0.2;
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
    this.nodes.push(src);

    // wind sweep LFO
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoG.gain.value = 0.15;
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    lfo.start();
    this.nodes.push(lfo);
  }

  playNight(master) {
    // cricket base
    const chirp = () => {
      if (this.nodes.length === 0) return;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 3800 + i * 200 + Math.random() * 100;
        g.gain.setValueAtTime(0.015, this.ctx.currentTime + i * 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08 + i * 0.02);
        osc.connect(g);
        g.connect(master);
        osc.start(this.ctx.currentTime + i * 0.02);
        osc.stop(this.ctx.currentTime + 0.1 + i * 0.02);
        this.nodes.push(osc);
      }
      setTimeout(chirp, 150 + Math.random() * 200);
    };
    chirp();

    // distant frogs
    const frog = () => {
      if (this.nodes.length === 0) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.value = 180 + Math.random() * 60;
      osc.type = "triangle";
      g.gain.setValueAtTime(0.04, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
      setTimeout(frog, 1500 + Math.random() * 4000);
    };
    setTimeout(frog, 1000);
  }

  play(type, volume) {
    this.init();
    this.stop();
    const master = this.createMasterGain(volume);
    switch (type) {
      case "rain": this.playRain(master); break;
      case "ocean": this.playOcean(master); break;
      case "forest": this.playForest(master); break;
      case "fire": this.playFire(master); break;
      case "wind": this.playWind(master); break;
      case "night": this.playNight(master); break;
    }
  }
}

const engine = new SoundEngine();

// ─── Translations ───
const t = {
  en: {
    title: "Ambient Soundscapes",
    subtitle: "Choose a sound to accompany your session",
    volume: "Volume",
    playing: "Now Playing",
    tap: "Tap to play",
    timer: "Session Timer",
    min: "min",
    stop: "Stop",
  },
  fr: {
    title: "Ambiances Sonores",
    subtitle: "Choisissez un son pour accompagner votre séance",
    volume: "Volume",
    playing: "En cours",
    tap: "Appuyez pour jouer",
    timer: "Minuterie",
    min: "min",
    stop: "Arrêter",
  },
  ar: {
    title: "الأجواء الصوتية",
    subtitle: "اختر صوتاً لمرافقة جلستك",
    volume: "الصوت",
    playing: "يُشغَّل الآن",
    tap: "اضغط للتشغيل",
    timer: "مؤقت الجلسة",
    min: "د",
    stop: "إيقاف",
  },
};

// ─── Main Component ───
export default function AmbientPlayer({ lang = "en", context = "standalone" }) {
  const [active, setActive] = useState(null);
  const [volume, setVolume] = useState(0.6);
  const [timer, setTimer] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [particles, setParticles] = useState([]);
  const intervalRef = useRef(null);
  const tx = t[lang] || t.en;
  const isRTL = lang === "ar";

  const TIMER_OPTIONS = [5, 10, 15, 20, 30];

  // generate floating particles for ambience
  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        dur: 6 + Math.random() * 10,
        delay: Math.random() * 8,
      }))
    );
  }, []);

  const handleSelect = useCallback(
    (s) => {
      if (active?.id === s.id) {
        engine.stop();
        setActive(null);
        clearInterval(intervalRef.current);
        setElapsed(0);
      } else {
        engine.play(s.type, volume);
        setActive(s);
        clearInterval(intervalRef.current);
        setElapsed(0);
        intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      }
    },
    [active, volume]
  );

  const handleVolume = (v) => {
    setVolume(v);
    engine.setVolume(v);
  };

  const handleStop = () => {
    engine.stop();
    setActive(null);
    clearInterval(intervalRef.current);
    setElapsed(0);
    setTimer(null);
  };

  useEffect(() => {
    if (timer && elapsed >= timer * 60) handleStop();
  }, [elapsed, timer]);

  useEffect(() => () => { engine.stop(); clearInterval(intervalRef.current); }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const progress = timer ? Math.min((elapsed / (timer * 60)) * 100, 100) : 0;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        fontFamily: "'Crimson Pro', 'Playfair Display', Georgia, serif",
        background: active
          ? active.gradient
          : "linear-gradient(135deg, #0d1520 0%, #1a2535 50%, #0d1520 100%)",
        borderRadius: "24px",
        padding: "32px",
        minWidth: "340px",
        maxWidth: "520px",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        transition: "background 1.2s ease",
        boxShadow: active
          ? `0 0 60px ${active.color}40, 0 20px 60px rgba(0,0,0,0.5)`
          : "0 20px 60px rgba(0,0,0,0.4)",
      }}
    >
      {/* Floating particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: active ? `${active.color}60` : "rgba(255,255,255,0.08)",
              animation: `float ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
              transition: "background 1.2s ease",
            }}
          />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');
        @keyframes float {
          from { transform: translateY(0px) scale(1); opacity: 0.3; }
          to { transform: translateY(-20px) scale(1.3); opacity: 0.8; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes wave-bar {
          0%, 100% { height: 6px; }
          50% { height: 22px; }
        }
        .sound-card:hover { transform: translateY(-3px) scale(1.03); }
        .sound-card { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
        .vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .vol-slider::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.2);
        }
        .vol-slider { -webkit-appearance: none; appearance: none; background: transparent; width: 100%; }
        .timer-btn:hover { background: rgba(255,255,255,0.15) !important; }
      `}</style>

      {/* Header */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          {active && (
            <div style={{ position: "relative", width: 10, height: 10 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: active.color, animation: "pulse-ring 1.5s ease-out infinite",
              }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: active.color }} />
            </div>
          )}
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 600, color: "white", letterSpacing: "-0.3px" }}>
            {tx.title}
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.5)", fontStyle: "italic", fontWeight: 300 }}>
          {active ? `${tx.playing}: ${active.label[lang] || active.label.en}` : tx.subtitle}
        </p>
      </div>

      {/* Waveform animation when playing */}
      {active && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginBottom: "20px", height: "28px" }}>
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                height: "6px",
                borderRadius: "2px",
                background: active.color,
                animation: `wave-bar ${0.6 + i * 0.1}s ${i * 0.07}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Sound Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px", position: "relative", zIndex: 1 }}>
        {SOUNDSCAPES.map((s) => {
          const isActive = active?.id === s.id;
          return (
            <div
              key={s.id}
              className="sound-card"
              onClick={() => handleSelect(s)}
              style={{
                background: isActive ? `${s.color}30` : "rgba(255,255,255,0.05)",
                border: isActive ? `1.5px solid ${s.color}80` : "1.5px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "14px 10px",
                textAlign: "center",
                boxShadow: isActive ? `0 0 20px ${s.color}30` : "none",
              }}
            >
              <div style={{ fontSize: "26px", marginBottom: "6px", lineHeight: 1 }}>{s.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: isActive ? "white" : "rgba(255,255,255,0.7)", letterSpacing: "0.3px" }}>
                {s.label[lang] || s.label.en}
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "3px", fontStyle: "italic" }}>
                {s.description[lang] || s.description.en}
              </div>
            </div>
          );
        })}
      </div>

      {/* Volume Control */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>
            {tx.volume}
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px" }}>🔈</span>
          <input
            type="range" min="0" max="1" step="0.01"
            value={volume}
            onChange={(e) => handleVolume(parseFloat(e.target.value))}
            className="vol-slider"
            style={{ flex: 1, accentColor: active?.color || "#7ab8d8" }}
          />
          <span style={{ fontSize: "14px" }}>🔊</span>
        </div>
      </div>

      {/* Session Timer */}
      {active && (
        <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>
              {tx.timer}
            </span>
            <span style={{ fontSize: "18px", fontWeight: 300, color: "white", fontFamily: "monospace", letterSpacing: "1px" }}>
              {fmt(elapsed)}
            </span>
          </div>

          {/* Timer options */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {TIMER_OPTIONS.map((m) => (
              <button
                key={m}
                className="timer-btn"
                onClick={() => setTimer(timer === m ? null : m)}
                style={{
                  flex: 1, padding: "6px 0", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: timer === m ? (active?.color || "rgba(255,255,255,0.2)") : "rgba(255,255,255,0.07)",
                  color: "white", fontSize: "11px", fontWeight: 600, transition: "background 0.2s",
                }}
              >
                {m}{tx.min}
              </button>
            ))}
          </div>

          {/* Progress bar */}
          {timer && (
            <div style={{ height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden", marginBottom: "14px" }}>
              <div style={{
                height: "100%", borderRadius: "2px",
                background: active?.color || "white",
                width: `${progress}%`,
                transition: "width 1s linear",
              }} />
            </div>
          )}

          {/* Stop button */}
          <button
            onClick={handleStop}
            style={{
              width: "100%", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)",
              fontSize: "13px", cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            ■ {tx.stop}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Usage examples ───
// Standalone:         <AmbientPlayer lang="en" context="standalone" />
// In Breathing page:  <AmbientPlayer lang="fr" context="breathing" />
// In Journal page:    <AmbientPlayer lang="ar" context="journal" />
