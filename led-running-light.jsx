import { useState, useEffect, useRef } from "react";

const PATTERNS = {
  "Chase →": (step, n) => Array.from({ length: n }, (_, i) => i === step % n),
  "Chase ←": (step, n) => Array.from({ length: n }, (_, i) => i === (n - 1 - step % n)),
  "Bounce": (step, n) => {
    const pos = step % (2 * n - 2);
    const idx = pos < n ? pos : 2 * n - 2 - pos;
    return Array.from({ length: n }, (_, i) => i === idx);
  },
  "Wipe →": (step, n) => Array.from({ length: n }, (_, i) => i <= step % (n + 1) - 1),
  "Ping-Pong": (step, n) => {
    const half = n / 2;
    const pos = step % (half + 1);
    return Array.from({ length: n }, (_, i) =>
      i === pos || i === n - 1 - pos
    );
  },
  "Theater": (step, n) => Array.from({ length: n }, (_, i) => (i + step) % 3 === 0),
  "Alternate": (step, n) => Array.from({ length: n }, (_, i) => (i + step) % 2 === 0),
  "Flash All": (step, n) => Array.from({ length: n }, () => step % 2 === 0),
  "Random": (step, n) => {
    const rand = (Math.sin(step * 9301 + 49297) * 233280) | 0;
    return Array.from({ length: n }, (_, i) => !!(rand & (1 << i)));
  },
  "Dual Chase": (step, n) => {
    const a = step % n;
    const b = (step + Math.floor(n / 2)) % n;
    return Array.from({ length: n }, (_, i) => i === a || i === b);
  },
};

const LED_COLORS = [
  { name: "Red", on: "#ff2020", glow: "rgba(255,32,32,0.8)", off: "#3a0808" },
  { name: "Amber", on: "#ffaa00", glow: "rgba(255,170,0,0.8)", off: "#3a2800" },
  { name: "Green", on: "#00ff44", glow: "rgba(0,255,68,0.8)", off: "#003310" },
  { name: "Blue", on: "#00aaff", glow: "rgba(0,170,255,0.8)", off: "#001833" },
  { name: "Purple", on: "#cc44ff", glow: "rgba(204,68,255,0.8)", off: "#200033" },
  { name: "White", on: "#ffffff", glow: "rgba(255,255,255,0.8)", off: "#1a1a2e" },
  { name: "Cyan", on: "#00ffee", glow: "rgba(0,255,238,0.8)", off: "#003330" },
  { name: "Pink", on: "#ff44aa", glow: "rgba(255,68,170,0.8)", off: "#330018" },
];

const N = 8;

