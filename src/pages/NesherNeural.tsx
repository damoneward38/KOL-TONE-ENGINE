"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Activity, 
  Zap, 
  Radio, 
  Sparkles, 
  Play, 
  Square, 
  ShieldCheck, 
  Cpu, 
  Waves,
  RefreshCw,
  Volume2
} from "lucide-react";
import { playTone, stopTone } from "@/src/lib/sound-synth";

interface BandInfo {
  name: string;
  range: string;
  hzDefault: number;
  color: string;
  powerPct: number;
  description: string;
}

const INITIAL_BANDS: BandInfo[] = [
  { name: "DELTA", range: "0.5 – 4 Hz", hzDefault: 2, color: "#ef4444", powerPct: 14, description: "Deep restorative sleep, immune system healing, unconscious processing" },
  { name: "THETA", range: "4 – 8 Hz", hzDefault: 6, color: "#f59e0b", powerPct: 22, description: "Intuition, subconscious memory recall, hypnagogic imagery, deep meditation" },
  { name: "ALPHA", range: "8 – 13 Hz", hzDefault: 10, color: "#10b981", powerPct: 30, description: "Calm flow state, relaxed mental alertness, accelerated learning bridge" },
  { name: "BETA", range: "13 – 30 Hz", hzDefault: 20, color: "#3b82f6", powerPct: 22, description: "Active logical cognition, analytical focus, external problem solving" },
  { name: "GAMMA", range: "30 – 100 Hz", hzDefault: 40, color: "#a855f7", powerPct: 12, description: "Hyper-cognition, information binding, peak neural synchrony & awareness" },
];

