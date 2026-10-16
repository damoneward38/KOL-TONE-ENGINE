"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  Layers, 
  Sliders, 
  Camera, 
  RefreshCw, 
  Check, 
  Zap, 
  Activity, 
  Radio, 
  Shield, 
  Maximize2,
  Sparkles,
  Volume2
} from "lucide-react";
import { playTone } from "@/src/lib/sound-synth";

interface SpectrumItem {
  id: string;
  name: string;
  code: string;
  wavelength: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  description: string;
  frequencyHz: number;
}

const SPECTRUMS: SpectrumItem[] = [
  {
    id: "infrared",
    name: "Infrared (IR)",
    code: "IR_SPECTRUM_01",
    wavelength: "700 nm – 1 mm",
    color: "#ff3b30",
    borderColor: "border-red-500/50",
    bgGlow: "bg-red-950/30",
    description: "Thermal radiation, night emission, heat signatures",
    frequencyHz: 432,
  },
  {
    id: "thermal",
    name: "Thermal FLIR",
    code: "FLIR_DIFF_02",
    wavelength: "8 – 14 µm",
    color: "#ff9500",
    borderColor: "border-amber-500/50",
    bgGlow: "bg-amber-950/30",
    description: "Differential heat signatures, radiant body detection",
    frequencyHz: 528,
  },
  {
    id: "ultraviolet",
    name: "Ultraviolet (UV)",
    code: "UV_BLACKLIGHT_03",
    wavelength: "10 – 400 nm",
    color: "#bf5af2",
    borderColor: "border-purple-500/50",
    bgGlow: "bg-purple-950/30",
    description: "Fluorescence, trace luminescence, high-energy photonic excitation",
    frequencyHz: 639,
  },
  {
    id: "xray",
    name: "X-Ray Radiograph",
    code: "XRAY_PENETRATE_04",
    wavelength: "0.01 – 10 nm",
    color: "#00f0ff",
    borderColor: "border-cyan-500/50",
    bgGlow: "bg-cyan-950/30",
    description: "Bone & dense matter opacity, skeletal internal structure",
    frequencyHz: 741,
  },
  {
    id: "night_vision",
    name: "Night Vision Phosphor",
    code: "NV_GEN4_PHOSPHOR_05",
    wavelength: "Photomultiplier",
    color: "#30d158",
    borderColor: "border-emerald-500/50",
    bgGlow: "bg-emerald-950/30",
    description: "Gen-4 monochrome green phosphor light amplification with scanlines",
    frequencyHz: 396,
  },
  {
    id: "mmwave",
    name: "mm-Wave Dielectric",
    code: "MMW_300GHZ_06",
    wavelength: "1 – 10 mm (30–300 GHz)",
    color: "#ffd60a",
    borderColor: "border-yellow-500/50",
    bgGlow: "bg-yellow-950/30",
    description: "Sub-surface dielectric contour penetration and depth mapping",
    frequencyHz: 852,
  },
  {
    id: "magnetic",
    name: "Magnetic Field Flux",
    code: "MAG_FLUX_ISOLINE_07",
    wavelength: "Flux / Gauss",
    color: "#0a84ff",
    borderColor: "border-blue-500/50",
    bgGlow: "bg-blue-950/30",
    description: "Vector field isolines, electromagnetic gradient distortion",
    frequencyHz: 963,
  },
  {
    id: "sonar_zpe",
    name: "Sonar / ZPE Vacuum",
    code: "ZPE_VACUUM_HARMONIC_08",
    wavelength: "Acoustic / Quantum",
    color: "#e056fd",
    borderColor: "border-fuchsia-500/50",
    bgGlow: "bg-fuchsia-950/30",
    description: "Zero-point quantum vacuum fluctuation ripples & acoustic resonance",
    frequencyHz: 111,
  },
];

