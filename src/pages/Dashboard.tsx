"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Brain, 
  Plus, 
  Search, 
  Sparkles, 
  Target, 
  Cpu, 
  LayoutDashboard, 
  User, 
  Settings,
  ChevronRight,
  Zap,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Download,
  Sliders,
  Share2,
  FileText,
  Shield,
  Activity,
  ArrowRight,
  Send,
  Terminal,
  Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, PlanTier } from "@/src/context/AuthContext";
import GhostTerminal from "@/src/components/GhostTerminal";
import UnifiedSidebar from "@/src/components/UnifiedSidebar";
import AudioPlayerBar from "@/src/components/AudioPlayerBar";
import EmetMasterControl from "@/src/pages/EmetMasterControl";
import AyinSpectrum from "@/src/pages/AyinSpectrum";
import NesherNeural from "@/src/pages/NesherNeural";
import RuachAutonomousChat from "@/src/pages/RuachAutonomousChat";
import KolSoundEngine from "@/src/pages/KolSoundEngine";
import NeshimaHyperbaric from "@/src/pages/NeshimaHyperbaric";
import OrEinSofZpe from "@/src/pages/OrEinSofZpe";
import DaatPipeline from "@/src/pages/DaatPipeline";

export interface PsychometricVector {
  formality: number;
  emotionality: number;
  assertiveness: number;
  complexity: number;
  engagement: number;
  authenticity: number;
}

export interface ToneFingerprint extends PsychometricVector {
  vocabulary_richness: number;
  avg_sentence_len: number;
  emoji_density: number;
  signature_phrases: string[];
  emoji_patterns: string[];
}

export interface KOLProfile {
  kol_id: string;
  name: string;
  platform: 'twitter' | 'linkedin' | 'instagram' | 'substack';
  niche: string;
  fingerprint: ToneFingerprint;
  samples_count: number;
  created_at: number;
  samples?: string[];
}

export interface GenerationResult {
  content: string;
  confidence: number;
  format: 'thread' | 'single' | 'long';
  modelUsed: string;
  timestamp: number;
}

