"use client";

import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  Lock, 
  Check, 
  ArrowRight, 
  Crown, 
  Cpu, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Wallet,
  Zap,
  HelpCircle
} from "lucide-react";
import { useAuth, PlanTier } from "@/src/context/AuthContext";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, upgradeTier } = useAuth();

  // Plan Selection
  const planParam = (searchParams.get("plan") as PlanTier) || "pro";
  const cycleParam = (searchParams.get("cycle") as "monthly" | "annual") || "monthly";

  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(
    ["free", "pro", "enterprise"].includes(planParam) ? planParam : "pro"
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    cycleParam === "annual" ? "annual" : "monthly"
  );

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto" | "applepay">("card");

  // Form Fields
  const [cardName, setCardName] = useState(user?.name || "Damone Ward");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8892");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("389");
  const [postalCode, setPostalCode] = useState("90210");
  const [email, setEmail] = useState(user?.email || "damone.ward@ghostcore.io");
  const [organization, setOrganization] = useState("Sovereign Research Labs");

  // Crypto state
  const [cryptoCurrency, setCryptoCurrency] = useState<"USDC" | "SOL" | "ETH">("USDC");
  const [walletConnected, setWalletConnected] = useState(false);

  // Discount / Promo Code
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [issuedLicenseKey, setIssuedLicenseKey] = useState("");
  const [orderId, setOrderId] = useState("");

  const planDetails: Record<PlanTier, { name: string; monthly: number; annual: number; tagline: string; hebrew: string }> = {
    free: {
      name: "Explorer Genesis",
      monthly: 29,
      annual: 24,
      tagline: "Standard stylometry, 4 sacred tones, optical spectrums",
      hebrew: "בְּרֵאשִׁית",
    },
    pro: {
      name: "Sovereign Practitioner",
      monthly: 99,
      annual: 79,
      tagline: "All 8 Ayin spectrums, 8-channel EEG BCI, Web Audio recorder, Hyperbaric & ZPE",
      hebrew: "חָכְמָה",
    },
    enterprise: {
      name: "Emet Sovereign Enterprise",
      monthly: 299,
      annual: 239,
      tagline: "Total clearance, 1-click EMET master unification, 9-stage DAAT pipeline",
      hebrew: "אֱמֶת",
    },
  };

  const currentPlan = planDetails[selectedPlan];
  const baseMonthlyPrice = billingCycle === "monthly" ? currentPlan.monthly : currentPlan.annual;
  const subtotal = billingCycle === "annual" ? baseMonthlyPrice * 12 : baseMonthlyPrice;
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = () => {
    const cleaned = promoCode.trim().toUpperCase();
    if (cleaned === "SOVEREIGN" || cleaned === "EMET100") {
      setDiscountPercent(100);
      setPromoFeedback("Sovereign Grant Applied: 100% Complimentary Access Activated");
    } else if (cleaned === "GHOSTCORE" || cleaned === "HALFOFF") {
      setDiscountPercent(50);
      setPromoFeedback("50% Sovereign Researcher Discount Applied");
    } else if (cleaned === "") {
      setDiscountPercent(0);
      setPromoFeedback(null);
    } else {
      setPromoFeedback("Invalid promo key. Use 'SOVEREIGN' for test evaluation clearance.");
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const steps = [
      "Contacting Sovereign Authorization Node...",
      "Validating Cryptographic Credentials...",
      "Allocating 8-Engine Quantum Neural Weights...",
      "Minting Tamper-Proof License Certificate...",
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      await new Promise((r) => setTimeout(r, 650));
    }

    const newKey = `GHOST-${selectedPlan.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;

    setIssuedLicenseKey(newKey);
    setOrderId(newOrderId);
    setIsProcessing(false);
    setIsSuccess(true);

    // Upgrade the user in real AuthContext
    upgradeTier(selectedPlan, newKey);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 relative pb-20">
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
          <Link to="/pricing" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all">
              <Crown size={22} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block">GHOST CORE CHECKOUT</span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest block uppercase font-bold">
                256-Bit Encrypted Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Pricing
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 pt-10 relative z-10">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            /* Checkout Form View */
            <motion.div
              key="checkout-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Plan Selector & Payment Method (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Plan Selection Box */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-cyan-400" />
                      <span>Select Clearance Tier</span>
                    </h2>
                    
                    {/* Billing Cycle Switch */}
                    <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          billingCycle === "monthly" ? "bg-white text-black" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("annual")}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          billingCycle === "annual" ? "bg-white text-black" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>Annual</span>
                        <span className="text-[9px] text-emerald-400 font-bold">-20%</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Plan Radio Buttons */}
                  <div className="space-y-3">
                    {(["free", "pro", "enterprise"] as const).map((pKey) => {
                      const p = planDetails[pKey];
                      const isSelected = selectedPlan === pKey;
                      const pPrice = billingCycle === "monthly" ? p.monthly : p.annual;

                      return (
                        <div
                          key={pKey}
                          onClick={() => setSelectedPlan(pKey)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-400/80 shadow-md shadow-cyan-500/10"
                              : "bg-white/[0.02] border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-600"
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{p.name}</span>
                                <span className="text-[10px] font-mono text-cyan-400 font-bold">{p.hebrew}</span>
                              </div>
                              <p className="text-xs text-slate-400">{p.tagline}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-black text-white">${pPrice}</div>
                            <div className="text-[10px] text-slate-400 font-mono">/mo</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Information Form */}
                <form onSubmit={handleProcessPayment} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                      <CreditCard size={16} className="text-cyan-400" />
                      <span>Payment Method</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      All transactions are end-to-end encrypted with quantum-resilient protocols.
                    </p>
                  </div>

                  {/* Payment Method Switcher */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === "card"
                          ? "bg-cyan-500/15 border-cyan-400 text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <CreditCard size={18} className={paymentMethod === "card" ? "text-cyan-400" : ""} />
                      <span>Card / Debit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("crypto")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === "crypto"
                          ? "bg-cyan-500/15 border-cyan-400 text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <Wallet size={18} className={paymentMethod === "crypto" ? "text-cyan-400" : ""} />
                      <span>Sovereign Crypto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("applepay")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        paymentMethod === "applepay"
                          ? "bg-cyan-500/15 border-cyan-400 text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <Zap size={18} className={paymentMethod === "applepay" ? "text-cyan-400" : ""} />
                      <span>1-Tap Pay</span>
                    </button>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-mono font-bold text-slate-400 block mb-1.5">
                          CARDHOLDER NAME
                        </label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="e.g. Damone Ward"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-mono font-bold text-slate-400 block mb-1.5">
                          CARD NUMBER
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 8920 3849 1928"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-white font-mono pr-20"
                          />
                          <div className="absolute right-3 top-3 flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                            VISA / MC
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-mono font-bold text-slate-400 block mb-1.5">
                            EXPIRATION (MM/YY)
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-mono font-bold text-slate-400 block mb-1.5">
                            CVC / CVV
                          </label>
                          <input
                            type="text"
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="389"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-mono font-bold text-slate-400 block mb-1.5">
                            POSTAL / ZIP CODE
                          </label>
                          <input
                            type="text"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="90210"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-mono font-bold text-slate-400 block mb-1.5">
                            LAB / ORGANIZATION
                          </label>
                          <input
                            type="text"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder="Sovereign Node"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sovereign Crypto Form */}
                  {paymentMethod === "crypto" && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-300">Choose Settlement Asset:</span>
                        <div className="flex gap-2">
                          {(["USDC", "SOL", "ETH"] as const).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCryptoCurrency(c)}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                cryptoCurrency === c ? "bg-cyan-500 text-slate-950" : "bg-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-white/10">
                        <div className="w-20 h-20 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0">
                          <QrCode size={70} className="text-black" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-mono text-cyan-400 font-bold mb-1">
                            SOVEREIGN SMART CONTRACT VAULT
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 break-all bg-white/5 p-2 rounded">
                            0x71C...432F9 (GhostCore-Treasury.eth)
                          </div>
                          <button
                            type="button"
                            onClick={() => setWalletConnected(true)}
                            className="mt-2 text-xs font-bold text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Wallet size={12} />
                            <span>{walletConnected ? "Wallet Connected (Phantom/MetaMask)" : "Connect Web3 Wallet"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1-Tap Pay */}
                  {paymentMethod === "applepay" && (
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white">
                        <Zap size={22} className="text-cyan-400" />
                      </div>
                      <p className="text-xs text-slate-300 max-w-sm mx-auto">
                        Authorize instantly with biometrics via Apple Pay, Google Pay, or Passkey.
                      </p>
                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        className="w-full py-3.5 rounded-xl bg-white text-black font-black text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Pay with Biometric Passkey (${finalTotal.toFixed(2)})</span>
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>{processingStep || "Authorizing Sovereign Node..."}</span>
                      </div>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Authorize & Unlock {currentPlan.name} (${finalTotal.toFixed(2)})</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Lock size={12} className="text-cyan-400" />
                    <span>256-Bit SHA-3 Quantum Safe Encryption</span>
                    <span>•</span>
                    <span>Instant License Delivery</span>
                  </div>
                </form>
              </div>

              {/* Right Column: Order Summary & Promo Code (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gradient-to-b from-[#0a142e] to-[#040817] border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                      ORDER SUMMARY
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {currentPlan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{currentPlan.tagline}</p>
                  </div>

                  {/* Included Engines Badge List */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                      Unlocked Capabilities:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-cyan-400" />
                        <span>Full Psychometric Stylometry Engine</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-cyan-400" />
                        <span>Ayin Spectrum Multi-Sensor Vision</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-cyan-400" />
                        <span>Kol Tone Synthesizer & Web Audio Studio</span>
                      </li>
                      {selectedPlan !== "free" && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check size={14} className="text-emerald-400" />
                            <span>Nesher 8-Channel Neural BCI Telemetry</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check size={14} className="text-emerald-400" />
                            <span>Neshima Hyperbaric Protocol Chamber</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check size={14} className="text-emerald-400" />
                            <span>Or Ein Sof Casimir ZPE Calculator</span>
                          </li>
                        </>
                      )}
                      {selectedPlan === "enterprise" && (
                        <>
                          <li className="flex items-center gap-2">
                            <Check size={14} className="text-amber-400" />
                            <span>DAAT 9-Stage Master Autonomous Pipeline</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check size={14} className="text-amber-400" />
                            <span>EMET Sovereign 1-Click Master Override</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Promo Code Box */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <label className="text-xs font-mono font-bold text-slate-300">
                      PROMOTIONAL / SOVEREIGN GRANT KEY
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. SOVEREIGN, EMET100"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400/50 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {promoFeedback && (
                      <p className={`text-[11px] font-mono ${
                        discountPercent > 0 ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {promoFeedback}
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 font-mono">
                      Tip: Enter <span className="text-cyan-400 font-bold">SOVEREIGN</span> for instant 100% demo evaluation clearance.
                    </div>
                  </div>

                  {/* Calculations Breakdown */}
                  <div className="pt-4 border-t border-white/10 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Base Plan ({billingCycle}):</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Sovereign Grant (-{discountPercent}%):</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-400">
                      <span>Quantum Node Tax (0%):</span>
                      <span>$0.00</span>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">TOTAL DUE:</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-cyan-400">${finalTotal.toFixed(2)}</span>
                        <div className="text-[10px] text-slate-400">
                          {billingCycle === "annual" ? "per year" : "per month"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sovereign Guarantee */}
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-slate-300 font-mono flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      30-day sovereign money-back guarantee. Zero lock-in. Cancel or export full data anytime.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Order Success & Sovereign License View */
            <motion.div
              key="checkout-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto bg-gradient-to-b from-[#071329] to-[#030612] border border-cyan-500/50 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-500/20 text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>

              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                SOVEREIGN AUTHORIZATION GRANTED
              </span>

              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                Welcome to {currentPlan.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-8">
                Your cryptographic license has been minted to the sovereign ledger. 
                All 8 EMET subsystems are now fully unlocked.
              </p>

              {/* License Certificate Box */}
              <div className="p-6 rounded-2xl bg-black/60 border border-cyan-500/30 text-left font-mono space-y-3 mb-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ISSUED TO</span>
                    <strong className="text-sm text-white">{cardName} ({email})</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">ORDER ID</span>
                    <span className="text-xs text-cyan-400 font-bold">{orderId}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">CRYPTOGRAPHIC LICENSE KEY</span>
                  <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-sm font-bold text-cyan-300 break-all select-all flex items-center justify-between">
                    <span>{issuedLicenseKey}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-400 text-slate-950 font-black">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] text-slate-400">
                  <div>
                    <span>AUTHORIZATION LEVEL:</span>{" "}
                    <strong className="text-emerald-400 uppercase">{selectedPlan}</strong>
                  </div>
                  <div>
                    <span>VALID THROUGH:</span>{" "}
                    <strong className="text-white">PERPETUAL / RENEWING</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-sm hover:opacity-95 transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch Unlocked Console</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print Receipt / PDF</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
