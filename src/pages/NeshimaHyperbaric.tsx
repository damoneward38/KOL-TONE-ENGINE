"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Activity, 
  Wind, 
  Gauge, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Flame,
  Volume2
} from "lucide-react";
import { playTone } from "@/src/lib/sound-synth";

interface Protocol {
  id: string;
  name: string;
  atm: number;
  o2Pct: number;
  durationMin: number;
  description: string;
  biomarkers: string;
}

const PROTOCOLS: Protocol[] = [
  {
    id: "tissue",
    name: "Tissue Regeneration & Angiogenesis",
    atm: 2.0,
    o2Pct: 100,
    durationMin: 90,
    description: "Stimulates capillary growth (VEGF), collagen deposition, and cellular hypoxia recovery.",
    biomarkers: "VEGF +340%, HIF-1α Modulated, Fibroblast Proliferation",
  },
  {
    id: "mitochondria",
    name: "Mitochondrial Resilience & ATP Surge",
    atm: 1.75,
    o2Pct: 95,
    durationMin: 60,
    description: "Enhances electron transport chain efficiency, Cytochrome c Oxidase activity, and cellular ATP output.",
    biomarkers: "ATP Synthesis +420%, ROS Quenched, NAD+/NADH +28%",
  },
  {
    id: "neuro",
    name: "Neuroplasticity & TBI Recovery",
    atm: 2.4,
    o2Pct: 100,
    durationMin: 75,
    description: "Penetrates compromised blood-brain barrier regions, boosts BDNF, and reduces neuro-inflammation.",
    biomarkers: "BDNF +280%, Microglial Calming, Neural Perfusion +65%",
  },
  {
    id: "stem_cell",
    name: "Stem Cell Mobilization (8-Fold Expansion)",
    atm: 2.5,
    o2Pct: 100,
    durationMin: 120,
    description: "Triggers bone marrow mobilization of CD34+ pluripotential stem cells for whole-body rejuvenation.",
    biomarkers: "Circulating CD34+ Stem Cells +800%, Telomerase Activation",
  },
];

