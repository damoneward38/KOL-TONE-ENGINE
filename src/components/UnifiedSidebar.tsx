"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Crown, 
  Eye, 
  Brain, 
  Sparkles, 
  Music, 
  Wind, 
  Atom, 
  Layers, 
  Terminal, 
  BarChart3, 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Activity, 
  Play, 
  Radio, 
  Volume2, 
  VolumeX, 
  Sliders, 
  LayoutDashboard,
  Shield,
  HelpCircle,
  Lock,
  ArrowUpRight,
  UserCheck
} from "lucide-react";
import { playTone, stopAllTones } from "@/src/lib/sound-synth";
import { useAuth, FeatureKey, PlanTier } from "@/src/context/AuthContext";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen?: boolean;
}

interface SubAction {
  id: string;
  label: string;
  desc: string;
  featureKey?: FeatureKey;
  action?: () => void;
}

interface SidebarSystem {
  id: string;
  name: string;
  hebrew: string;
  title: string;
  icon: any;
  color: string;
  featureKey?: FeatureKey;
  minTier?: PlanTier;
  subActions: SubAction[];
}

export default function UnifiedSidebar({ activeTab, onSelectTab }: SidebarProps) {
  const { user, canAccess, openPaywall } = useAuth();

  // Track which dropdowns are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    emet: true,
    ayin: false,
    nesher: false,
    ruach: false,
    kol: false,
    neshima: false,
    zpe: false,
    daat: false,
    terminal: false,
    profiles: false,
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const systems: SidebarSystem[] = [
    {
      id: "emet",
      name: "EMET",
      hebrew: "אֱמֶת",
      title: "Master Control",
      icon: Crown,
      color: "text-amber-400",
      featureKey: "emet_master",
      minTier: "enterprise",
      subActions: [
        { id: "emet_overview", label: "Master Dashboard", desc: "Sovereign platform overview & telemetry" },
        { 
          id: "emet_connect", 
          label: "Connect All 8 Systems", 
          desc: "Dispatches emet connect across all nodes",
          featureKey: "emet_master",
          action: () => {
            fetch("/api/emet/connect", { method: "POST" });
            playTone(963, 0.25, "sine", "EMET UNIFIED");
          }
        },
        { id: "emet_status", label: "Platform Status", desc: "99.999% uptime & clearance check" },
      ],
    },
    {
      id: "ayin",
      name: "AYIN",
      hebrew: "עַיִן",
      title: "Spectrum Vision",
      icon: Eye,
      color: "text-cyan-400",
      featureKey: "ayin_standard",
      minTier: "free",
      subActions: [
        { 
          id: "ayin_unlock", 
          label: "Initialize Eye / Unlock All", 
          desc: "Unlocks 8 optical spectrums at 100% optic sync",
          action: () => {
            fetch("/api/ayin/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "all" }) });
            playTone(432, 0.2, "sine", "AYIN UNLOCK ALL");
          }
        },
        { 
          id: "ayin_thermal", 
          label: "Thermal FLIR Mode", 
          desc: "Differential radiant heat signatures",
          featureKey: "ayin_advanced",
          action: () => {
            fetch("/api/ayin/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "thermal" }) });
            playTone(528, 0.2, "sine", "AYIN THERMAL");
          }
        },
        { 
          id: "ayin_ir", 
          label: "Infrared Scan", 
          desc: "Thermal emission 700nm-1mm",
          action: () => {
            fetch("/api/ayin/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "infrared" }) });
            playTone(432, 0.2, "sine", "AYIN IR");
          }
        },
        { 
          id: "ayin_xray", 
          label: "X-Ray Penetration", 
          desc: "Bone & dense matter opacity imaging",
          featureKey: "ayin_advanced",
          action: () => {
            fetch("/api/ayin/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "xray" }) });
            playTone(741, 0.2, "sine", "AYIN XRAY");
          }
        },
        { 
          id: "ayin_nv", 
          label: "Night Vision Amplification", 
          desc: "Photon multiplier phosphorescent green",
          action: () => {
            fetch("/api/ayin/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "night" }) });
            playTone(528, 0.2, "sine", "AYIN NIGHT");
          }
        },
        { 
          id: "ayin_combine", 
          label: "Combine Spectrums (IR + NV)", 
          desc: "Dual-matrix sensory fusion",
          featureKey: "ayin_advanced",
          action: () => {
            fetch("/api/ayin/combine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode1: "infrared", mode2: "night" }) });
            playTone(639, 0.25, "triangle", "AYIN COMBINE");
          }
        },
      ],
    },
    {
      id: "nesher",
      name: "NESHER",
      hebrew: "נֶשֶׁר",
      title: "Neural BCI",
      icon: Brain,
      color: "text-purple-400",
      featureKey: "nesher_neural",
      minTier: "pro",
      subActions: [
        { 
          id: "nesher_scan", 
          label: "8-Channel Brain Scan", 
          desc: "Acquire real-time EEG brain telemetry",
          featureKey: "nesher_neural",
          action: () => {
            fetch("/api/nesher/scan", { method: "POST" });
            playTone(40, 0.3, "sine", "NESHER 40Hz GAMMA");
          }
        },
        { id: "nesher_bands", label: "5 Frequency Bands", desc: "Alpha, Beta, Theta, Delta, Gamma", featureKey: "nesher_neural" },
        { 
          id: "nesher_entrain", 
          label: "Entrain Focus (40 Hz)", 
          desc: "Play 40 Hz Gamma tone for cognitive peak",
          featureKey: "nesher_neural",
          action: () => playTone(40, 0.25, "sine", "40 Hz FOCUS")
        },
      ],
    },
    {
      id: "ruach",
      name: "RUACH",
      hebrew: "רוּחַ",
      title: "Autonomous AI Chat",
      icon: Sparkles,
      color: "text-cyan-300",
      featureKey: "ruach_basic",
      minTier: "free",
      subActions: [
        { id: "ruach_chat", label: "Autonomous Chat Console", desc: "Speech-to-text mic & voice engine" },
        { id: "ruach_voice", label: "Voice Engine Feedback", desc: "Neural audio speech synthesis", featureKey: "ruach_voice" },
        { 
          id: "ruach_memory", 
          label: "Ruach Memory Bank", 
          desc: "Inspect active server memory entries",
          action: () => {
            fetch("/api/ruach/memory");
          }
        },
      ],
    },
    {
      id: "kol",
      name: "KOL",
      hebrew: "קוֹל",
      title: "Sound Synthesizer",
      icon: Music,
      color: "text-emerald-400",
      featureKey: "kol_basic",
      minTier: "free",
      subActions: [
        { 
          id: "kol_432", 
          label: "Play 432 Hz (David's Harp)", 
          desc: "Sacred harmonic resonance tone",
          action: () => playTone(432, 0.25, "sine", "432 Hz DAVID'S HARP")
        },
        { 
          id: "kol_528", 
          label: "Play 528 Hz (DNA Repair)", 
          desc: "Miracle solfeggio transformation",
          action: () => playTone(528, 0.25, "sine", "528 Hz DNA REPAIR")
        },
        { 
          id: "kol_40", 
          label: "Play 40 Hz (Gamma Brain)", 
          desc: "Cognitive peak neural entrainment",
          action: () => playTone(40, 0.25, "sine", "40 Hz GAMMA")
        },
        { 
          id: "kol_111", 
          label: "Play 111 Hz (Pyramid Tone)", 
          desc: "Cellular regeneration cellular tone",
          action: () => playTone(111, 0.25, "sine", "111 Hz PYRAMID")
        },
        { 
          id: "kol_recorder", 
          label: "Web Audio Recording Studio", 
          desc: "Capture multi-track live audio to WebM",
          featureKey: "kol_recording",
        },
        { 
          id: "kol_stop", 
          label: "Stop All Tones", 
          desc: "Instant silence across all oscillators",
          action: () => stopAllTones()
        },
      ],
    },
    {
      id: "neshima",
      name: "NESHIMA",
      hebrew: "נְשִׁימָה",
      title: "Hyperbaric Chamber",
      icon: Wind,
      color: "text-sky-400",
      featureKey: "neshima_chamber",
      minTier: "pro",
      subActions: [
        { 
          id: "neshima_init", 
          label: "Initialize Chamber", 
          desc: "Pre-pressurize to 1.5 ATM baseline",
          featureKey: "neshima_chamber",
          action: () => {
            fetch("/api/neshima/pressure", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ atm: 1.5 }) });
            playTone(396, 0.2, "sine", "NESHIMA 1.5 ATM");
          }
        },
        { 
          id: "neshima_mito", 
          label: "Protocol: Mitochondrial Surge", 
          desc: "2.0 ATM + 100% O2 cellular boost",
          featureKey: "neshima_chamber",
          action: () => {
            fetch("/api/neshima/protocol", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ protocol: "mitochondrial" }) });
            playTone(528, 0.2, "sine", "MITOCHONDRIAL PROTOCOL");
          }
        },
        { 
          id: "neshima_neuro", 
          label: "Protocol: Neuroplasticity & TBI", 
          desc: "1.75 ATM hyper-oxygenation",
          featureKey: "neshima_chamber",
          action: () => {
            fetch("/api/neshima/protocol", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ protocol: "neuroplasticity" }) });
            playTone(639, 0.2, "sine", "NEUROPLASTICITY PROTOCOL");
          }
        },
      ],
    },
    {
      id: "zpe",
      name: "OR EIN SOF",
      hebrew: "אוֹר אֵין סוֹף",
      title: "Zero-Point Energy",
      icon: Atom,
      color: "text-indigo-400",
      featureKey: "zpe_casimir",
      minTier: "pro",
      subActions: [
        { 
          id: "zpe_casimir", 
          label: "Calculate Casimir Force", 
          desc: "hc*pi^2 / (240 * d^4) quantum calculation",
          featureKey: "zpe_casimir",
          action: () => {
            fetch("/api/zpe/casimir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gap_nm: 100 }) });
            playTone(852, 0.2, "triangle", "CASIMIR 100NM");
          }
        },
        { 
          id: "zpe_vacuum", 
          label: "Vacuum Fluctuation Canvas", 
          desc: "Observe virtual particle pairs in zero-point field",
          featureKey: "zpe_casimir",
        },
      ],
    },
    {
      id: "daat",
      name: "DAAT",
      hebrew: "דַּעַת",
      title: "Unified Pipeline",
      icon: Layers,
      color: "text-amber-300",
      featureKey: "daat_pipeline",
      minTier: "enterprise",
      subActions: [
        { 
          id: "daat_run", 
          label: "Run 9-Stage Master Pipeline", 
          desc: "Execute complete unified data pipeline",
          featureKey: "daat_pipeline",
          action: () => {
            fetch("/api/daat/run", { method: "POST" });
            playTone(963, 0.3, "sine", "DAAT PIPELINE DISPATCH");
          }
        },
        { id: "daat_nodes", label: "Inspect 8 System Nodes", desc: "Signal, optic, neural, acoustic, chamber, ZPE", featureKey: "daat_pipeline" },
      ],
    },
    {
      id: "terminal",
      name: "GHOST CORE",
      hebrew: "גּוֹסְט",
      title: "Terminal CLI",
      icon: Terminal,
      color: "text-emerald-300",
      subActions: [
        { id: "term_help", label: "Command Registry (help)", desc: "Full list of 40+ system commands" },
        { id: "term_status", label: "Full System Status", desc: "All 8 engines real-time check" },
        { id: "term_whoami", label: "Admin Clearance Info", desc: "DAMONE_WARD verified access" },
      ],
    },
    {
      id: "profiles",
      name: "KOL STYLOMETRY",
      hebrew: "קְלַסְתֵּר",
      title: "Tone Engine",
      icon: BarChart3,
      color: "text-sky-300",
      featureKey: "kol_basic",
      subActions: [
        { id: "prof_list", label: "6D Psychometric Vectors", desc: "Formality, emotionality, assertiveness" },
        { id: "prof_generate", label: "Tone Content Synthesizer", desc: "Generate authentic persona posts" },
        { id: "prof_sync", label: "Platform Ingest (Twitter/Substack)", desc: "Import raw post dumps directly" },
      ],
    },
  ];

  const handleSystemClick = (sys: SidebarSystem) => {
    if (sys.featureKey && !canAccess(sys.featureKey)) {
      openPaywall(sys.featureKey);
      return;
    }
    onSelectTab(sys.id);
  };

  const handleSubActionClick = (sub: SubAction, parentSys: SidebarSystem, e: React.MouseEvent) => {
    e.stopPropagation();
    const effectiveKey = sub.featureKey || parentSys.featureKey;
    if (effectiveKey && !canAccess(effectiveKey)) {
      openPaywall(effectiveKey);
      return;
    }
    if (sub.action) {
      sub.action();
    }
    onSelectTab(parentSys.id);
  };

  return (
    <aside className="w-72 border-r border-cyan-500/20 bg-[#020617] flex flex-col shrink-0 select-none h-screen sticky top-0 z-30">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-amber-300 font-mono font-bold text-sm shadow-[0_0_12px_rgba(0,240,255,0.25)] group-hover:scale-105 transition-all">
            GC
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>GHOST CORE</span>
              <span className="text-[10px] px-1 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-700/50 rounded font-normal">
                v2.4
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              EMET אֱמֶת SOVEREIGN SUITE
            </div>
          </div>
        </Link>
      </div>

      {/* Clearance Banner */}
      <div className="px-3 py-2 bg-slate-950/80 border-b border-white/5 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${
            user?.tier === "enterprise" ? "bg-amber-400 animate-pulse" : user?.tier === "pro" ? "bg-cyan-400" : "bg-slate-400"
          }`} />
          <span className="text-slate-400">CLEARANCE:</span>
          <span className={`font-bold uppercase ${
            user?.tier === "enterprise" ? "text-amber-400" : user?.tier === "pro" ? "text-cyan-400" : "text-slate-300"
          }`}>
            {user?.clearance || "SOVEREIGN"}
          </span>
        </div>

        <Link
          to="/pricing"
          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5"
        >
          <span>TIERS</span>
          <ArrowUpRight size={10} />
        </Link>
      </div>

      {/* Navigation List with Expandable Dropdowns */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin">
        <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>SOVEREIGN ENGINES & FUNCTIONS</span>
          <span className="text-cyan-400">TOUCH TO CALL</span>
        </div>

        {systems.map((sys) => {
          const Icon = sys.icon;
          const isActive = activeTab === sys.id;
          const isExp = expanded[sys.id];
          const isLocked = sys.featureKey ? !canAccess(sys.featureKey) : false;

          return (
            <div key={sys.id} className="rounded-lg overflow-hidden border border-slate-900 transition-all">
              {/* Primary System Row */}
              <div
                onClick={() => handleSystemClick(sys)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? "bg-cyan-950/50 text-white border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                    : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`${sys.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-mono font-bold tracking-tight flex items-center gap-1.5">
                      <span>{sys.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({sys.hebrew})</span>
                      {isLocked && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-0.5">
                          <Lock size={8} />
                          <span>{sys.minTier?.toUpperCase()}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{sys.title}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Dropdown toggle chevron */}
                  <button
                    onClick={(e) => toggleExpand(sys.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title={isExp ? "Collapse functions" : "Expand functions"}
                  >
                    {isExp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Dropdown Sub-Actions */}
              {isExp && (
                <div className="pl-4 pr-1.5 py-1.5 bg-black/40 border-t border-slate-900/80 space-y-1">
                  {sys.subActions.map((sub) => {
                    const subEffectiveKey = sub.featureKey || sys.featureKey;
                    const subLocked = subEffectiveKey ? !canAccess(subEffectiveKey) : false;

                    return (
                      <div
                        key={sub.id}
                        onClick={(e) => handleSubActionClick(sub, sys, e)}
                        className="group/sub flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-slate-800/60 cursor-pointer transition-all"
                      >
                        <div className="min-w-0 pr-1">
                          <div className="text-[11px] font-mono text-slate-300 group-hover/sub:text-cyan-300 font-medium truncate flex items-center gap-1.5">
                            <span className="text-cyan-500/70 text-[9px]">›</span>
                            <span>{sub.label}</span>
                            {subLocked && <Lock size={9} className="text-amber-400" />}
                          </div>
                          <div className="text-[9px] text-slate-500 leading-tight truncate">
                            {sub.desc}
                          </div>
                        </div>

                        {sub.action && !subLocked && (
                          <span className="shrink-0 text-[9px] font-mono px-1 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                            CALL
                          </span>
                        )}

                        {subLocked && (
                          <span className="shrink-0 text-[8px] font-mono px-1 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                            LOCK
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade Callout if not Enterprise */}
      {user?.tier !== "enterprise" && (
        <div className="p-3 bg-gradient-to-r from-amber-500/10 to-cyan-500/10 border-t border-white/5 mx-2 mb-2 rounded-xl text-xs font-mono">
          <div className="flex items-center justify-between text-white font-bold mb-1">
            <span className="text-[11px] flex items-center gap-1 text-amber-300">
              <Crown size={12} />
              <span>Unlock Sovereign</span>
            </span>
            <Link to="/checkout?plan=enterprise" className="text-[10px] text-cyan-400 hover:underline">
              Upgrade →
            </Link>
          </div>
          <p className="text-[10px] text-slate-400">
            Activate DAAT 9-stage unified pipeline and EMET 1-click master override.
          </p>
        </div>
      )}

      {/* Sidebar Footer with Live Sovereign Status */}
      <div className="p-3 border-t border-cyan-500/20 bg-slate-950 text-xs font-mono">
        <div className="flex items-center justify-between mb-1 text-[11px]">
          <span className="text-slate-400">USER:</span>
          <Link to="/login" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
            <span>{user?.name || "DAMONE_WARD"}</span>
            <UserCheck size={11} className="text-cyan-400" />
          </Link>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ALL SYSTEMS SYNCED</span>
          </span>
          <span className="text-cyan-400">LATENCY &lt;1ms</span>
        </div>
      </div>
    </aside>
  );
}
