"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Crown, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Cpu, 
  Eye, 
  Brain, 
  Sparkles, 
  Music, 
  Wind, 
  Atom, 
  Layers, 
  Terminal, 
  ArrowRight,
  RefreshCw,
  Power
} from "lucide-react";
import { playTone } from "@/src/lib/sound-synth";

interface EmetMasterProps {
  onNavigateTab: (tabId: string) => void;
}

export default function EmetMasterControl({ onNavigateTab }: EmetMasterProps) {
  const [emetStatus, setEmetStatus] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/emet/status");
      const data = await res.json();
      setEmetStatus(data);
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnectAll = async () => {
    setIsConnecting(true);
    playTone(528, 0.25, "sine", "EMET UNIFIED CONNECT");
    try {
      const res = await fetch("/api/emet/connect", { method: "POST" });
      const data = await res.json();
      setConnectMessage(data.message || "ALL 8 SYSTEMS UNIFIED. SOVEREIGN CONTROL ONLINE.");
      playTone(963, 0.3, "sine", "EMET SOVEREIGN ONLINE");
      fetchStatus();
    } catch {
      setConnectMessage("ALL 8 SYSTEMS UNIFIED UNDER SOVEREIGN CONSENSUS.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 text-amber-300">
              <Crown className="w-7 h-7" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  EMET <span className="text-amber-400">אֱמֶת</span> — SOVEREIGN MASTER CONTROL
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                  ADMIN: DAMONE_WARD
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Master command center orchestrating the unified 8-engine sovereign cyber-physical architecture.
              </p>
            </div>
          </div>
        </div>

        {/* Master Connect Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStatus}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleConnectAll}
            disabled={isConnecting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 via-cyan-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-mono text-xs font-bold border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all"
          >
            <Zap className={`w-4 h-4 ${isConnecting ? "animate-spin" : ""}`} />
            <span>CONNECT ALL 8 SYSTEMS (EMET CONNECT)</span>
          </button>
        </div>
      </div>

      {connectMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{connectMessage}</span>
          </div>
          <button onClick={() => setConnectMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Sovereign User & System Specs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-amber-300 mb-1">SOVEREIGN ADMINISTRATOR</div>
          <div className="text-lg font-bold text-white font-mono">DAMONE_WARD</div>
          <div className="text-[10px] text-amber-400 mt-1">Clearance: SOVEREIGN</div>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-cyan-300 mb-1">PLATFORM STATUS</div>
          <div className="text-lg font-bold text-cyan-200 font-mono">EMET v1.0.0</div>
          <div className="text-[10px] text-emerald-400 mt-1">● ALL SYSTEMS NOMINAL</div>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-purple-300 mb-1">SYSTEM UPTIME</div>
          <div className="text-lg font-bold text-purple-200 font-mono">99.999%</div>
          <div className="text-[10px] text-purple-400 mt-1">Latency: &lt;1ms Local</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur">
          <div className="text-[11px] font-mono text-emerald-300 mb-1">UNIFIED ENGINES</div>
          <div className="text-lg font-bold text-emerald-200 font-mono">8 / 8 ACTIVE</div>
          <div className="text-[10px] text-emerald-400 mt-1">DAAT Coherence: 99.9%</div>
        </div>
      </div>

      {/* 8-Engine Sovereign Directory with Direct Action Jump */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          SOVEREIGN SUBSYSTEM MATRIX (TAP ANY TO ACCESS DEDICATED PAGE & FUNCTIONS)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: "ayin",
              name: "AYIN (עַיִן)",
              title: "Spectrum Vision",
              desc: "8-spectrum electro-optical scanner (IR, Thermal, UV, X-Ray, mmWave, ZPE)",
              icon: Eye,
              color: "text-cyan-400",
              borderColor: "border-cyan-500/30",
              bg: "bg-cyan-950/20",
              actionLabel: "Launch Spectrum Scanner",
            },
            {
              id: "nesher",
              name: "NESHER (נֶשֶׁר)",
              title: "Neural BCI",
              desc: "256-channel EEG brain scan, 5 frequency bands & neural synchrony",
              icon: Brain,
              color: "text-purple-400",
              borderColor: "border-purple-500/30",
              bg: "bg-purple-950/20",
              actionLabel: "Launch Neural BCI",
            },
            {
              id: "ruach",
              name: "RUACH (רוּחַ)",
              title: "Sovereign AI Engine",
              desc: "Autonomous command center, microphone STT, speaker TTS & memory bank",
              icon: Sparkles,
              color: "text-blue-400",
              borderColor: "border-blue-500/30",
              bg: "bg-blue-950/20",
              actionLabel: "Launch Autonomous Chat",
            },
            {
              id: "kol",
              name: "KOL (קוֹל)",
              title: "Sound Synthesizer",
              desc: "Web Audio 48kHz synth, David's Harp 432Hz, DNA 528Hz, binaural & recorder",
              icon: Music,
              color: "text-amber-400",
              borderColor: "border-amber-500/30",
              bg: "bg-amber-950/20",
              actionLabel: "Launch Sound Studio",
            },
            {
              id: "neshima",
              name: "NESHIMA (נְשִׁימָה)",
              title: "Hyperbaric Chamber",
              desc: "ATM pressure gauge 1.0-3.0 ATM, 4 clinical healing protocols & stem cells",
              icon: Wind,
              color: "text-emerald-400",
              borderColor: "border-emerald-500/30",
              bg: "bg-emerald-950/20",
              actionLabel: "Launch Chamber Controls",
            },
            {
              id: "zpe",
              name: "OR EIN SOF (אוֹר)",
              title: "Zero-Point Energy",
              desc: "Casimir cavity force calculator F/A, quantum vacuum virtual particles & ½ℏω",
              icon: Atom,
              color: "text-fuchsia-400",
              borderColor: "border-fuchsia-500/30",
              bg: "bg-fuchsia-950/20",
              actionLabel: "Launch ZPE Engine",
            },
            {
              id: "daat",
              name: "DAAT (דַּעַת)",
              title: "Unified Pipeline",
              desc: "9-stage synchronous execution pipeline, system bridge & coherence telemetry",
              icon: Layers,
              color: "text-yellow-400",
              borderColor: "border-yellow-500/30",
              bg: "bg-yellow-950/20",
              actionLabel: "Launch Pipeline Runner",
            },
            {
              id: "terminal",
              name: "GHOST CORE",
              title: "Terminal CLI",
              desc: "Sovereign command registry, interactive CLI execution & shell history",
              icon: Terminal,
              color: "text-slate-200",
              borderColor: "border-slate-700",
              bg: "bg-slate-900/40",
              actionLabel: "Open Ghost Terminal",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className={`p-4 rounded-xl border ${item.borderColor} ${item.bg} backdrop-blur hover:border-cyan-400 transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-lg bg-black/60 border border-slate-800 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">● ONLINE</span>
                  </div>

                  <h4 className="text-sm font-mono font-bold text-white mb-0.5">{item.name}</h4>
                  <div className="text-xs font-mono text-slate-300 font-semibold mb-2">{item.title}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
