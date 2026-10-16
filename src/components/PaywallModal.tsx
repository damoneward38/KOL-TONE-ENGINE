"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Lock, 
  Sparkles, 
  Check, 
  X, 
  Crown, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Cpu
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export default function PaywallModal() {
  const { paywallModal, closePaywall, upgradeTier, user } = useAuth();
  const navigate = useNavigate();

  if (!paywallModal.isOpen) return null;

  const isEnterpriseReq = paywallModal.requiredTier === "enterprise";
  const planName = isEnterpriseReq ? "Emet Sovereign Enterprise" : "Sovereign Practitioner Pro";
  const planPrice = isEnterpriseReq ? "$299" : "$99";
  const planKey = isEnterpriseReq ? "enterprise" : "pro";

  const handleGoToCheckout = () => {
    closePaywall();
    navigate(`/checkout?plan=${planKey}`);
  };

  const handleInstantDemoUnlock = () => {
    upgradeTier(planKey);
    closePaywall();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePaywall}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#070d1e] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closePaywall}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer z-10"
          >
            <X size={16} />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
              isEnterpriseReq 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10" 
                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-cyan-500/10"
            }`}>
              <Lock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isEnterpriseReq 
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" 
                    : "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                }`}>
                  {isEnterpriseReq ? "Enterprise Sovereign Only" : "Pro Tier Feature"}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Current: <strong className="text-white uppercase">{user?.tier || "Explorer"}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {paywallModal.featureName}
              </h2>
            </div>
          </div>

          {/* Feature explanation */}
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
            {paywallModal.reason}
          </p>

          {/* What Unlocks Section */}
          <div className="mb-6 space-y-2.5 bg-slate-950/60 border border-white/10 rounded-2xl p-4">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Unlocks with {planName}:</span>
            </div>
            
            <ul className="text-xs text-slate-300 space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Full access to <strong>{paywallModal.featureName}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{isEnterpriseReq ? "1-Click EMET Master Unification & Cross-Node Synchrony" : "8 Ayin Spectrums, 8-Channel EEG BCI, and Hyperbaric Chamber"}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{isEnterpriseReq ? "Zero-Latency Priority Gemini 3.8 Flash Neural Pipeline" : "Web Audio Synthesizer Studio with live Recording & Download"}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Cryptographic Sovereign License Certificate</span>
              </li>
            </ul>
          </div>

          {/* Price & Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{planPrice}</span>
                <span className="text-xs text-slate-400 font-mono">/month</span>
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">Cancel or change anytime</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleGoToCheckout}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <span>Upgrade to {isEnterpriseReq ? "Enterprise" : "Pro"}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Demo Tester Quick Bypass */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Development / Reviewer Quick-Pass:</span>
            <button
              onClick={handleInstantDemoUnlock}
              className="text-cyan-400 hover:text-cyan-300 underline font-mono text-[10px] cursor-pointer"
            >
              Instant Test Unlock ({planKey.toUpperCase()})
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
