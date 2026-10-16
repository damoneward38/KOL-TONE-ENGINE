"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Atom, 
  Sparkles, 
  Sliders, 
  Activity, 
  Zap, 
  Maximize2, 
  RefreshCw, 
  Radio, 
  Layers,
  Volume2
} from "lucide-react";
import { playTone } from "@/src/lib/sound-synth";

export default function OrEinSofZpe() {
  const [gapNm, setGapNm] = useState<number>(50);
  const [areaCm2, setAreaCm2] = useState<number>(1.0);
  const [casimirPressurePa, setCasimirPressurePa] = useState<number>(0);
  const [casimirAtm, setCasimirAtm] = useState<number>(0);
  const [attractiveForceMicroN, setAttractiveForceMicroN] = useState<number>(0);

  // Frequency-to-ZPE State
  const [inputHz, setInputHz] = useState<number>(432);
  const [zpeJoules, setZpeJoules] = useState<number>(0);
  const [zpeEv, setZpeEv] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Compute Casimir force
  const computeCasimir = (nm: number, area: number) => {
    const HBAR = 1.054571817e-34;
    const C = 299792458;
    const PI = Math.PI;

    const d = nm * 1e-9;
    const num = Math.pow(PI, 2) * HBAR * C;
    const den = 240 * Math.pow(d, 4);
    const pressurePa = num / den;
    const atm = pressurePa / 101325;
    const areaM2 = area * 1e-4;
    const forceN = pressurePa * areaM2;
    const forceMicroN = forceN * 1e6;

    setCasimirPressurePa(pressurePa);
    setCasimirAtm(atm);
    setAttractiveForceMicroN(forceMicroN);
  };

  // Compute frequency ground state energy: E0 = 1/2 * hbar * omega = 1/2 * h * f
  const computeZpe = (hz: number) => {
    const HBAR = 1.054571817e-34;
    const omega = 2 * Math.PI * hz;
    const joules = 0.5 * HBAR * omega;
    const ev = joules / 1.602176634e-19;
    setZpeJoules(joules);
    setZpeEv(ev);
  };

  useEffect(() => {
    computeCasimir(gapNm, areaCm2);
    computeZpe(inputHz);
  }, [gapNm, areaCm2, inputHz]);

  // Live Canvas: Quantum Vacuum Fluctuation Virtual Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface ParticlePair {
      x: number;
      y: number;
      radius: number;
      age: number;
      maxAge: number;
      dx: number;
      dy: number;
      color: string;
    }

    const pairs: ParticlePair[] = [];
    let tick = 0;

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      tick += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "rgba(3, 7, 18, 0.25)";
      ctx.fillRect(0, 0, w, h);

      // Spawn virtual particle pairs
      if (pairs.length < 45 && Math.random() < 0.6) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const maxAge = 25 + Math.random() * 35;
        pairs.push({
          x,
          y,
          radius: 1 + Math.random() * 2.5,
          age: 0,
          maxAge,
          dx: (Math.random() - 0.5) * 1.5,
          dy: (Math.random() - 0.5) * 1.5,
          color: Math.random() > 0.5 ? "#00f0ff" : "#bf5af2",
        });
      }

      // Draw virtual particles
      for (let i = pairs.length - 1; i >= 0; i--) {
        const p = pairs[i];
        p.age += 1;
        p.x += p.dx;
        p.y += p.dy;

        const opacity = Math.sin((p.age / p.maxAge) * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Anti-particle counterpart
        ctx.beginPath();
        ctx.arc(p.x - p.dx * p.age * 0.8, p.y - p.dy * p.age * 0.8, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.age >= p.maxAge) {
          pairs.splice(i, 1);
        }
      }

      // Casimir Plates Visualization in Center
      const plateWidth = 240;
      const plateHeight = 8;
      const cx = w / 2;
      const cy = h / 2;
      const visualGap = Math.max(10, Math.min(80, (gapNm / 1000) * 80 + 10));

      // Top Plate
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(cx - plateWidth / 2, cy - visualGap / 2 - plateHeight, plateWidth, plateHeight);
      ctx.strokeStyle = "#00f0ff";
      ctx.strokeRect(cx - plateWidth / 2, cy - visualGap / 2 - plateHeight, plateWidth, plateHeight);

      // Bottom Plate
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(cx - plateWidth / 2, cy + visualGap / 2, plateWidth, plateHeight);
      ctx.strokeStyle = "#00f0ff";
      ctx.strokeRect(cx - plateWidth / 2, cy + visualGap / 2, plateWidth, plateHeight);

      // Text between plates
      ctx.fillStyle = "#00f0ff";
      ctx.font = "11px monospace";
      ctx.fillText(`GAP d = ${gapNm} nm`, cx - 45, cy + 4);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gapNm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-fuchsia-950/60 border border-fuchsia-500/40 text-fuchsia-400">
              <Atom className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  OR EIN SOF <span className="text-fuchsia-400">אוֹר אֵין סוֹף</span> — ZERO-POINT ENERGY & CASIMIR ENGINE
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50">
                  ½ℏω QUANTUM VACUUM
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Quantum vacuum fluctuations, Casimir cavity force equations, and ground-state harmonic energy conversion.
              </p>
            </div>
          </div>
        </div>

        {/* Master Tone Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => playTone(inputHz, 0.25, "sine", `ZPE HARMONIC (${inputHz}Hz)`)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-fuchsia-600/30 hover:bg-fuchsia-600/50 text-fuchsia-200 border border-fuchsia-400/50 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>PLAY ZPE HARMONIC ({inputHz} Hz)</span>
          </button>
        </div>
      </div>

      {/* Top Constants Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-fuchsia-300 mb-1">REDUCED PLANCK CONSTANT (ℏ)</div>
          <div className="text-lg font-bold text-white font-mono">1.05457 × 10⁻³⁴</div>
          <div className="text-[10px] text-fuchsia-400 mt-1">Joule · seconds</div>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-cyan-300 mb-1">SPEED OF LIGHT (c)</div>
          <div className="text-lg font-bold text-cyan-200 font-mono">299,792,458</div>
          <div className="text-[10px] text-cyan-400 mt-1">meters / second</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-emerald-300 mb-1">CASIMIR PRESSURE (d={gapNm}nm)</div>
          <div className="text-lg font-bold text-emerald-200 font-mono">
            {casimirPressurePa > 1e6
              ? `${(casimirPressurePa / 1e6).toFixed(2)} MPa`
              : `${casimirPressurePa.toFixed(2)} Pa`}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">{casimirAtm.toExponential(3)} ATM</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-amber-300 mb-1">GROUND ENERGY E₀ (f={inputHz}Hz)</div>
          <div className="text-lg font-bold text-amber-200 font-mono">{zpeEv.toExponential(4)} eV</div>
          <div className="text-[10px] text-amber-400 mt-1">½ ℏ ω Ground Mode</div>
        </div>
      </div>

      {/* Main Grid: Casimir Visualizer & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vacuum Fluctuation & Plate Gap Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-fuchsia-500/30 bg-black/90 p-3 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-fuchsia-500/20 text-xs font-mono text-fuchsia-300">
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-fuchsia-400" />
                <span>QUANTUM VACUUM VIRTUAL PARTICLE FLUCTUATIONS & CONDUCTING PLATES</span>
              </div>
              <span className="text-slate-400">F/A = - (π² ℏ c) / (240 d⁴)</span>
            </div>
            <canvas ref={canvasRef} width={800} height={340} className="w-full h-[320px] bg-slate-950/90 rounded" />
          </div>

          {/* Interactive Gap Slider & Calculation */}
          <div className="p-5 rounded-xl border border-fuchsia-500/20 bg-slate-900/40 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-fuchsia-400" />
                CASIMIR CAVITY GAP PARAMETER (nm)
              </h3>
              <span className="text-xs font-mono text-fuchsia-300 font-bold">
                Gap: {gapNm} nm ({(gapNm * 1e-9).toExponential(2)} m)
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min={5}
                max={500}
                step={1}
                value={gapNm}
                onChange={(e) => setGapNm(parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>5 nm (Extreme Sub-Micro Force)</span>
                <span>50 nm</span>
                <span>100 nm</span>
                <span>500 nm (Macro Limit)</span>
              </div>
            </div>

            {/* Quick Gap Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setGapNm(preset)}
                  className={`py-1.5 rounded font-mono text-xs border transition-all ${
                    gapNm === preset
                      ? "bg-fuchsia-600 text-white border-fuchsia-400 font-bold"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-fuchsia-500/40"
                  }`}
                >
                  {preset} nm
                </button>
              ))}
            </div>

            {/* Computed Force Table */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">TOTAL ATTRACTIVE FORCE (1 cm²)</span>
                <span className="text-emerald-300 font-bold text-sm">
                  {attractiveForceMicroN.toFixed(3)} µN
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">EQUIVALENT ATMOSPHERES</span>
                <span className="text-cyan-300 font-bold text-sm">{casimirAtm.toExponential(3)} ATM</span>
              </div>
              <div>
                <span className="text-slate-500 block">VACUUM DENSITY REGIME</span>
                <span className="text-fuchsia-400 font-bold text-sm">EXCLUDED PHOTONS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Frequency to ZPE Ground State Calculator */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-fuchsia-500/30 bg-slate-900/60 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              FREQUENCY → ZERO-POINT ENERGY
            </h3>
            <p className="text-[11px] text-slate-400">
              Calculates harmonic oscillator ground-state quantum energy: <strong>E₀ = ½ ℏ ω</strong>.
            </p>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">ENTER FREQUENCY (Hz)</label>
              <input
                type="number"
                value={inputHz}
                onChange={(e) => setInputHz(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono text-white focus:border-fuchsia-500 focus:outline-none"
              />
            </div>

            {/* Quick Frequency Buttons */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <button
                onClick={() => setInputHz(432)}
                className="p-1.5 rounded bg-slate-800 text-slate-200 hover:text-white"
              >
                432 Hz (David's Harp)
              </button>
              <button
                onClick={() => setInputHz(528)}
                className="p-1.5 rounded bg-slate-800 text-slate-200 hover:text-white"
              >
                528 Hz (DNA Repair)
              </button>
              <button
                onClick={() => setInputHz(40)}
                className="p-1.5 rounded bg-slate-800 text-slate-200 hover:text-white"
              >
                40 Hz (Gamma Brain)
              </button>
              <button
                onClick={() => setInputHz(111)}
                className="p-1.5 rounded bg-slate-800 text-slate-200 hover:text-white"
              >
                111 Hz (Pyramid Tone)
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ENERGY (JOULES):</span>
                <span className="text-fuchsia-300 font-bold">{zpeJoules.toExponential(5)} J</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ENERGY (eV):</span>
                <span className="text-emerald-300 font-bold">{zpeEv.toExponential(5)} eV</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-xs font-mono space-y-2">
            <h4 className="font-bold text-slate-300 uppercase">THE COSMOLOGICAL CONSTANT CATASTROPHE</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard Quantum Field Theory (QFT) predicts vacuum energy density ~10¹¹⁴ J/m³, while astronomical observations of dark energy yield ~10⁻⁹ J/m³ — a 120 orders-of-magnitude discrepancy known as physics' greatest unresolved puzzle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
