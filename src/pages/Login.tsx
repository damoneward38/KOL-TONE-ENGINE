"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, 
  Lock, 
  Mail, 
  User, 
  Key, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Cpu,
  Zap,
  Layers
} from "lucide-react";
import { useAuth, PlanTier } from "@/src/context/AuthContext";

export default function Login() {
  const [tab, setTab] = useState<"signin" | "register" | "quickpass">("signin");
  const { login, loginAsSovereign, register, user } = useAuth();
  const navigate = useNavigate();

  // Sign In State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regTier, setRegTier] = useState<PlanTier>("pro");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate session.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(regName, regEmail, regPassword, regTier);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPassSovereign = () => {
    loginAsSovereign();
    navigate("/dashboard");
  };

  const handleQuickPassExplorer = async () => {
    await register("Guest Explorer", "explorer@ghostcore.io", "demo", "free");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 relative flex flex-col justify-between">
      {/* Background Ambience */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} 
      />

      {/* Top Bar */}
      <header className="relative z-10 h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all">
            <Crown size={22} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">GHOST CORE</span>
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest block uppercase font-bold">
              Identity & Access Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
            Pricing Tiers
          </Link>
          <Link to="/dashboard" className="text-cyan-400 hover:underline">
            Console Demo →
          </Link>
        </div>
      </header>

      {/* Main Authentication Box */}
      <main className="relative z-10 max-w-md mx-auto w-full px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-[#0a1329] to-[#040817] border border-cyan-500/30 rounded-3xl p-8 shadow-2xl shadow-cyan-950/60 relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Portal Title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/10">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Sovereign Authentication</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Access the 8 unified EMET engines & neural weights
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 border border-white/10 rounded-2xl mb-6 text-xs font-mono">
            <button
              onClick={() => { setTab("signin"); setError(null); }}
              className={`py-2 rounded-xl transition-all cursor-pointer font-bold ${
                tab === "signin" ? "bg-white text-black shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("register"); setError(null); }}
              className={`py-2 rounded-xl transition-all cursor-pointer font-bold ${
                tab === "register" ? "bg-white text-black shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setTab("quickpass"); setError(null); }}
              className={`py-2 rounded-xl transition-all cursor-pointer font-bold ${
                tab === "quickpass" ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-white"
              }`}
            >
              Quick Pass
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1.5 uppercase">
                  SOVEREIGN EMAIL / IDENTIFIER
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="damone.ward@ghostcore.io"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-400 block uppercase">
                    SECURITY CREDENTIAL / PASSKEY
                  </label>
                  <a href="#quickpass" onClick={() => setTab("quickpass")} className="text-[10px] font-mono text-cyan-400 hover:underline">
                    Use Passkey
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <Key size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Verifying Credentials..." : "Authenticate Session"}</span>
                <ArrowRight size={14} />
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="text-cyan-400 hover:underline font-bold"
                  >
                    Register here
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1.5 uppercase">
                  OPERATOR FULL NAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <User size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1.5 uppercase">
                  SOVEREIGN EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jane@researchlab.io"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-xs font-mono text-white focus:outline-none focus:border-cyan-400/50"
                  />
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1.5 uppercase">
                  DESIRED CLEARANCE TIER
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["free", "pro", "enterprise"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRegTier(t)}
                      className={`p-2.5 rounded-xl border text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        regTier === t
                          ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {t === "free" ? "Explorer" : t === "pro" ? "Practitioner" : "Sovereign"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Creating Account..." : "Create Account & Enter Console"}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* TAB 3: QUICK-PASS */}
          {tab === "quickpass" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Instantly switch roles and clearance levels to test both the sovereign unlocked experience and free locked paywalls:
              </p>

              {/* Damone Ward Pass */}
              <div 
                onClick={handleQuickPassSovereign}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/60 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                      <Crown size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        Damone Ward (Root Sovereign)
                      </h4>
                      <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">
                        Clearance: SOVEREIGN (100% Unlocked)
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Full administrative access to EMET 1-Click Master Unification, DAAT 9-stage pipeline, and all 8 engines.
                </p>
              </div>

              {/* Guest Explorer Pass */}
              <div 
                onClick={handleQuickPassExplorer}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Guest Explorer (Free Tier)
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                        Clearance: EXPLORER (Paywalls Active)
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Test feature gates, paywall modal alerts, and seamless upgrade triggers across the platform.
                </p>
              </div>
            </div>
          )}

          {/* Cryptographic Security Stamp */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
            <ShieldCheck size={12} className="text-cyan-400" />
            <span>Zero-Knowledge Sovereign Identity Protocol</span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5 text-center text-xs text-slate-500 font-mono">
        GHOST CORE OS v2.4 • EMET PLATFORM • ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