export default function NeshimaHyperbaric() {
  const [pressureAtm, setPressureAtm] = useState<number>(1.0);
  const [o2Pct, setO2Pct] = useState<number>(21);
  const [targetAtm, setTargetAtm] = useState<number>(1.0);
  const [activeProtocol, setActiveProtocol] = useState<string>("RESTING_AMBIENT");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("CHAMBER IN RESTING AMBIENT STATE");

  // Load initial status
  useEffect(() => {
    fetch("/api/neshima/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPressureAtm(data.pressureAtm);
          setO2Pct(data.o2Percentage);
          setTargetAtm(data.targetAtm);
        }
      })
      .catch(() => {});
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeRemainingSec > 0) {
      interval = setInterval(() => {
        setTimeRemainingSec((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playTone(528, 0.3, "sine", "NESHIMA PROTOCOL COMPLETE");
            setStatusMessage("PROTOCOL SESSION COMPLETE — REPRESSURIZING TO AMBIENT");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemainingSec]);

  const handleApplyPressure = async (newAtm: number) => {
    const clamped = Math.max(1.0, Math.min(3.0, newAtm));
    setPressureAtm(clamped);
    setTargetAtm(clamped);
    playTone(111, 0.2, "sine", "NESHIMA PRESSURE SHIFT");
    try {
      await fetch("/api/neshima/pressure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pressure: clamped }),
      });
      setStatusMessage(`PRESSURE ADJUSTED TO ${clamped.toFixed(2)} ATM`);
    } catch {}
  };

  const handleEngageProtocol = async (p: Protocol) => {
    setPressureAtm(p.atm);
    setTargetAtm(p.atm);
    setO2Pct(p.o2Pct);
    setActiveProtocol(p.name);
    setTimeRemainingSec(p.durationMin * 60);
    setIsRunning(true);
    playTone(528, 0.25, "sine", `NESHIMA ${p.name}`);
    setStatusMessage(`ENGAGED: ${p.name.toUpperCase()} (${p.atm} ATM, ${p.o2Pct}% O2)`);

    try {
      await fetch("/api/neshima/protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolName: p.id }),
      });
    } catch {}
  };

  const handleStopChamber = () => {
    setIsRunning(false);
    setTimeRemainingSec(0);
    setPressureAtm(1.0);
    setTargetAtm(1.0);
    setO2Pct(21);
    setActiveProtocol("RESTING_AMBIENT");
    setStatusMessage("DECOMPRESSION COMPLETE — CHAMBER AT AMBIENT (1.0 ATM)");
    fetch("/api/neshima/pressure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pressure: 1.0 }),
    });
  };

  const depthFt = Math.round((pressureAtm - 1.0) * 33);
  const depthM = Math.round((pressureAtm - 1.0) * 10);
  const pO2 = ((pressureAtm * o2Pct) / 100).toFixed(2);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Wind className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  NESHIMA <span className="text-emerald-400">נְשִׁימָה</span> — HYPERBARIC OXYGEN CHAMBER
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  CHAMBER READY
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Precision hyperbaric pressurization, clinical hyperoxia protocols, and cellular stem cell mobilization.
              </p>
            </div>
          </div>
        </div>

        {/* Master Stop / Ambient Reset */}
        <div className="flex items-center gap-2.5">
          {isRunning ? (
            <button
              onClick={handleStopChamber}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/50 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>EMERGENCY DECOMPRESS & STOP</span>
            </button>
          ) : (
            <button
              onClick={() => handleApplyPressure(1.0)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESET AMBIENT (1.0 ATM)</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-emerald-300 mb-1">CHAMBER PRESSURE</div>
          <div className="text-2xl font-bold text-white font-mono">
            {pressureAtm.toFixed(2)} <span className="text-sm text-emerald-400 font-normal">ATM</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Target: {targetAtm.toFixed(2)} ATM</div>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-cyan-300 mb-1">EQUIVALENT DEPTH</div>
          <div className="text-2xl font-bold text-cyan-200 font-mono">
            {depthFt} <span className="text-sm text-cyan-400 font-normal">ft</span> / {depthM} m
          </div>
          <div className="text-[10px] text-cyan-400 mt-1">Seawater Equivalent</div>
        </div>

        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-blue-300 mb-1">OXYGEN CONCENTRATION</div>
          <div className="text-2xl font-bold text-blue-200 font-mono">
            {o2Pct}% <span className="text-xs text-blue-400 font-normal">pO₂: {pO2} ATA</span>
          </div>
          <div className="text-[10px] text-blue-400 mt-1">Hyperoxic Plasma Saturation</div>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-purple-300 mb-1">SESSION TIME REMAINING</div>
          <div className="text-2xl font-bold text-purple-200 font-mono">
            {isRunning ? formatTime(timeRemainingSec) : "--:--"}
          </div>
          <div className="text-[10px] text-purple-400 mt-1">{isRunning ? "Protocol Active" : "Chamber Idle"}</div>
        </div>
      </div>

      {/* Main Chamber UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Chamber Gauge & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-xl border border-emerald-500/30 bg-black/90 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-mono font-bold text-slate-200">
                  MANUAL PRESSURE & DECOMPRESSION CONTROLLER
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">{statusMessage}</span>
            </div>

            {/* Big Interactive Pressure Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400">
                <span>1.0 ATM (Sea Level)</span>
                <span className="text-base text-emerald-300 font-bold">{pressureAtm.toFixed(2)} ATM</span>
                <span>3.0 ATM (Max Hyperbaric Limit)</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={3.0}
                step={0.05}
                value={pressureAtm}
                onChange={(e) => handleApplyPressure(parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Quick ATM Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[1.0, 1.5, 2.0, 2.5].map((atmVal) => (
                <button
                  key={atmVal}
                  onClick={() => handleApplyPressure(atmVal)}
                  className={`py-2 rounded-lg font-mono text-xs font-bold border transition-all ${
                    Math.abs(pressureAtm - atmVal) < 0.05
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40"
                  }`}
                >
                  {atmVal.toFixed(1)} ATM
                </button>
              ))}
            </div>

            {/* Chamber Safety & Telemetry Monitor */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">CHAMBER TEMP</span>
                <span className="text-slate-200 font-bold">21.8 °C</span>
              </div>
              <div>
                <span className="text-slate-500 block">HUMIDITY</span>
                <span className="text-slate-200 font-bold">48% RH</span>
              </div>
              <div>
                <span className="text-slate-500 block">COMPRESSION RATE</span>
                <span className="text-slate-200 font-bold">0.10 ATM/min</span>
              </div>
              <div>
                <span className="text-slate-500 block">SAFETY RELIEF</span>
                <span className="text-emerald-400 font-bold">ALL VALVES NOMINAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: 4 Clinical Healing Protocols */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              CLINICAL HEALING PROTOCOLS
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">1-CLICK ENGAGE</span>
          </div>

          <div className="space-y-2.5">
            {PROTOCOLS.map((p) => {
              const isActive = activeProtocol === p.name && isRunning;
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isActive
                      ? "border-emerald-500 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-black/40 px-1.5 py-0.5 rounded border border-emerald-900">
                      {p.atm} ATM • {p.durationMin}m
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug mb-2">
                    {p.description}
                  </p>

                  <div className="text-[10px] font-mono text-emerald-400/80 mb-3 bg-emerald-950/20 p-1.5 rounded">
                    <strong>Biomarkers:</strong> {p.biomarkers}
                  </div>

                  <button
                    onClick={() => handleEngageProtocol(p)}
                    className={`w-full py-1.5 rounded font-mono text-xs font-bold transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white animate-pulse"
                        : "bg-slate-800 hover:bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {isActive ? "PROTOCOL ACTIVE ▶" : "ENGAGE PROTOCOL"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
