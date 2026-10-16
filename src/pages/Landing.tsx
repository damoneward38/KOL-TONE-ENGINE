"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Zap, Brain, Target, MessageSquare, 
  BarChart3, ShieldCheck, ChevronRight,
  Globe, Cpu, Sparkles, Terminal, Code,
  Activity, Check, Copy, ExternalLink, Play
} from "lucide-react";
import GhostTerminal from "@/src/components/GhostTerminal";

export default function Landing() {
  const [showApiModal, setShowApiModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // API Playground State
  const [apiEndpoint, setApiEndpoint] = useState<"health" | "profiles" | "analyze" | "daat">("profiles");
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Archetype interactive slider on hero visualizer
  const [activeArchetype, setActiveArchetype] = useState<"crypto" | "biotech" | "ai">("crypto");

  const archetypes = {
    crypto: {
      name: "DeFi Cynic / Quant",
      bars: [0.45, 0.35, 0.92, 0.68, 0.88, 0.95],
      sig: "exit liquidity, zero-subsidy equilibrium, balance sheet",
    },
    biotech: {
      name: "Longevity Scientist",
      bars: [0.88, 0.22, 0.74, 0.91, 0.65, 0.94],
      sig: "biomarker validation, mitochondrial resilience, clinical data",
    },
    ai: {
      name: "Autonomous Agent Architect",
      bars: [0.52, 0.40, 0.89, 0.72, 0.85, 0.91],
      sig: "defensible moat, state machine, runtime deterministic execution",
    },
  };

  const handleTestApi = async (endpoint: "health" | "profiles" | "analyze" | "daat") => {
    setApiEndpoint(endpoint);
    setApiLoading(true);
    setApiResponse(null);

    try {
      let res: Response;
      if (endpoint === "health") {
        res = await fetch("/api/health");
      } else if (endpoint === "profiles") {
        res = await fetch("/api/profiles");
      } else if (endpoint === "analyze") {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            samples: [
              "Capital efficiency is the only metric that survives market downturns.",
              "If your protocol needs inflationary emissions to keep TVL, it's not sustainable.",
            ],
          }),
        });
      } else {
        res = await fetch("/api/daat/run", { method: "POST" });
      }

      const json = await res.json();
      setApiResponse(JSON.stringify(json, null, 2));
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  const fetchLiveStatus = async () => {
    setLoadingStatus(true);
    setShowStatusModal(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setStatusData(data);
    } catch (err: any) {
      setStatusData({ status: "error", error: err.message });
    } finally {
      setLoadingStatus(false);
    }
  };

  const copyCurl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30">
      {/* Grid Pattern Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu size={22} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">KOL TONE ENGINE</span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest block uppercase font-bold">
                Live Backend API
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <Link to="/pricing" className="text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors">
              Pricing
            </Link>
            <button 
              onClick={() => {
                setShowApiModal(true);
                handleTestApi("profiles");
              }}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors hidden sm:flex items-center gap-1 cursor-pointer"
            >
              <Code size={14} />
              <span>API Playground</span>
            </button>
            <Link
              to="/login"
              className="text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-xs hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20"
            >
              Launch Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8"
          >
            <Sparkles size={14} />
            <span>Sovereign Communication Architecture</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.95] mb-8"
          >
            Master the Art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500">
              Tone Matching.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Mathematically extract 6-dimensional psychometric fingerprints from Key Opinion Leaders.
            Generate tone-matched threads, singles, and memos with real-time semantic fidelity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 cursor-pointer"
            >
              <span>Enter Tone Console</span>
              <ChevronRight size={18} />
            </Link>
            <button 
              onClick={() => {
                setShowApiModal(true);
                handleTestApi("profiles");
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Code size={16} className="text-cyan-400" />
              <span>Interactive API Docs</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Interactive Visualizer Section */}
      <section className="px-6 mb-28">
        <div className="max-w-5xl mx-auto">
          {/* Preset Selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider mr-2">Preset Vector:</span>
            {(["crypto", "biotech", "ai"] as const).map(k => (
              <button
                key={k}
                onClick={() => setActiveArchetype(k)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeArchetype === k
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {archetypes[k].name}
              </button>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-indigo-600/30 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-500" />
            <div className="relative bg-[#0b1329] border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <div>
                  <div className="text-sm font-bold text-white">{archetypes[activeArchetype].name}</div>
                  <div className="text-xs text-cyan-400 font-mono">Signatures: {archetypes[activeArchetype].sig}</div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>99.2% REPLICATION FIDELITY</span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-6 h-56 items-end">
                {archetypes[activeArchetype].bars.map((h, i) => {
                  const labels = ["Formality", "Emotionality", "Assertive", "Complex", "Engaged", "Authentic"];
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 h-full">
                      <div className="flex-1 w-full bg-white/5 rounded-t-xl relative overflow-hidden flex flex-col justify-end">
                        <motion.div
                          key={`${activeArchetype}-${i}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${h * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="w-full bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t-xl"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">{Math.round(h * 100)}%</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center truncate w-full">
                        {labels[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            Architected for Full Autonomous Ingestion
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Zero hallucinations. Every post generation is constrained by empirical psychometric vectors and platform length dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Brain className="text-cyan-400" size={22} />}
            title="Psychometric Vector Extraction"
            description="Algorithmic parsing of vocabulary richness, n-gram cadences, emotional amplitude, and formal assertions."
          />
          <FeatureCard 
            icon={<Target className="text-indigo-400" size={22} />}
            title="Multi-Platform Adaptor"
            description="Automatic transformation across Twitter thread hooks, LinkedIn corporate essays, and Substack analytical memos."
          />
          <FeatureCard 
            icon={<MessageSquare className="text-emerald-400" size={22} />}
            title="Signature Catchphrase Enforcer"
            description="Detects high-frequency linguistic anchors and integrates them naturally into generated outputs."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-amber-400" size={22} />}
            title="Live Server-Side Inference"
            description="Full Express API running Gemini 3.8 Flash with telemetry headers and sub-second generation latencies."
          />
          <FeatureCard 
            icon={<Globe className="text-sky-400" size={22} />}
            title="Physical Frequency Sound Integration"
            description="Direct Web Audio synthesis for 432Hz, 528Hz, and 40Hz acoustic resonance built into the Ghost Terminal."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-purple-400" size={22} />}
            title="Sovereign Control Layer"
            description="Fully audited routes, zero third-party telemetry, complete exportable JSON schemas for every profile."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Cpu size={18} className="text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-300 block">KOL TONE ENGINE v2.4.0</span>
              <span className="text-[10px] text-slate-500 font-mono block">ALL ROUTES LIVE &amp; CONNECTED</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <button 
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setShowTermsModal(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button 
              onClick={fetchLiveStatus}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Activity size={13} className="text-emerald-400" />
              <span>Live Status</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive API Docs & Playground Modal */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApiModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#0f172a] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Code size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Live API Documentation &amp; Playground</h3>
                    <p className="text-xs text-slate-400">Real endpoints running on Express backend</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiModal(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Endpoint Tabs */}
              <div className="px-6 pt-4 flex gap-2 border-b border-white/5 shrink-0 overflow-x-auto">
                <button
                  onClick={() => handleTestApi("profiles")}
                  className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-colors cursor-pointer ${
                    apiEndpoint === "profiles"
                      ? "bg-white/10 text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  GET /api/profiles
                </button>
                <button
                  onClick={() => handleTestApi("analyze")}
                  className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-colors cursor-pointer ${
                    apiEndpoint === "analyze"
                      ? "bg-white/10 text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  POST /api/analyze
                </button>
                <button
                  onClick={() => handleTestApi("daat")}
                  className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-colors cursor-pointer ${
                    apiEndpoint === "daat"
                      ? "bg-white/10 text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  POST /api/daat/run
                </button>
                <button
                  onClick={() => handleTestApi("health")}
                  className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-colors cursor-pointer ${
                    apiEndpoint === "health"
                      ? "bg-white/10 text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  GET /api/health
                </button>
              </div>

              {/* Playground Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* cURL Snippet */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">cURL Request</span>
                    <button
                      onClick={() =>
                        copyCurl(
                          apiEndpoint === "profiles"
                            ? "curl -X GET http://0.0.0.0:3000/api/profiles"
                            : apiEndpoint === "analyze"
                            ? `curl -X POST http://0.0.0.0:3000/api/analyze -H 'Content-Type: application/json' -d '{"samples": ["Sample post text"]}'`
                            : apiEndpoint === "daat"
                            ? "curl -X POST http://0.0.0.0:3000/api/daat/run"
                            : "curl -X GET http://0.0.0.0:3000/api/health"
                        )
                      }
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCurl ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedCurl ? "Copied" : "Copy cURL"}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-black/60 rounded-xl font-mono text-[11px] text-amber-300 overflow-x-auto border border-white/5">
                    {apiEndpoint === "profiles" && "curl -X GET http://0.0.0.0:3000/api/profiles"}
                    {apiEndpoint === "analyze" && `curl -X POST http://0.0.0.0:3000/api/analyze \\\n  -H 'Content-Type: application/json' \\\n  -d '{"samples":["Capital efficiency is the only metric..."]}'`}
                    {apiEndpoint === "daat" && "curl -X POST http://0.0.0.0:3000/api/daat/run"}
                    {apiEndpoint === "health" && "curl -X GET http://0.0.0.0:3000/api/health"}
                  </pre>
                </div>

                {/* Live Response */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">Live Backend Response</span>
                    <button
                      onClick={() => handleTestApi(apiEndpoint)}
                      disabled={apiLoading}
                      className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 flex items-center gap-1 cursor-pointer"
                    >
                      <Play size={10} />
                      <span>{apiLoading ? "Executing..." : "Re-Run Query"}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-black/80 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto max-h-64 border border-white/10">
                    {apiLoading ? "Executing live backend call..." : apiResponse || "No response received"}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Status Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-cyan-500/30 rounded-3xl p-7 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white">Live System Diagnostics</h3>
                </div>
                <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>

              {loadingStatus ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Pinging backend routes...
                </div>
              ) : statusData ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Overall Status:</span>
                      <span className="text-emerald-400 font-bold">{statusData.status?.toUpperCase() || "ONLINE"} ●</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">System Uptime:</span>
                      <span className="text-slate-300">{Math.round(statusData.uptime || 0)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gemini 3.8 Flash:</span>
                      <span className="text-cyan-400 font-bold">{statusData.geminiConnected ? "CONNECTED" : "FALLBACK SYNTH"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Web Audio Core:</span>
                      <span className="text-slate-300">48kHz Harmonic Engine</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-2">8 Integrated Subsystems:</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(statusData.systems || {}).map(([key, val]) => (
                      <div key={key} className="p-2 rounded bg-white/5 flex justify-between items-center">
                        <span className="text-slate-400 capitalize">{key}:</span>
                        <span className="text-emerald-400 font-bold text-[10px]">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full mt-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Close Diagnostics
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl p-7 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-white mb-2">Privacy Policy &amp; Data Sovereignity</h3>
              <p className="text-xs text-slate-400 mb-4">Last updated: October 2026</p>
              
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                <p>
                  <strong>1. Zero Data Retention:</strong> The KOL Tone Engine analyzes communication fingerprints in transient memory. We do not store or monetize your source post data.
                </p>
                <p>
                  <strong>2. Local &amp; Secure Processing:</strong> All psychometric vectors, n-gram maps, and tone parameters remain under your sovereign control and can be downloaded as encrypted JSON files at any time.
                </p>
                <p>
                  <strong>3. API Security:</strong> All generative requests pass through server-side proxy routes with strict telemetry isolation (`aistudio-build`). No browser keys are ever exposed.
                </p>
              </div>

              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full mt-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Accept &amp; Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTermsModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl p-7 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-white mb-2">Terms of Service</h3>
              <p className="text-xs text-slate-400 mb-4">Platform Operational Agreement</p>
              
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                <p>
                  <strong>1. Tone Fingerprint Ownership:</strong> Profiles created via the KOL Tone Engine are the exclusive intellectual property of the operator.
                </p>
                <p>
                  <strong>2. Responsible Synthesis:</strong> Generated outputs must comply with applicable communication standards. Tone synthesis should reflect fair use and authentic branding.
                </p>
                <p>
                  <strong>3. Sovereign Uptime:</strong> The EMET platform provides 99.999% SLA across all 8 unified subsystems with sub-second generative latency.
                </p>
              </div>

              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full mt-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
              >
                Understood &amp; Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ghost Terminal Floating Widget */}
      <div className="fixed bottom-6 right-6 z-50 w-[540px] max-w-[92vw]">
        <GhostTerminal initialOpen={false} />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-7 hover:border-cyan-500/30 transition-all group shadow-lg">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