export default function AyinSpectrum() {
  const [activeMode, setActiveMode] = useState<string>("all");
  const [combinerMode1, setCombinerMode1] = useState<string>("thermal");
  const [combinerMode2, setCombinerMode2] = useState<string>("xray");
  const [blendRatio, setBlendRatio] = useState<number>(50);
  const [opticSync, setOpticSync] = useState<number>(100);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [scanStatus, setScanStatus] = useState<string>("ALL SYSTEMS NOMINAL");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [useCamera, setUseCamera] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Initialize or trigger audio + scan
  const handleSelectSpectrum = (id: string, freq: number) => {
    setActiveMode(id);
    playTone(freq, 0.15, "sine", `AYIN ${id.toUpperCase()}`);
    setScanStatus(`LOCKED TO ${id.toUpperCase()}`);
  };

  const handleUnlockAll = async () => {
    setIsScanning(true);
    playTone(432, 0.2, "sine", "AYIN UNLOCK ALL");
    try {
      const res = await fetch("/api/ayin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all" }),
      });
      const data = await res.json();
      setActiveMode("all");
      setOpticSync(100);
      setScanStatus("ALL 8 SPECTRUMS UNLOCKED & SYNCHRONIZED");
    } catch {
      setScanStatus("SYNCHRONIZED (OFFLINE FALLBACK)");
    } finally {
      setIsScanning(false);
    }
  };

  // Web camera toggle
  const toggleCamera = async () => {
    if (!useCamera) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setUseCamera(true);
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable, using quantum synthetic feed", err);
        setUseCamera(false);
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setUseCamera(false);
    }
  };

  // Interactive Live Canvas Scanner with synthetic holographic rendering & filters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      tick += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic background
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      // If user enabled webcam, draw video frame first then apply filter shaders
      if (useCamera && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        // Apply active spectrum color overlay
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const avg = (r + g + b) / 3;

          if (activeMode === "night_vision") {
            data[i] = 0;
            data[i + 1] = Math.min(255, avg * 1.6);
            data[i + 2] = 20;
          } else if (activeMode === "thermal") {
            data[i] = Math.min(255, avg * 1.8);
            data[i + 1] = Math.min(255, (255 - avg) * 0.9);
            data[i + 2] = avg < 128 ? 255 - avg * 2 : 20;
          } else if (activeMode === "ultraviolet") {
            data[i] = Math.min(255, avg * 1.4);
            data[i + 1] = 30;
            data[i + 2] = Math.min(255, avg * 2.1);
          } else if (activeMode === "xray") {
            const inverted = 255 - avg;
            data[i] = inverted * 0.7;
            data[i + 1] = inverted * 0.95;
            data[i + 2] = inverted;
          } else if (activeMode === "infrared") {
            data[i] = Math.min(255, avg * 2);
            data[i + 1] = avg * 0.3;
            data[i + 2] = 10;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        ctx.restore();
      } else {
        // Quantum Synthetic Biomarkers & Scan target
        // Draw grid
        ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Draw central biometric human silhouette / quantum target
        const cx = w / 2;
        const cy = h / 2;

        // Radiating spectrum rings
        for (let r = 30; r < 200; r += 35) {
          ctx.beginPath();
          ctx.arc(cx, cy, r + Math.sin(tick + r * 0.05) * 8, 0, Math.PI * 2);
          
          if (activeMode === "infrared") ctx.strokeStyle = `rgba(255, 59, 48, ${0.4 - r * 0.0015})`;
          else if (activeMode === "thermal") ctx.strokeStyle = `rgba(255, 149, 0, ${0.4 - r * 0.0015})`;
          else if (activeMode === "ultraviolet") ctx.strokeStyle = `rgba(191, 90, 242, ${0.4 - r * 0.0015})`;
          else if (activeMode === "xray") ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 - r * 0.0015})`;
          else if (activeMode === "night_vision") ctx.strokeStyle = `rgba(48, 209, 88, ${0.4 - r * 0.0015})`;
          else if (activeMode === "mmwave") ctx.strokeStyle = `rgba(255, 214, 10, ${0.4 - r * 0.0015})`;
          else if (activeMode === "magnetic") ctx.strokeStyle = `rgba(10, 132, 255, ${0.4 - r * 0.0015})`;
          else ctx.strokeStyle = `rgba(224, 86, 253, ${0.4 - r * 0.0015})`;

          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Central targeting crosshair
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy);
        ctx.lineTo(cx + 30, cy);
        ctx.moveTo(cx, cy - 30);
        ctx.lineTo(cx, cy + 30);
        ctx.stroke();

        // Animated horizontal laser scanning bar
        const scanY = (Math.sin(tick * 2) * 0.5 + 0.5) * h;
        const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        grad.addColorStop(0, "rgba(0, 240, 255, 0)");
        grad.addColorStop(0.5, "rgba(0, 240, 255, 0.7)");
        grad.addColorStop(1, "rgba(0, 240, 255, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 20, w, 40);

        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY);
        ctx.stroke();

        // Biometric readings overlay text
        ctx.fillStyle = "#00f0ff";
        ctx.font = "11px monospace";
        ctx.fillText(`TARGET_REF: AYIN_QUANTUM_CORE`, 20, 30);
        ctx.fillText(`MODE: ${activeMode.toUpperCase()}`, 20, 48);
        ctx.fillText(`OPTIC_SYNC: ${opticSync}%`, 20, 66);
        ctx.fillText(`FLUX: ${(1.24 + Math.sin(tick) * 0.1).toFixed(3)} W/m²`, 20, 84);

        ctx.fillText(`FOV: 140° APERTURE`, w - 160, 30);
        ctx.fillText(`FPS: 120.0 Hz`, w - 160, 48);
        ctx.fillText(`RESONANCE: LOCKED`, w - 160, 66);
      }

      // Scanline CRT effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeMode, opticSync, useCamera]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Eye className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  AYIN <span className="text-cyan-400">עַיִן</span> — ALL-SPECTRUM OPTIC ARRAY
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  v2.4 ONLINE
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Sovereign electro-optical multi-spectral sensor array & quantum wave differential scanner.
              </p>
            </div>
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleCamera}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all ${
              useCamera 
                ? "bg-amber-600/30 text-amber-200 border-amber-500/60" 
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{useCamera ? "DISCONNECT WEBCAM" : "LINK LIVE WEBCAM"}</span>
          </button>

          <button
            onClick={handleUnlockAll}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            <Zap className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>INITIALIZE EYE / UNLOCK ALL</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Viewport Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-xl border border-cyan-500/30 bg-black/90 p-2 shadow-2xl overflow-hidden group">
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={480} 
              className="w-full h-[440px] rounded-lg object-cover bg-black"
            />

            {/* Corner Tech Reticles */}
            <div className="absolute top-4 left-4 border-t-2 border-l-2 border-cyan-400 w-4 h-4 pointer-events-none" />
            <div className="absolute top-4 right-4 border-t-2 border-r-2 border-cyan-400 w-4 h-4 pointer-events-none" />
            <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-cyan-400 w-4 h-4 pointer-events-none" />
            <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-cyan-400 w-4 h-4 pointer-events-none" />

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-3 py-1.5 rounded bg-black/80 backdrop-blur border border-cyan-500/30 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  <span>OPTIC_SYNC: 100%</span>
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">ACTIVE: {activeMode.toUpperCase()}</span>
              </div>
              <span className="text-emerald-400 font-bold">{scanStatus}</span>
            </div>
          </div>

          {/* Spectrum Combiner Tool */}
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold text-slate-200">
                  DUAL SPECTRUM COMBINER (COMBINE [MODE1] [MODE2])
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">Coherence: 99.8%</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">PRIMARY SPECTRUM</label>
                <select
                  value={combinerMode1}
                  onChange={(e) => setCombinerMode1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {SPECTRUMS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">BLEND RATIO ({blendRatio}%)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={blendRatio}
                  onChange={(e) => setBlendRatio(+e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">SECONDARY SPECTRUM</label>
                <select
                  value={combinerMode2}
                  onChange={(e) => setCombinerMode2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {SPECTRUMS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveMode(`${combinerMode1}_${combinerMode2}`);
                playTone(528, 0.2, "triangle", `COMBINE ${combinerMode1}+${combinerMode2}`);
                setScanStatus(`COMBINED: ${combinerMode1.toUpperCase()} + ${combinerMode2.toUpperCase()} (${blendRatio}%)`);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-lg font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            >
              EXECUTE COMBINED SPECTRAL FUSION
            </button>
          </div>
        </div>

        {/* Right 1 Col: All 8 Spectrums Quick Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              UNLOCKED SPECTRUM CHANNELS (8/8)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">ALL UNLOCKED</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {SPECTRUMS.map((s) => {
              const isSelected = activeMode === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSpectrum(s.id, s.frequencyHz)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? `${s.borderColor} ${s.bgGlow} shadow-[0_0_15px_rgba(0,240,255,0.25)]`
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: s.color, boxShadow: isSelected ? `0 0 10px ${s.color}` : "none" }} 
                      />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {s.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 border border-cyan-800/40 px-1 rounded bg-black/40">
                      {s.wavelength}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {s.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-500">{s.code}</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Volume2 className="w-2.5 h-2.5" />
                      {s.frequencyHz} Hz
                    </span>
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