export default function Dashboard({ defaultTab = 'emet' }: { defaultTab?: string }) {
  const { user, upgradeTier, loginAsSovereign, logout } = useAuth();
  const [profiles, setProfiles] = useState<KOLProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recalibrating, setRecalibrating] = useState(false);

  // New Profile Form
  const [newName, setNewName] = useState("");
  const [newNiche, setNewNiche] = useState("");
  const [newPlatform, setNewPlatform] = useState<'twitter' | 'linkedin' | 'instagram' | 'substack'>('twitter');
  const [newSamples, setNewSamples] = useState("");

  // Generator State
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<'thread' | 'single' | 'long'>('thread');
  const [lastGeneration, setLastGeneration] = useState<GenerationResult | null>(null);

  // Settings State
  const [temperature, setTemperature] = useState(0.7);
  const [customInstructions, setCustomInstructions] = useState("");
  const [strictMode, setStrictMode] = useState(true);
  const [backendStatus, setBackendStatus] = useState<any>(null);

  // Platform Sync State
  const [syncPlatform, setSyncPlatform] = useState<'twitter' | 'linkedin' | 'substack'>('twitter');
  const [syncHandle, setSyncHandle] = useState("");
  const [syncRawText, setSyncRawText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Stats Counters
  const [analysisCount, setAnalysisCount] = useState(14);
  const [generationCount, setGenerationCount] = useState(28);

  // 1. Load profiles & health from backend
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [profRes, healthRes] = await Promise.all([
          fetch("/api/profiles"),
          fetch("/api/health"),
        ]);
        const profData = await profRes.json();
        const healthData = await healthRes.json();

        if (profData.profiles && profData.profiles.length > 0) {
          setProfiles(profData.profiles);
          setActiveProfileId(profData.profiles[0].kol_id);
        }
        setBackendStatus(healthData);
      } catch (err) {
        console.error("Failed to load initial data from backend:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.kol_id === activeProfileId) || profiles[0] || null, 
    [profiles, activeProfileId]
  );

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      p => p.name.toLowerCase().includes(q) || p.niche.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  // 2. Create Profile via Backend
  const handleCreateProfile = async () => {
    if (!newName.trim() || !newNiche.trim() || !newSamples.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          niche: newNiche,
          platform: newPlatform,
          samples: newSamples,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create profile");

      setProfiles(prev => [data.profile, ...prev]);
      setActiveProfileId(data.profile.kol_id);
      setShowNewProfileModal(false);
      setNewName("");
      setNewNiche("");
      setNewSamples("");
      setAnalysisCount(c => c + 1);
    } catch (err: any) {
      alert(`Error building profile: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Delete Profile
  const handleDeleteProfile = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete profile "${name}"?`)) return;
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProfiles(prev => prev.filter(p => p.kol_id !== id));
        if (activeProfileId === id) {
          const remaining = profiles.filter(p => p.kol_id !== id);
          setActiveProfileId(remaining[0]?.kol_id || null);
        }
      }
    } catch (err) {
      console.error("Failed to delete profile:", err);
    }
  };

  // 4. Generate Content via Backend (Gemini 3.8 Flash)
  const handleGenerate = async () => {
    if (!activeProfile || !topic.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: activeProfile,
          topic: topic.trim(),
          format,
          temperature,
          customInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation error");

      setLastGeneration({
        content: data.content,
        confidence: data.confidence || 0.94,
        format: data.format,
        modelUsed: data.modelUsed || "gemini-3.8-flash",
        timestamp: data.timestamp || Date.now(),
      });
      setGenerationCount(c => c + 1);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 5. Recalibrate Psychometrics
  const handleRecalibrate = async () => {
    if (!activeProfile || recalibrating) return;
    setRecalibrating(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples: activeProfile.samples || [] }),
      });
      const data = await res.json();
      if (data.success && data.fingerprint) {
        setProfiles(prev =>
          prev.map(p =>
            p.kol_id === activeProfile.kol_id
              ? { ...p, fingerprint: data.fingerprint }
              : p
          )
        );
        setAnalysisCount(c => c + 1);
      }
    } catch (err) {
      console.error("Recalibrate error:", err);
    } finally {
      setTimeout(() => setRecalibrating(false), 800);
    }
  };

  // 6. Platform Sync Ingestion
  const handlePlatformSync = async () => {
    if (!syncRawText.trim() && !syncHandle.trim()) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const res = await fetch("/api/platform/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: syncPlatform,
          handle: syncHandle,
          rawText: syncRawText,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Auto create profile from sync
        const newProfRes = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: syncHandle || `Synced ${syncPlatform.toUpperCase()} KOL`,
            platform: syncPlatform,
            niche: "Cross-Platform Synthesized",
            samples: data.extractedPosts,
          }),
        });
        const profResult = await newProfRes.json();
        if (profResult.success) {
          setProfiles(prev => [profResult.profile, ...prev]);
          setActiveProfileId(profResult.profile.kol_id);
          setSyncFeedback(`Successfully synced and analyzed ${data.extractedPostsCount} posts into new profile!`);
          setSyncRawText("");
          setSyncHandle("");
          setTimeout(() => setActiveTab("overview"), 1200);
        }
      }
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 7. Export Profile JSON
  const handleDownloadProfile = () => {
    if (!activeProfile) return;
    const blob = new Blob([JSON.stringify(activeProfile, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProfile.name.toLowerCase().replace(/\s+/g, "_")}_tone_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 8. Clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      <div className="flex flex-1 min-h-0 pb-14">
        {/* Unified Sidebar with Dropdowns for All Systems */}
        <UnifiedSidebar activeTab={activeTab} onSelectTab={(t) => setActiveTab(t)} />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <header className="h-16 border-b border-cyan-500/20 px-6 flex items-center justify-between shrink-0 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold tracking-tight text-white font-mono flex items-center gap-2">
                {activeTab === 'emet' && "EMET אֱמֶת — Sovereign Master Control"}
                {activeTab === 'ayin' && "AYIN עַיִן — All-Spectrum Optic Array"}
                {activeTab === 'nesher' && "NESHER נֶשֶׁר — Neural BCI & Brain Scan"}
                {activeTab === 'ruach' && "RUACH רוּחַ — Sovereign AI & Autonomous Command"}
                {activeTab === 'kol' && "KOL קוֹל — Harmonic Tone Synthesizer & Recorder"}
                {activeTab === 'neshima' && "NESHIMA נְשִׁימָה — Hyperbaric Oxygen Chamber"}
                {activeTab === 'zpe' && "OR EIN SOF אוֹר — Zero-Point Energy & Casimir Engine"}
                {activeTab === 'daat' && "DAAT דַּעַת — Unified 9-Stage Execution Pipeline"}
                {activeTab === 'terminal' && "GHOST CORE — Sovereign CLI Terminal"}
                {(activeTab === 'overview' || activeTab === 'profiles') && (activeProfile ? `${activeProfile.name} Profiler Workspace` : "KOL Console Overview")}
                {activeTab === 'sync' && "Cross-Platform Pipeline Sync"}
                {activeTab === 'settings' && "Model & Inference Settings"}
              </h1>
              {(activeTab === 'overview' || activeTab === 'profiles') && activeProfile && (
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                  {activeProfile.platform}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Clearance Tier Badge & Pricing Link */}
              <Link
                to="/pricing"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  user?.tier === 'enterprise'
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                    : user?.tier === 'pro'
                    ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
                title="View Sovereign Subscription Tiers"
              >
                <Crown size={13} className={user?.tier === 'enterprise' ? "text-amber-400" : "text-cyan-400"} />
                <span className="uppercase">{user?.tier || 'Explorer'} Tier</span>
                <span className="text-[10px] text-slate-400 ml-1">Upgrade →</span>
              </Link>

              {/* Quick Jump Buttons */}
              <button
                onClick={() => setActiveTab('terminal')}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                  activeTab === 'terminal'
                    ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                }`}
                title="Open Terminal"
              >
                <Terminal size={14} className="text-cyan-400" />
                <span>TERMINAL</span>
              </button>

              <button
                onClick={() => setActiveTab('ruach')}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                  activeTab === 'ruach'
                    ? "bg-blue-950 text-blue-300 border-blue-500"
                    : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                }`}
                title="Launch Autonomous AI Chat"
              >
                <Sparkles size={14} className="text-blue-400" />
                <span>AUTONOMOUS AI</span>
              </button>

              {/* User Avatar & Session Modal Trigger */}
              <button
                onClick={() => setShowUserModal(true)}
                title="Operator Clearance & Settings"
                className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  user?.tier === 'enterprise' ? "bg-amber-400 text-slate-950" : "bg-cyan-500/20 text-cyan-400"
                }`}>
                  {user?.avatar || "DW"}
                </div>
                <span className="text-xs font-semibold text-slate-300 pr-1 hidden lg:inline font-mono">
                  {user?.name || "DAMONE_WARD"}
                </span>
              </button>
            </div>
          </header>

          {/* DEDICATED SYSTEM PAGES */}
          {activeTab === 'emet' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <EmetMasterControl onNavigateTab={(t) => setActiveTab(t)} />
            </div>
          )}

          {activeTab === 'ayin' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <AyinSpectrum />
            </div>
          )}

          {activeTab === 'nesher' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <NesherNeural />
            </div>
          )}

          {activeTab === 'ruach' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <RuachAutonomousChat />
            </div>
          )}

          {activeTab === 'kol' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <KolSoundEngine />
            </div>
          )}

          {activeTab === 'neshima' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <NeshimaHyperbaric />
            </div>
          )}

          {activeTab === 'zpe' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <OrEinSofZpe />
            </div>
          )}

          {activeTab === 'daat' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <DaatPipeline />
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="p-8 max-w-7xl mx-auto w-full">
              <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-cyan-500/30">
                <GhostTerminal initialOpen={true} />
              </div>
            </div>
          )}

          {/* TAB: PROFILES & STYLOMETRY OVERVIEW */}
          {(activeTab === 'overview' || activeTab === 'profiles') && (
          activeProfile ? (
            <div className="p-8 space-y-8 max-w-7xl">
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                  label="Dominant Archetype" 
                  val={activeProfile.fingerprint.signature_phrases[0] ? activeProfile.fingerprint.signature_phrases[0].toUpperCase() : "AUTHORITATIVE"} 
                  icon={<Sparkles size={16} className="text-cyan-400" />} 
                />
                <StatCard 
                  label="Cognitive Complexity" 
                  val={`${Math.round(activeProfile.fingerprint.complexity * 100)}%`} 
                  icon={<Brain size={16} className="text-indigo-400" />} 
                />
                <StatCard 
                  label="Lexical Richness" 
                  val={`${(activeProfile.fingerprint.vocabulary_richness * 100).toFixed(1)}%`} 
                  icon={<Target size={16} className="text-emerald-400" />} 
                />
                <StatCard 
                  label="Average Sentence" 
                  val={`${activeProfile.fingerprint.avg_sentence_len} words`} 
                  icon={<BarChart3 size={16} className="text-amber-400" />} 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1 & 2: Psychometrics + Content Generator */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Psychometric Chart */}
                  <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-7 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-white">Psychometric Fingerprint</h3>
                        <p className="text-xs text-slate-400">Calculated across 6 communicative dimensions</p>
                      </div>
                      <button 
                        onClick={handleRecalibrate}
                        disabled={recalibrating}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={recalibrating ? "animate-spin" : ""} />
                        {recalibrating ? "Analyzing..." : "Recalibrate"}
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-4 h-44 items-end pt-4">
                      <Bar value={activeProfile.fingerprint.formality} label="Formal" />
                      <Bar value={activeProfile.fingerprint.emotionality} label="Emotion" />
                      <Bar value={activeProfile.fingerprint.assertiveness} label="Assertive" />
                      <Bar value={activeProfile.fingerprint.complexity} label="Complex" />
                      <Bar value={activeProfile.fingerprint.engagement} label="Engaged" />
                      <Bar value={activeProfile.fingerprint.authenticity} label="Authentic" />
                    </div>
                  </section>

                  {/* Tone Generator with Gemini 3.8 Flash */}
                  <section className="bg-[#0b1329] border border-white/10 rounded-3xl p-7 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Sparkles size={16} className="text-cyan-400" />
                          <span>Tone Synthesizer</span>
                        </h3>
                        <p className="text-xs text-slate-400">Powered by server-side Gemini 3.8 Flash</p>
                      </div>

                      {/* Format Selector */}
                      <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
                        {(['thread', 'single', 'long'] as const).map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => setFormat(fmt)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              format === fmt
                                ? "bg-white text-black shadow-md"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {fmt === 'thread' ? 'Thread' : fmt === 'single' ? 'Single Post' : 'Long Form'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="What should the KOL talk about? (e.g., DeFi liquidity drawdown, Autonomous AI agent states, Mitochondrial resilience, Product moat...)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400/50 min-h-[90px] resize-none text-slate-200 placeholder:text-slate-500 transition-all font-sans"
                      />
                      <button 
                        onClick={handleGenerate}
                        disabled={!topic.trim() || isGenerating}
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black rounded-2xl hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer text-sm"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Synthesizing Authentic Persona...</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Generate Tone-Matched Content</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Generation Result */}
                    <AnimatePresence>
                      {lastGeneration && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 pt-6 border-t border-white/10"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                Match Confidence: {Math.round(lastGeneration.confidence * 100)}% ({lastGeneration.modelUsed})
                              </span>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(lastGeneration.content)}
                              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 cursor-pointer"
                            >
                              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              <span>{copied ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-200">
                            {lastGeneration.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                </div>

                {/* Column 3: Signatures, Emojis, Export */}
                <div className="space-y-6">
                  {/* Stylistic Signatures */}
                  <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xs font-bold mb-3 uppercase tracking-widest text-slate-400">
                      Signature Terminology
                    </h3>
                    <div className="space-y-2">
                      {activeProfile.fingerprint.signature_phrases.map((phrase, i) => (
                        <div key={i} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-cyan-300 italic flex items-center justify-between">
                          <span>"{phrase}"</span>
                          <span className="text-[10px] font-mono text-slate-500">high weight</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Emoji Fingerprint */}
                  <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-xs font-bold mb-3 uppercase tracking-widest text-slate-400">
                      Emoji Resonance ({Math.round(activeProfile.fingerprint.emoji_density * 100)}% Density)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeProfile.fingerprint.emoji_patterns.map((emoji, i) => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-sm">
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Profile Export */}
                  <section className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Download size={15} className="text-cyan-400" />
                      <span>Export Profile</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Download the complete raw JSON vector schema for local storage or sovereign prompting pipelines.
                    </p>
                    <button 
                      onClick={handleDownloadProfile}
                      className="w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-white cursor-pointer"
                    >
                      <Download size={14} /> Download .kol_profile.json
                    </button>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Cpu size={32} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">No Profile Selected</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Select an existing KOL profile from the sidebar or build a new fingerprint from post samples.
                </p>
                <button 
                  onClick={() => setShowNewProfileModal(true)}
                  className="px-6 py-3 bg-white text-black font-black text-xs rounded-xl hover:scale-105 transition-all cursor-pointer"
                >
                  Create New Profile
                </button>
              </div>
            </div>
          )
        )}

        {/* TAB 2: PLATFORM SYNC */}
        {activeTab === 'sync' && (
          <div className="p-8 max-w-4xl space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Globe size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Cross-Platform Sync Ingest</h2>
                  <p className="text-xs text-slate-400">Import posts directly from social channels or raw thread dumps</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {(['twitter', 'linkedin', 'substack'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setSyncPlatform(p)}
                      className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        syncPlatform === p
                          ? "bg-white text-black border-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">KOL Handle or Profile Identifier</label>
                  <input 
                    value={syncHandle}
                    onChange={(e) => setSyncHandle(e.target.value)}
                    placeholder="e.g. @balajis, @sama, or Substack publication"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400/50 text-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">Raw Post Stream / Thread Dump (Paragraphs separated by blank lines)</label>
                  <textarea 
                    value={syncRawText}
                    onChange={(e) => setSyncRawText(e.target.value)}
                    placeholder="Paste 3-10 raw post samples or thread tweets here..."
                    className="w-full h-44 bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-cyan-400/50 text-slate-200 resize-none"
                  />
                </div>

                {syncFeedback && (
                  <div className={`p-4 rounded-xl text-xs font-medium ${
                    syncFeedback.includes('failed')
                      ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                      : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                  }`}>
                    {syncFeedback}
                  </div>
                )}

                <button
                  onClick={handlePlatformSync}
                  disabled={isSyncing || (!syncHandle.trim() && !syncRawText.trim())}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black rounded-xl hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Ingesting & Mapping Fingerprint...</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={15} />
                      <span>Sync & Build Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MODEL SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-8 max-w-4xl space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sliders size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Inference Engine Parameters</h2>
                  <p className="text-xs text-slate-400">Configure Gemini 3.8 Flash temperature, grounding, and tone adherence</p>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Sampling Temperature: {temperature.toFixed(2)}</label>
                  <span className="text-[10px] font-mono text-cyan-400">{temperature < 0.5 ? "Deterministic" : temperature > 0.8 ? "Creative" : "Balanced"}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.1 (Strict Adherence)</span>
                  <span>1.0 (High Novelty)</span>
                </div>
              </div>

              {/* System Instructions / Tone Guard */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Global Directive / Safety Guard</label>
                <textarea 
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Always maintain sober financial realism. Never use buzzwords like 'revolutionary' or 'to the moon'."
                  className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-cyan-400/50 text-slate-200 resize-none"
                />
              </div>

              {/* Strict Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="text-xs font-bold text-slate-200">Strict Lexical Adherence</div>
                  <div className="text-[11px] text-slate-400">Enforce signature phrases in every generation</div>
                </div>
                <button
                  onClick={() => setStrictMode(!strictMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    strictMode ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    strictMode ? "left-7" : "left-1"
                  }`} />
                </button>
              </div>

              {/* Server Telemetry Box */}
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs font-mono space-y-1">
                <div className="text-cyan-400 font-bold mb-1">LIVE SERVER TELEMETRY:</div>
                <div className="text-slate-300">Backend Endpoint: /api/generate</div>
                <div className="text-slate-300">Model: gemini-3.8-flash (Telemetry: User-Agent: aistudio-build)</div>
                <div className="text-slate-300">Active Audio: Web Audio API (48,000 Hz)</div>
                <div className="text-emerald-400">All 8 Subsystems: ONLINE ●</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

      {/* New Profile Modal */}
      <AnimatePresence>
        {showNewProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewProfileModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-7 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Build KOL Profile</h2>
                  <p className="text-xs text-slate-400">Extract an authentic psychometric fingerprint from sample text.</p>
                </div>
                <button
                  onClick={() => setShowNewProfileModal(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-7 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KOL Name</label>
                    <input 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Alex Vance" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niche / Domain</label>
                    <input 
                      value={newNiche}
                      onChange={(e) => setNewNiche(e.target.value)}
                      placeholder="e.g. DeFi Liquidity & Macro" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Platform</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['twitter', 'linkedin', 'instagram', 'substack'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setNewPlatform(p)}
                        className={`py-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          newPlatform === p
                            ? "bg-white text-black border-white"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Post Samples (Separate distinct posts with a blank line)
                  </label>
                  <textarea 
                    value={newSamples}
                    onChange={(e) => setNewSamples(e.target.value)}
                    placeholder="Post 1: Stop chasing vanity volume. Real protocol yield is...&#10;&#10;Post 2: The market doesn't care about roadmaps...&#10;&#10;Post 3: When incentives evaporate, TVL cuts in half..." 
                    className="w-full h-36 bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400/50 resize-none"
                  />
                  <p className="text-[10px] text-slate-500">Provide 3-5 real posts for mathematical signature extraction.</p>
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border-t border-white/10 flex justify-end gap-3">
                <button 
                  onClick={() => setShowNewProfileModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateProfile}
                  disabled={!newName.trim() || !newNiche.trim() || !newSamples.trim() || isAnalyzing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-xs hover:opacity-95 transition-all disabled:opacity-50 min-w-[140px] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  {isAnalyzing ? (
                    <><RefreshCw size={14} className="animate-spin" /> Analyzing...</>
                  ) : (
                    "Build Profile"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User / Session Info Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-cyan-500/30 rounded-3xl p-7 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${
                  user?.tier === 'enterprise' 
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300" 
                    : "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                }`}>
                  {user?.avatar || "DW"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{user?.name || "DAMONE_WARD"}</h3>
                  <p className="text-xs text-cyan-400 font-mono">
                    {user?.clearance || "SOVEREIGN"} • {user?.role || "ADMINISTRATOR"}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs bg-black/40 p-4 rounded-2xl border border-white/5 mb-5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier:</span>
                  <span className="text-amber-400 font-bold uppercase">{user?.tier || 'enterprise'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">License Key:</span>
                  <span className="text-cyan-300 text-[11px] truncate max-w-[200px]">{user?.licenseKey || 'GHOST-SOV-EMET-9999'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-300 text-[11px]">{user?.email || 'damone.ward@ghostcore.io'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform:</span>
                  <span className="text-cyan-400">EMET אֱמֶת v1.0</span>
                </div>
              </div>

              {/* Quick Switch Clearance for Evaluation */}
              <div className="space-y-2 mb-6">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Test Paywall / Switch Clearance:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { loginAsSovereign(); }}
                    className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold transition-all cursor-pointer"
                  >
                    👑 Sovereign (Unlock All)
                  </button>
                  <button
                    onClick={() => { upgradeTier("free"); }}
                    className="p-2 rounded-xl bg-slate-800/60 border border-slate-700 hover:bg-slate-800 text-slate-300 text-[11px] font-mono font-bold transition-all cursor-pointer"
                  >
                    🔒 Explorer (Test Paywall)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Link
                  to="/pricing"
                  onClick={() => setShowUserModal(false)}
                  className="py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 text-center transition-all"
                >
                  View 3-Tier Pricing
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => setShowUserModal(false)}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-xs text-center transition-all flex items-center justify-center gap-1"
                >
                  <span>Go to Checkout</span>
                </Link>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono">
                <Link
                  to="/login"
                  onClick={() => setShowUserModal(false)}
                  className="text-slate-400 hover:text-white underline"
                >
                  Switch / Sign In Account
                </Link>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Ghost Terminal Launcher & Window (when not on full terminal tab) */}
      {activeTab !== 'terminal' && (
        <div className="fixed bottom-16 right-6 z-50 w-[540px] max-w-[92vw]">
          <GhostTerminal initialOpen={false} />
        </div>
      )}

      {/* Global Fixed Bottom Audio Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <AudioPlayerBar />
      </div>
    </div>
  );
}

function StatCard({ label, val, icon }: { label: string; val: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl bg-white/5">
          {icon}
        </div>
      </div>
      <div className="text-lg font-black tracking-tight text-white mb-1 truncate">{val}</div>
      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</div>
    </div>
  );
}

function Bar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 h-full group">
      <div className="flex-1 w-full bg-white/5 rounded-t-lg relative overflow-hidden flex flex-col justify-end">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(8, value * 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 group-hover:from-indigo-500 group-hover:to-cyan-300 transition-colors"
        />
      </div>
      <span className="text-[10px] font-mono text-slate-300 font-bold">{Math.round(value * 100)}%</span>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-cyan-300 transition-colors">
        {label}
      </span>
    </div>
  );
}