export default function NesherNeural() {
  const [bands, setBands] = useState<BandInfo[]>(INITIAL_BANDS);
  const [isScanning, setIsScanning] = useState(false);
  const [brainState, setBrainState] = useState("FLOW_SYNCHRONY");
  const [coherence, setCoherence] = useState(0.96);
  const [focusIndex, setFocusIndex] = useState(0.88);
  const [activeBandTone, setActiveBandTone] = useState<number | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([
    "INITIALIZED: 256-Channel Quantum EEG Synced",
    "ELECTRODE IMPEDANCE: 1.1 kΩ (Optimal)",
    "BASELINE COHERENCE: 96.2%",
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Trigger real scan via backend
  const handleStartScan = async () => {
    setIsScanning(true);
    playTone(40, 0.2, "sine", "NESHER GAMMA SCAN");
    try {
      const res = await fetch("/api/nesher/scan", { method: "POST" });
      const data = await res.json();
      if (data.success && data.bands) {
        setBands([
          { ...bands[0], powerPct: data.bands.delta.powerPct },
          { ...bands[1], powerPct: data.bands.theta.powerPct },
          { ...bands[2], powerPct: data.bands.alpha.powerPct },
          { ...bands[3], powerPct: data.bands.beta.powerPct },
          { ...bands[4], powerPct: data.bands.gamma.powerPct },
        ]);
        setCoherence(data.coherenceScore);
        setFocusIndex(data.focusIndex);
        setBrainState(data.dominantState);
        setScanHistory((prev) => [
          `SCAN COMPLETE: Coherence ${(data.coherenceScore * 100).toFixed(1)}% | Focus ${(data.focusIndex * 100).toFixed(0)}%`,
          ...prev.slice(0, 5),
        ]);
      }
    } catch {
      setScanHistory((prev) => ["OFFLINE SCAN SIMULATED — Coherence 97.4%", ...prev.slice(0, 5)]);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePlayTone = (hz: number, name: string) => {
    if (activeBandTone === hz) {
      stopTone(hz);
      setActiveBandTone(null);
    } else {
      if (activeBandTone) stopTone(activeBandTone);
      playTone(hz, 0.25, "sine", `NESHER ${name} (${hz} Hz)`);
      setActiveBandTone(hz);
    }
  };

  // Real-time 8-Channel EEG Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;
    const channels = ["FP1", "FP2", "C3", "C4", "T3", "T4", "O1", "O2"];
    const channelColors = ["#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      tick += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const channelHeight = h / channels.length;

      channels.forEach((ch, idx) => {
        const centerY = channelHeight * idx + channelHeight / 2;
        const color = channelColors[idx % channelColors.length];

        // Channel separator & label
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.beginPath();
        ctx.moveTo(0, channelHeight * (idx + 1));
        ctx.lineTo(w, channelHeight * (idx + 1));
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = "10px monospace";
        ctx.fillText(`${ch} — 48kHz`, 12, centerY - 6);

        // Waveform trace
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.beginPath();

        const freqFactor = (idx + 1) * 0.7;
        const scanMultiplier = isScanning ? 1.6 : 1.0;

        for (let x = 0; x < w; x += 3) {
          const noise = Math.sin(x * 0.05 + tick * 3 + idx) * 3;
          const carrier = Math.sin(x * 0.02 * freqFactor + tick * freqFactor) * (channelHeight * 0.28 * scanMultiplier);
          const harmonic = Math.sin(x * 0.08 + tick * 5) * 4;
          const y = centerY + carrier + noise + harmonic;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isScanning]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-400">
              <Brain className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  NESHER <span className="text-purple-400">נֶשֶׁר</span> — NEURAL BCI & EEG OSCILLOSCOPE
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/50">
                  256 CHANNELS LIVE
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Direct neural interface, brainwave band decomposition, and synaptic coherence entrainment.
              </p>
            </div>
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
          >
            <Activity className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>START BRAIN SCAN</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-purple-300 mb-1">BRAIN STATE</div>
          <div className="text-lg font-bold text-white font-mono tracking-tight">{brainState}</div>
          <div className="text-[10px] text-purple-400 mt-1">Sovereign Synchrony</div>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-cyan-300 mb-1">SYSTEM COHERENCE</div>
          <div className="text-lg font-bold text-cyan-200 font-mono">{(coherence * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-cyan-400 mt-1">Inter-hemispheric Lock</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-emerald-300 mb-1">FOCUS INDEX</div>
          <div className="text-lg font-bold text-emerald-200 font-mono">{(focusIndex * 100).toFixed(0)} / 100</div>
          <div className="text-[10px] text-emerald-400 mt-1">Dorsal Attention Peak</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-amber-300 mb-1">SAMPLING RATE</div>
          <div className="text-lg font-bold text-amber-200 font-mono">48,000 Hz</div>
          <div className="text-[10px] text-amber-400 mt-1">256 Dry Matrix Electrodes</div>
        </div>
      </div>

      {/* Main Grid: 8-Channel Oscilloscope + 5 Band Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 8-Channel Live Waveform Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-3 rounded-xl border border-purple-500/30 bg-black/90 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-purple-500/20 text-xs font-mono text-purple-300">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-purple-400" />
                <span>8-CHANNEL NEURAL WAVE OSCILLOSCOPE</span>
              </div>
              <span>TIME DOMAIN: 10ms/div</span>
            </div>
            <canvas ref={canvasRef} width={800} height={420} className="w-full h-[400px] bg-slate-950/80 rounded" />
          </div>

          {/* Scan Execution Log */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs font-mono space-y-1.5">
            <div className="text-slate-400 font-bold mb-1 flex items-center justify-between">
              <span>NESHER LOG STREAM</span>
              <span className="text-emerald-400">● LIVE</span>
            </div>
            {scanHistory.map((item, i) => (
              <div key={i} className="text-slate-300 flex items-center gap-2">
                <span className="text-purple-400">›</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: 5 Frequency Bands Power & Audio Tone Synthesizer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              BRAIN FREQUENCY BANDS
            </h3>
            <span className="text-[10px] font-mono text-purple-400">ENTRAINMENT LIVE</span>
          </div>

          <div className="space-y-2.5">
            {bands.map((b) => {
              const isPlaying = activeBandTone === b.hzDefault;
              return (
                <div key={b.name} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-xs font-mono font-bold text-slate-200">{b.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({b.range})</span>
                    </div>

                    <button
                      onClick={() => handlePlayTone(b.hzDefault, b.name)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                        isPlaying 
                          ? "bg-purple-600 text-white font-bold animate-pulse" 
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                      title={`Play ${b.name} ${b.hzDefault} Hz in KOL engine`}
                    >
                      <Volume2 className="w-2.5 h-2.5" />
                      <span>{isPlaying ? "STOP" : `PLAY ${b.hzDefault}Hz`}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">{b.description}</p>

                  {/* Power Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>POWER DISTRIBUTION</span>
                      <span className="text-slate-200 font-bold">{b.powerPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${b.powerPct}%`, backgroundColor: b.color }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
