"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Check, 
  X, 
  Sparkles, 
  Crown, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Eye, 
  Brain, 
  Music, 
  Wind, 
  Atom, 
  Layers, 
  ArrowRight,
  HelpCircle,
  Lock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth, PlanTier } from "@/src/context/AuthContext";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      id: "free" as PlanTier,
      name: "Explorer Genesis",
      hebrew: "בְּרֵאשִׁית",
      badge: "Free Trial / Starter",
      tagline: "For individual biohackers, acoustic researchers, and curious technologists.",
      monthlyPrice: 29,
      annualPrice: 24,
      isTrial: true,
      features: [
        { name: "3 KOL Stylometry Profiles & Tone Match", included: true },
        { name: "Ayin Spectrum: Visible & Night Optical", included: true },
        { name: "Kol Synthesizer: 4 Sacred Frequencies", included: true },
        { name: "Ruach AI: 100 queries/month", included: true },
        { name: "Ghost Core Terminal CLI view", included: true },
        { name: "8-Channel EEG Neural BCI Telemetry", included: false },
        { name: "All 8 Ayin Spectrums (X-Ray, mmWave, Thermal)", included: false },
        { name: "Real-time Web Audio Recording & Download", included: false },
        { name: "Neshima Hyperbaric Healing Protocols", included: false },
        { name: "Or Ein Sof Casimir ZPE Calculator", included: false },
        { name: "DAAT 9-Stage Sovereign Cross-System Pipeline", included: false },
        { name: "EMET 1-Click Master Unification Override", included: false },
      ],
      cta: "Get Started Free",
      color: "border-slate-800 bg-slate-900/40",
      highlight: false,
    },
    {
      id: "pro" as PlanTier,
      name: "Sovereign Practitioner",
      hebrew: "חָכְמָה",
      badge: "MOST POPULAR",
      tagline: "Full clinical, neural, and quantum-acoustic research workstation.",
      monthlyPrice: 99,
      annualPrice: 79,
      isTrial: false,
      features: [
        { name: "Unlimited KOL Profiles & Vector JSON Export", included: true },
        { name: "All 8 Ayin Spectrum Modes + Dual Combiner", included: true },
        { name: "Nesher 8-Channel Neural BCI & Brainwave Entrainment", included: true },
        { name: "Kol Studio: Full Tone Synth & Web Audio Recording", included: true },
        { name: "Ruach Autonomous Agent (Speech Mic + Neural Voice)", included: true },
        { name: "Neshima Hyperbaric Chamber Simulation (4 Protocols)", included: true },
        { name: "Or Ein Sof Quantum Vacuum & Casimir Force Engine", included: true },
        { name: "Ghost Core Full Autonomous CLI Command Registry", included: true },
        { name: "Export raw vector schemas & scientific data", included: true },
        { name: "DAAT 9-Stage Sovereign Cross-System Pipeline", included: false, note: "Enterprise only" },
        { name: "EMET 1-Click Master Sovereign Unification", included: false, note: "Enterprise only" },
        { name: "Sovereign Root Clearance (DAMONE_WARD)", included: false, note: "Enterprise only" },
      ],
      cta: "Activate Practitioner Access",
      color: "border-cyan-500/60 bg-gradient-to-b from-cyan-950/40 via-[#071329] to-[#040817] shadow-xl shadow-cyan-500/10",
      highlight: true,
    },
    {
      id: "enterprise" as PlanTier,
      name: "Emet Sovereign Enterprise",
      hebrew: "אֱמֶת",
      badge: "DAMONE WARD CLEARANCE",
      tagline: "Total cross-system unification for sovereign institutions and lab directors.",
      monthlyPrice: 299,
      annualPrice: 239,
      isTrial: false,
      features: [
        { name: "EVERYTHING in Sovereign Practitioner", included: true },
        { name: "EMET 1-Click Master Sovereign Unification", included: true },
        { name: "DAAT 9-Stage Autonomous Cross-System Pipeline Execution", included: true },
        { name: "Sovereign Administrator Clearance (DAMONE_WARD Level)", included: true },
        { name: "High-Frequency Casimir & Quantum Vacuum Calculations", included: true },
        { name: "Dedicated Server-Side Gemini 3.8 Flash Neural Priority", included: true },
        { name: "REST API Webhooks & Direct WebSocket Telemetry Stream", included: true },
        { name: "Cryptographic Multi-Device License Token", included: true },
        { name: "Zero Rate Limits on Sound Recording & Generation", included: true },
        { name: "Custom Solfeggio & Bioharmonic Frequencies Calibration", included: true },
        { name: "Direct Sovereign Concierge & Lab Integration Support", included: true },
      ],
      cta: "Claim Sovereign Clearance",
      color: "border-amber-500/40 bg-gradient-to-b from-amber-950/30 via-[#111122] to-[#06060c] shadow-xl shadow-amber-500/10",
      highlight: false,
    },
  ];

  const faqs = [
    {
      q: "What makes the Ghost Core & EMET Platform unique?",
      a: "Ghost Core unifies eight previously isolated scientific and sensory domains into a single sovereign cognitive architecture: Stylometric Tone Matching (KOL), Multi-Spectral Optic Fusion (Ayin), 8-Channel Neural BCI (Nesher), Autonomous AI (Ruach), Precision Acoustic Synthesis (Kol), Hyperbaric Pressure Regulation (Neshima), Zero-Point Energy Quantum Calculations (Or Ein Sof), and the 9-Stage Unified Data Pipeline (Daat)."
    },
    {
      q: "Can I test the platform before committing?",
      a: "Yes! The Explorer Genesis plan gives you immediate access to standard features. You can also use coupon codes such as 'SOVEREIGN' or 'EMET100' during checkout for 100% complimentary evaluation clearance."
    },
    {
      q: "How does the real-time tone and audio recording work?",
      a: "Kol utilizes the client-side Web Audio API with zero audio latency (48,000 Hz sample rate), native AnalyserNode oscilloscopes, and real-time MediaRecorder capturing straight to high-fidelity WebM audio files."
    },
    {
      q: "What is the difference between Pro and Sovereign Enterprise?",
      a: "Pro gives you unrestricted individual access to all 8 specialized engines (including high-res EEG and Casimir equations). Sovereign Enterprise unlocks the master cross-node unifying bridge: DAAT 9-stage pipeline execution, EMET 1-click global override, and DAMONE_WARD level root clearance."
    },
    {
      q: "Can I cancel or switch plans at any time?",
      a: "Yes, you have complete sovereignty over your subscription. Switch between tiers or cancel anytime with one click in your console profile."
    }
  ];

  const handleSelectPlan = (planId: PlanTier) => {
    navigate(`/checkout?plan=${planId}&cycle=${billingCycle}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 relative pb-24">
      {/* Background Ambience */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 h-20 border-b border-white/5 bg-[#020617]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all">
                <Crown size={22} className="text-white" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block">GHOST CORE</span>
                <span className="text-[10px] text-cyan-400 font-mono tracking-widest block uppercase font-bold">
                  Sovereign License Tiers
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Console
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-white transition-all"
            >
              {user ? `User: ${user.name.split(" ")[0]}` : "Sign In"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto pt-16 pb-12 px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase mb-6"
        >
          <Sparkles size={14} />
          <span>Sovereign Access Architecture</span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4">
          Fair, Accessible Pricing for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            Next-Generation Technology.
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Gain full sovereign access to the 8 EMET unified engines: Stylometry, Spectrum Vision, 
          Neural BCI, Sound Synthesis, Hyperbaric telemetry, and Zero-Point Energy.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 mb-20">
        {plans.map((p, idx) => {
          const isCurrentPlan = user?.tier === p.id;
          const displayPrice = billingCycle === "monthly" ? p.monthlyPrice : p.annualPrice;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-3xl p-8 border flex flex-col justify-between transition-all ${p.color}`}
            >
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-[10px] tracking-widest uppercase shadow-lg shadow-cyan-500/30 flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>{p.badge}</span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{p.hebrew}</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{p.name}</h3>
                  </div>
                  {!p.highlight && (
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 uppercase">
                      {p.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-6 min-h-[36px]">{p.tagline}</p>

                {/* Price Display */}
                <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">${displayPrice}</span>
                    <span className="text-xs text-slate-400 font-mono">/month</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {billingCycle === "annual" ? `Billed annually ($${displayPrice * 12}/yr)` : "Billed monthly"}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                    Core Capabilities:
                  </div>
                  <ul className="space-y-2.5 text-xs">
                    {p.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        {feat.included ? (
                          <Check size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                        ) : (
                          <Lock size={14} className="text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={feat.included ? "text-slate-200" : "text-slate-500 line-through"}>
                          {feat.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => handleSelectPlan(p.id)}
                  className={`w-full py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    p.highlight
                      ? "bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 shadow-cyan-500/25"
                      : "bg-white/10 hover:bg-white/20 border border-white/15 text-white"
                  }`}
                >
                  <span>{isCurrentPlan ? "Active Clearance (Reconfigure)" : p.cta}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="max-w-6xl mx-auto px-6 mb-24 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
            Detailed Node & Engine Comparison
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Every feature mapped to its clearance authorization tier
          </p>
        </div>

        <div className="border border-white/10 rounded-3xl overflow-hidden bg-slate-950/60 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 font-mono font-bold text-slate-300">SYSTEM / CAPABILITY</th>
                  <th className="p-4 font-mono font-bold text-center text-slate-300">EXPLORER ($29)</th>
                  <th className="p-4 font-mono font-bold text-center text-cyan-400">PRACTITIONER ($99)</th>
                  <th className="p-4 font-mono font-bold text-center text-amber-400">SOVEREIGN ($299)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                <tr>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <Cpu size={14} className="text-cyan-400" />
                    <span>Stylometry & KOL Tone Matching</span>
                  </td>
                  <td className="p-4 text-center text-slate-300">3 Profiles</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Unlimited</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <Eye size={14} className="text-cyan-400" />
                    <span>Ayin Spectrum Optical Modes</span>
                  </td>
                  <td className="p-4 text-center text-slate-400">Visible + Night</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">All 8 Spectrums</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">All 8 + Dual Combiner</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <Brain size={14} className="text-cyan-400" />
                    <span>Nesher 8-Channel Neural BCI</span>
                  </td>
                  <td className="p-4 text-center text-slate-600">—</td>
                  <td className="p-4 text-center text-emerald-400">5 Bands + Entrain</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Full Deep BCI + Raw CSV</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <Music size={14} className="text-cyan-400" />
                    <span>Kol Tone Synth & Real-time Web Audio Recording</span>
                  </td>
                  <td className="p-4 text-center text-slate-400">Basic Presets</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Full Studio + WebM Record</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Full Studio + WebM Record</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <Wind size={14} className="text-cyan-400" />
                    <span>Neshima Hyperbaric Protocol Simulation</span>
                  </td>
                  <td className="p-4 text-center text-slate-600">—</td>
                  <td className="p-4 text-center text-emerald-400">4 Healing Protocols</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">Custom ATM + O2 Profiles</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <Atom size={14} className="text-cyan-400" />
                    <span>Or Ein Sof Casimir ZPE Calculator</span>
                  </td>
                  <td className="p-4 text-center text-slate-600">—</td>
                  <td className="p-4 text-center text-emerald-400">Quantum Vacuum Live</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">High Precision Nanometer</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <Layers size={14} className="text-cyan-400" />
                    <span>DAAT 9-Stage Sovereign Cross-System Pipeline</span>
                  </td>
                  <td className="p-4 text-center text-slate-600">—</td>
                  <td className="p-4 text-center text-slate-600">—</td>
                  <td className="p-4 text-center text-amber-400 font-bold">1-Click Full Pipeline</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <Crown size={14} className="text-amber-400" />
                    <span>EMET Sovereign 1-Click Master Override</span>
                  </td>
                  <td className="p-4 text-center text-slate-600">—</td>
                  <td className="p-4 text-center text-slate-600">—</td>
                  <td className="p-4 text-center text-amber-400 font-bold">Full Root Sovereign</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Everything you need to know about access, subscriptions, and cryptography
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, fIdx) => {
            const isOpen = openFaq === fIdx;
            return (
              <div 
                key={fIdx}
                className="border border-white/10 rounded-2xl bg-slate-950/40 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="text-cyan-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