export default function LEDBoard() {
  const [running, setRunning] = useState(false);
  const [pattern, setPattern] = useState("Chase →");
  const [speed, setSpeed] = useState(150);
  const [colorIdx, setColorIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [manualOverride, setManualOverride] = useState(null); // array of bools
  const [brightness, setBrightness] = useState(100);
  const intervalRef = useRef(null);
  const stepRef = useRef(0);

  const color = LED_COLORS[colorIdx];
  const states = manualOverride ?? PATTERNS[pattern](step, N);

  useEffect(() => {
    if (running) {
      setManualOverride(null);
      intervalRef.current = setInterval(() => {
        stepRef.current += 1;
        setStep(stepRef.current);
      }, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, speed, pattern]);

  const toggleLED = (i) => {
    if (running) return;
    const base = manualOverride ?? PATTERNS[pattern](step, N);
    const next = [...base];
    next[i] = !next[i];
    setManualOverride(next);
  };

  const allOff = () => { setManualOverride(Array(N).fill(false)); setRunning(false); };
  const allOn = () => { setManualOverride(Array(N).fill(true)); setRunning(false); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      padding: "20px",
    }}>
      <div style={{
        background: "linear-gradient(145deg, #111118, #0d0d15)",
        border: "2px solid #2a2a3a",
        borderRadius: "16px",
        padding: "32px",
        width: "100%",
        maxWidth: "660px",
        boxShadow: "0 0 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "6px", color: "#555", textTransform: "uppercase", marginBottom: "4px" }}>
            MODEL LRB-8C
          </div>
          <div style={{ fontSize: "22px", letterSpacing: "3px", color: "#ccc", fontWeight: "bold" }}>
            8-CHANNEL LED CONTROLLER
          </div>
          <div style={{ width: "60px", height: "2px", background: color.on, margin: "10px auto 0", boxShadow: `0 0 8px ${color.glow}`, transition: "background 0.3s, box-shadow 0.3s" }} />
        </div>

        {/* LED Array */}
        <div style={{
          background: "#070710",
          border: "1px solid #1a1a2a",
          borderRadius: "12px",
          padding: "24px 20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          gap: "8px",
        }}>
          {states.map((on, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              {/* LED */}
              <div
                onClick={() => toggleLED(i)}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: on
                    ? `radial-gradient(circle at 35% 30%, #fff, ${color.on})`
                    : `radial-gradient(circle at 35% 30%, #2a2a35, ${color.off})`,
                  boxShadow: on
                    ? `0 0 ${12 * brightness / 100}px ${color.on}, 0 0 ${30 * brightness / 100}px ${color.glow}, 0 0 ${60 * brightness / 100}px ${color.glow}`
                    : "none",
                  cursor: running ? "default" : "pointer",
                  transition: "background 0.05s, box-shadow 0.05s",
                  border: on ? `1px solid ${color.on}` : "1px solid #2a2a35",
                  opacity: on ? brightness / 100 * 0.4 + 0.6 : 1,
                }}
              />
              {/* Channel label */}
              <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1px" }}>
                CH{i + 1}
              </div>
              {/* Status dot */}
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: on ? color.on : "#222",
                boxShadow: on ? `0 0 4px ${color.glow}` : "none",
                transition: "all 0.05s",
              }} />
            </div>
          ))}
        </div>

        {/* Controls Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          {/* Pattern */}
          <div>
            <label style={{ display: "block", fontSize: "10px", color: "#555", letterSpacing: "3px", marginBottom: "8px" }}>
              PATTERN
            </label>
            <select
              value={pattern}
              onChange={e => { setPattern(e.target.value); setManualOverride(null); stepRef.current = 0; setStep(0); }}
              style={{
                width: "100%", background: "#0d0d15", border: "1px solid #2a2a3a",
                color: "#aaa", padding: "8px 10px", borderRadius: "6px",
                fontSize: "12px", cursor: "pointer", appearance: "none",
              }}
            >
              {Object.keys(PATTERNS).map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* LED Color */}
          <div>
            <label style={{ display: "block", fontSize: "10px", color: "#555", letterSpacing: "3px", marginBottom: "8px" }}>
              LED COLOR
            </label>
            <select
              value={colorIdx}
              onChange={e => setColorIdx(Number(e.target.value))}
              style={{
                width: "100%", background: "#0d0d15", border: "1px solid #2a2a3a",
                color: "#aaa", padding: "8px 10px", borderRadius: "6px",
                fontSize: "12px", cursor: "pointer", appearance: "none",
              }}
            >
              {LED_COLORS.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Sliders */}
        <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { label: "SPEED", value: speed, min: 40, max: 1000, step: 10, unit: `${speed}ms`, onChange: v => setSpeed(v) },
            { label: "BRIGHTNESS", value: brightness, min: 20, max: 100, step: 5, unit: `${brightness}%`, onChange: v => setBrightness(v) },
          ].map(({ label, value, min, max, step: s, unit, onChange }) => (
            <div key={label}>
              <label style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#555", letterSpacing: "3px", marginBottom: "8px" }}>
                <span>{label}</span>
                <span style={{ color: color.on }}>{unit}</span>
              </label>
              <input
                type="range" min={min} max={max} step={s} value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: color.on, cursor: "pointer" }}
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {[
            {
              label: running ? "⏹ STOP" : "▶ RUN",
              onClick: () => setRunning(r => !r),
              accent: running ? "#ff3333" : color.on,
              glow: running ? "rgba(255,51,51,0.4)" : color.glow,
            },
            { label: "ALL ON", onClick: allOn, accent: "#ffcc00", glow: "rgba(255,204,0,0.3)" },
            { label: "ALL OFF", onClick: allOff, accent: "#444", glow: "none" },
          ].map(({ label, onClick, accent, glow }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                background: "transparent",
                border: `1px solid ${accent}`,
                color: accent,
                padding: "10px",
                borderRadius: "6px",
                fontSize: "11px",
                letterSpacing: "2px",
                cursor: "pointer",
                boxShadow: `0 0 10px ${glow}`,
                transition: "all 0.2s",
              }}
              onMouseOver={e => e.currentTarget.style.background = `${accent}22`}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px", color: "#333", letterSpacing: "2px" }}>
          {running ? `▶ RUNNING · ${pattern.toUpperCase()}` : "■ STOPPED · CLICK LEDS TO TOGGLE"}
        </div>
      </div>
    </div>
  );
}
