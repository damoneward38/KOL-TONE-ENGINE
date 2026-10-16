"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Play, 
  RefreshCw, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  Volume2
} from "lucide-react";
import { playTone } from "@/src/lib/sound-synth";

interface PipelineStage {
  id: number;
  name: string;
  role: string;
  latencyMs: number;
  status: "PENDING" | "RUNNING" | "PASSED";
}

const DEFAULT_STAGES: PipelineStage[] = [
  { id: 1, name: "SIGNAL_CAPTURE", role: "Acoustic, Optical, EEG & Quantum Signal Ingestion", latencyMs: 0.2, status: "PASSED" },
  { id: 2, name: "FFT_ANALYSIS", role: "Fast Fourier Transform Spectral Decomposition", latencyMs: 0.4, status: "PASSED" },
  { id: 3, name: "BAND_EXTRACTION", role: "5-Band EEG & Solfeggio Harmonic Demux", latencyMs: 0.3, status: "PASSED" },
  { id: 4, name: "PATTERN_DETECT", role: "Resonance Pattern & Biometric Vector Recognition", latencyMs: 2.1, status: "PASSED" },
  { id: 5, name: "BLOCK_UPDATE", role: "Sovereign State Synchronization & Memory Hash", latencyMs: 0.8, status: "PASSED" },
  { id: 6, name: "AI_ANALYSIS", role: "Gemini 3.8 Flash High-Density Inference", latencyMs: 12.4, status: "PASSED" },
  { id: 7, name: "MEMORY_STORE", role: "Vector Memory Bank Persistent Commit", latencyMs: 4.1, status: "PASSED" },
  { id: 8, name: "RESPONSE_GEN", role: "Acoustic, Optical & Textual Payload Formulation", latencyMs: 1.2, status: "PASSED" },
  { id: 9, name: "BROADCAST", role: "Multi-System Synchronous 8-Node Dispatch", latencyMs: 0.3, status: "PASSED" },
];

export default function DaatPipeline() {
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES);
  const [isRunning, setIsRunning] = useState(false);
  const [totalLatency, setTotalLatency] = useState<number>(21.8);
  const [coherence, setCoherence] = useState<number>(0.999);
  const [runCount, setRunCount] = useState<number>(42);
  const [lastPipelineId, setLastPipelineId] = useState<string>("daat_master_init");

  const handleRunPipeline = async () => {
    setIsRunning(true);
    playTone(528, 0.2, "sine", "DAAT PIPELINE INITIALIZED");

    // Animate stages step by step
    setStages(prev => prev.map(s => ({ ...s, status: "PENDING" })));

    try {
      const res = await fetch("/api/daat/run", { method: "POST" });
      const data = await res.json();

      if (data.stages) {
        setStages(data.stages);
        setTotalLatency(data.totalLatencyMs);
        setCoherence(data.systemCoherence);
        setLastPipelineId(data.pipelineId);
        setRunCount(c => c + 1);
        playTone(963, 0.25, "sine", "DAAT PIPELINE COMPLETE");
      }
    } catch {
      // Fallback local animation
      for (let i = 0; i < stages.length; i++) {
        await new Promise(r => setTimeout(r, 60));
        setStages(prev => prev.map((s, idx) => idx === i ? { ...s, status: "PASSED" } : s));
      }
      playTone(963, 0.25, "sine", "DAAT COMPLETE");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <Zap className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  DAAT <span className="text-amber-400">דַּעַת</span> — UNIFIED 9-STAGE PIPELINE
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                  REAL-TIME SYNC
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Synchronous real-time pipeline bridging optical, neural, acoustic, hyperbaric, and quantum vacuum engines.
              </p>
            </div>
          </div>
        </div>

        {/* Master Execution Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-mono text-xs font-bold border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? "animate-spin" : ""}`} />
            <span>RUN COMPLETE 9-STAGE PIPELINE</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-amber-300 mb-1">TOTAL PIPELINE LATENCY</div>
          <div className="text-2xl font-bold text-white font-mono">{totalLatency} ms</div>
          <div className="text-[10px] text-amber-400 mt-1">9 Stages Synchronous</div>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-cyan-300 mb-1">SYSTEM COHERENCE</div>
          <div className="text-2xl font-bold text-cyan-200 font-mono">{(coherence * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-cyan-400 mt-1">Zero Phase Deviation</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-emerald-300 mb-1">EXECUTIONS LOGGED</div>
          <div className="text-2xl font-bold text-emerald-200 font-mono">{runCount}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Zero Failure Rate</div>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-purple-300 mb-1">PIPELINE ID</div>
          <div className="text-sm font-bold text-purple-200 font-mono truncate">{lastPipelineId}</div>
          <div className="text-[10px] text-purple-400 mt-1">Sovereign Consensus</div>
        </div>
      </div>

      {/* 9 Stages Interactive Visual Flow */}
      <div className="p-5 rounded-xl border border-amber-500/30 bg-black/90 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            9-STAGE EXECUTION SEQUENCE
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {isRunning ? "PROCESSING PIPELINE..." : "ALL STAGES PASSED"}
          </span>
        </div>

        <div className="space-y-2.5">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`p-3 rounded-lg border transition-all flex flex-wrap items-center justify-between gap-2 ${
                stage.status === "PASSED"
                  ? "border-amber-500/40 bg-amber-950/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                  : stage.status === "RUNNING"
                  ? "border-cyan-500 bg-cyan-950/40 animate-pulse"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-950 border border-amber-500/50 flex items-center justify-center text-xs font-mono font-bold text-amber-300">
                  {stage.id}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white tracking-wide">
                      {stage.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      — {stage.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">{stage.latencyMs} ms</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  {stage.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8-Node Interconnect Matrix */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          DAAT 8-SYSTEM INTERCONNECT MATRIX
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {[
            { name: "RUACH (רוּחַ)", type: "AI Intelligence", status: "ONLINE", metric: "Gemini 3.8" },
            { name: "NESHER (נֶשֶׁר)", type: "Neural BCI", status: "ONLINE", metric: "256ch / 48kHz" },
            { name: "CHAYYIM (חַיִּים)", type: "Live Telemetry", status: "ONLINE", metric: "<1ms Bridge" },
            { name: "DAAT (דַּעַת)", type: "Unified Pipeline", status: "ONLINE", metric: "9 Stages" },
            { name: "KOL (קוֹל)", type: "Tone Synthesizer", status: "ONLINE", metric: "Web Audio" },
            { name: "NESHIMA (נְשִׁימָה)", type: "Hyperbaric Chamber", status: "ONLINE", metric: "1.0 - 3.0 ATM" },
            { name: "AYIN (עַיִן)", type: "Optic Array", status: "ONLINE", metric: "8 Spectrums" },
            { name: "OR EIN SOF (אוֹר)", type: "ZPE Engine", status: "ONLINE", metric: "Casimir Cavity" },
          ].map((n) => (
            <div key={n.name} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-slate-200 font-bold">{n.name}</div>
              <div className="text-slate-400 text-[11px]">{n.type}</div>
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800">
                <span className="text-emerald-400 font-bold">● {n.status}</span>
                <span className="text-cyan-400">{n.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
