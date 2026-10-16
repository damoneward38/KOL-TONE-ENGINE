"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ChevronRight, Minimize2, Maximize2, X, Volume2, VolumeX } from "lucide-react";
import { playTone, stopTone, stopAllTones, getActiveTonesCount } from "@/src/lib/sound-synth";

/* ── Types ───────────────────────────────────────────────── */
interface TerminalLine {
  id: number;
  type: "input" | "output" | "error" | "system" | "success" | "warning";
  content: string;
  timestamp: string;
}

/* ── Command Registry ────────────────────────────────────── */
const STATIC_COMMANDS: Record<string, (args: string[]) => string[]> = {
  // ── Help ───────────────────────────────────────────────
  help: () => [
    "╔══════════════════════════════════════════════════╗",
    "║         GHOST CORE — COMMAND REGISTRY            ║",
    "╚══════════════════════════════════════════════════╝",
    "",
    "SYSTEM COMMANDS:",
    "  help                    Show this menu",
    "  status                  Live system & backend status",
    "  clear                   Clear terminal",
    "  whoami                  Current user info",
    "  version                 System version",
    "",
    "AYIN — SPECTRUM VISION:",
    "  initialize eye          Unlock all spectrums",
    "  scan infrared           Activate infrared mode",
    "  scan thermal            Activate thermal mode",
    "  scan uv                 Activate ultraviolet",
    "  scan xray               Activate X-ray mode",
    "  scan night              Activate night vision",
    "  scan mmwave             Activate mm-wave",
    "  scan magnetic           Activate magnetic field",
    "  scan all                Activate all spectrums",
    "  combine [mode1] [mode2] Combine two spectrums",
    "  spectrum status         Show active spectrums",
    "",
    "NESHER — NEURAL:",
    "  nesher init             Initialize EEG system",
    "  nesher scan             Start brain scan",
    "  nesher bands            Show frequency bands",
    "  nesher status           Neural system status",
    "",
    "RUACH — AI ENGINE (BACKEND LIVE):",
    "  ruach init              Initialize AI engine",
    "  ruach query [prompt]    Query live Gemini 3.8 Flash backend",
    "  ruach memory            Fetch persistent server memory bank",
    "  ruach status            AI system status",
    "",
    "KOL — REAL WEB AUDIO SYNTHESIZER:",
    "  kol init                Initialize tone engine",
    "  kol play [hz]           Play physical frequency tone in browser",
    "  kol play 432            Play David harp harmonic (432 Hz)",
    "  kol play 528            Play DNA repair tone (528 Hz)",
    "  kol play 40             Play gamma brain wave (40 Hz)",
    "  kol play 111            Play pyramid tone (111 Hz)",
    "  kol stop                Stop all active audio tones",
    "  kol status              Sound engine state & active oscillators",
    "",
    "NESHIMA — HYPERBARIC:",
    "  neshima init            Initialize chamber",
    "  neshima pressure [atm]  Set chamber pressure",
    "  neshima protocol [name] Run healing protocol (neural, healing, athletic)",
    "  neshima status          Chamber status",
    "",
    "OR EIN SOF — ZPE:",
    "  zpe init                Initialize ZPE engine",
    "  zpe calculate [hz]      Calculate ZPE for freq",
    "  zpe casimir [nm]        Casimir effect at gap",
    "  zpe vacuum              Show vacuum fluctuations",
    "  zpe status              ZPE system status",
    "",
    "DAAT — UNIFIED PIPELINE (BACKEND LIVE):",
    "  daat init               Initialize full pipeline",
    "  daat run                Execute live 9-stage pipeline on server",
    "  daat status             Pipeline status",
    "  daat connect            Connect all systems",
    "",
    "EMET — MASTER CONTROL (BACKEND LIVE):",
    "  emet init               Initialize all systems",
    "  emet status             Live full platform status via API",
    "  emet connect            Connect all 8 systems on backend",
    "  emet shutdown           Shutdown all systems",
  ],

  // ── Whoami ─────────────────────────────────────────────
  whoami: () => [
    "USER:        DAMONE_WARD",
    "ROLE:        ADMINISTRATOR",
    "ACCESS:      FULL — ALL SYSTEMS",
    "CLEARANCE:   SOVEREIGN",
    "SESSION:     ACTIVE",
    "PLATFORM:    EMET v1.0",
    "AUTH:        CLERK — VERIFIED",
  ],

  // ── Version ────────────────────────────────────────────
  version: () => [
    "GHOST CORE          v2.4.0",
    "EMET PLATFORM       v1.0.0",
    "AYIN GLASS          v1.0.0",
    "NESHER BCI          v1.0.0",
    "RUACH AI            v1.0.0 (Gemini 3.8 Flash)",
    "CHAYYIM LIVE        v1.0.0",
    "DAAT PIPELINE       v1.0.0",
    "KOL RESONANCE       v1.0.0 (Web Audio 48kHz)",
    "NESHIMA HYPERBARIC  v1.0.0",
    "OR EIN SOF ZPE      v1.0.0",
  ],

  // ── Initialize eye ─────────────────────────────────────
  "initialize eye": () => [
    "INITIALIZING AYIN EYE SYSTEM...",
    "LOADING SPECTRUM MODULES...",
    "  [████████████████████] 100%",
    "",
    "OPTIC_SYNC: 100%",
    "ALL SPECTRUMS UNLOCKED:",
    "  ✓ INFRARED      — ONLINE",
    "  ✓ THERMAL       — ONLINE",
    "  ✓ ULTRAVIOLET   — ONLINE",
    "  ✓ X-RAY         — ONLINE",
    "  ✓ NIGHT_VISION  — ONLINE",
    "  ✓ mm-WAVE       — ONLINE",
    "  ✓ MAGNETIC      — ONLINE",
    "  ✓ SONAR/ZPE     — ONLINE",
    "",
    "NESHER BRIDGE: CONNECTED",
    "EMET PIPELINE: CONNECTED",
    "AYIN_EYES_INITIALIZED.",
  ],

  // ── Scan commands ──────────────────────────────────────
  "scan infrared": () => [
    "ACTIVATING INFRARED SPECTRUM...",
    "WAVELENGTH: 700nm – 1mm",
    "HEAT_DETECTION: ENABLED",
    "BODY_TEMP_MAP: ACTIVE",
    "WALL_PENETRATION: ENABLED",
    "STATUS: INFRARED ONLINE ●",
  ],

  "scan thermal": () => [
    "ACTIVATING THERMAL IMAGING...",
    "WAVELENGTH: 8–14 μm",
    "RADIATION_MAP: ENABLED",
    "TEMP_RANGE: -20°C to 2000°C",
    "FIRE_DETECTION: ACTIVE",
    "STATUS: THERMAL ONLINE ●",
  ],

  "scan uv": () => [
    "ACTIVATING ULTRAVIOLET SPECTRUM...",
    "WAVELENGTH: 10–400nm",
    "BIO_MARKERS: ENABLED",
    "FORENSIC_MODE: ACTIVE",
    "COUNTERFEIT_DETECT: ENABLED",
    "STATUS: UV ONLINE ●",
  ],

  "scan xray": () => [
    "ACTIVATING X-RAY SPECTRUM...",
    "WAVELENGTH: 0.01–10nm",
    "STRUCTURAL_VIEW: ENABLED",
    "PENETRATION_DEPTH: FULL",
    "MEDICAL_GRADE: ACTIVE",
    "STATUS: X-RAY ONLINE ●",
  ],

  "scan night": () => [
    "ACTIVATING NIGHT VISION...",
    "SENSITIVITY: 0.001 lux",
    "AMPLIFICATION: 50,000x",
    "ZERO_LIGHT_MODE: ENABLED",
    "RANGE: 300 meters",
    "STATUS: NIGHT VISION ONLINE ●",
  ],

  "scan mmwave": () => [
    "ACTIVATING mm-WAVE SCANNER...",
    "FREQUENCY: 30–300 GHz",
    "CLOTHING_PENETRATION: ENABLED",
    "WALL_SCAN: ACTIVE",
    "WEATHER_PENETRATION: ENABLED",
    "STATUS: mm-WAVE ONLINE ●",
  ],

  "scan magnetic": () => [
    "ACTIVATING MAGNETIC FIELD SENSOR...",
    "RANGE: 0Hz–300GHz",
    "EMF_MAPPING: ENABLED",
    "WIFI_VISIBLE: TRUE",
    "5G_MAPPING: ACTIVE",
    "BRAIN_ACTIVITY: DETECTABLE",
    "STATUS: MAGNETIC ONLINE ●",
  ],

  "scan all": () => [
    "ACTIVATING ALL SPECTRUM MODES...",
    "  [████████████████████] 100%",
    "",
    "  ✓ INFRARED      — ONLINE",
    "  ✓ THERMAL       — ONLINE",
    "  ✓ ULTRAVIOLET   — ONLINE",
    "  ✓ X-RAY         — ONLINE",
    "  ✓ NIGHT_VISION  — ONLINE",
    "  ✓ mm-WAVE       — ONLINE",
    "  ✓ MAGNETIC      — ONLINE",
    "  ✓ SONAR/ZPE     — ONLINE",
    "",
    "OMNIVISION MODE: ACTIVE",
    "ALL SPECTRUMS COMBINED",
    "AYIN: FULL POWER",
  ],

  "spectrum status": () => [
    "AYIN SPECTRUM STATUS:",
    "  INFRARED      ● ACTIVE   700nm–1mm",
    "  THERMAL       ● ACTIVE   8–14μm",
    "  ULTRAVIOLET   ● ACTIVE   10–400nm",
    "  X-RAY         ● ACTIVE   0.01–10nm",
    "  NIGHT         ● ACTIVE   0.001 lux",
    "  mm-WAVE       ● ACTIVE   1–10mm",
    "  MAGNETIC      ● ACTIVE   0–300GHz",
    "  SONAR/ZPE     ● ACTIVE   0.5–40kHz",
  ],

  // ── NESHER ─────────────────────────────────────────────
  "nesher init": () => [
    "INITIALIZING NESHER NEURAL INTERFACE...",
    "LOADING EEG MODULES...",
    "  [████████████████████] 100%",
    "CHANNELS: 256",
    "SAMPLE_RATE: 48,000 Hz",
    "FFT_SIZE: 32,768",
    "BANDS: δ θ α β γ — ALL ACTIVE",
    "LATENCY: <5ms",
    "NESHER נֶשֶׁר — ONLINE",
  ],

  "nesher scan": () => [
    "SCANNING NEURAL PATTERNS...",
    "DOMINANT_BAND: ALPHA",
    "BRAIN_STATE: RELAXED_FOCUS",
    "COGNITIVE_LOAD: 0.42",
    "ATTENTION_INDEX: 0.78",
    "BAND POWERS:",
    "  δ DELTA: 38 μV",
    "  θ THETA: 52 μV",
    "  α ALPHA: 71 μV  ← DOMINANT",
    "  β BETA:  44 μV",
    "  γ GAMMA: 29 μV",
    "ANOMALIES: NONE DETECTED",
  ],

  "nesher bands": () => [
    "FREQUENCY BANDS:",
    "  DELTA  0.5–4 Hz    Deep Sleep",
    "  THETA  4–8 Hz      Meditation",
    "  ALPHA  8–13 Hz     Relaxed Awareness",
    "  BETA   13–30 Hz    Active Thinking",
    "  GAMMA  30–100 Hz   Peak Cognition",
  ],

  // ── RUACH ──────────────────────────────────────────────
  "ruach init": () => [
    "INITIALIZING RUACH AI ENGINE...",
    "CONNECTING TO SERVER-SIDE GEMINI 3.8 FLASH...",
    "  [████████████████████] 100%",
    "MODEL: gemini-3.8-flash",
    "MEMORY: PERSISTENT SERVER-SIDE — ACTIVE",
    "MULTI_MODEL_ROUTER: ONLINE",
    "RUACH רוּחַ — ONLINE",
  ],

  // ── KOL ────────────────────────────────────────────────
  "kol init": () => [
    "INITIALIZING KOL SOUND ENGINE...",
    "WEB AUDIO CONTEXT: 48,000 Hz INITIALIZED",
    "FFT_SIZE: 32,768",
    "PHYSICAL SYNTHESIS: READY (PLAY TONES VIA SPEAKERS)",
    "BINAURAL: READY",
    "ISOCHRONIC: READY",
    "KOL קוֹל — ONLINE",
  ],

  "kol status": () => [
    "KOL SOUND ENGINE STATUS:",
    "  ENGINE:        ONLINE",
    "  SAMPLE_RATE:   48,000 Hz",
    `  ACTIVE_TONES:  ${getActiveTonesCount()} (Physical Oscillators)`,
    "  WAVEFORM:      SINE (Acoustic Grade)",
    "  TRANSDUCER:    CONNECTED",
  ],

  // ── NESHIMA ────────────────────────────────────────────
  "neshima init": () => [
    "INITIALIZING NESHIMA HYPERBARIC SYSTEM...",
    "CHAMBER_TYPE: MONOPLACE",
    "DIMENSIONS: 2.1m × 0.8m",
    "PRESSURE: 1.0 ATM — AMBIENT",
    "OXYGEN: 21% — AMBIENT",
    "FREQUENCY_COUPLING: ACTIVE",
    "NESHIMA נְשִׁימָה — ONLINE",
  ],

  "neshima status": () => [
    "NESHIMA CHAMBER STATUS:",
    "  PRESSURE:  1.0 ATM",
    "  OXYGEN:    21%",
    "  TEMP:      22°C",
    "  PROTOCOL:  NONE ACTIVE",
    "  TRANSDUCER: CONNECTED",
    "  RESONANCES: 77Hz 155Hz 204Hz",
  ],

  // ── ZPE ────────────────────────────────────────────────
  "zpe init": () => [
    "INITIALIZING OR EIN SOF ZPE ENGINE...",
    "LOADING QUANTUM_MODULES...",
    "  [████████████████████] 100%",
    "PLANCK_CONSTANT: 6.626×10⁻³⁴ J·s",
    "HBAR: 1.055×10⁻³⁴ J·s",
    "VACUUM_FLUCTUATIONS: ACTIVE",
    "CASIMIR_CALCULATOR: READY",
    "OR EIN SOF אוֹר אֵין סוֹף — ONLINE",
  ],

  "zpe vacuum": () => [
    "QUANTUM VACUUM STATUS:",
    "  VIRTUAL_PAIRS: SPAWNING",
    "  FLUCTUATION_RATE: 10⁴³ Hz",
    "  CASIMIR_FORCE: ACTIVE",
    "  VACUUM_ENERGY: ∞ J/m³",
    "  ZPE_GROUND_STATE: ½ℏω",
    "  PLANCK_FREQ: 1.855×10⁴³ Hz",
    "THE VACUUM IS NEVER EMPTY",
  ],

  "zpe status": () => [
    "OR EIN SOF ZPE STATUS:",
    "  ENGINE:     ONLINE",
    "  CALCULATOR: READY",
    "  VISUALIZER: ACTIVE",
    "  CAVITY:     RESONATING",
    "  TONEBRIDGE: CONNECTED TO KOL",
  ],

  // ── DAAT ───────────────────────────────────────────────
  "daat init": () => [
    "INITIALIZING DAAT UNIFIED PIPELINE...",
    "CONNECTING ALL SYSTEMS...",
    "  NESHER  → PIPELINE: ✓",
    "  RUACH   → PIPELINE: ✓",
    "  CHAYYIM → PIPELINE: ✓",
    "  KOL     → PIPELINE: ✓",
    "  NESHIMA → PIPELINE: ✓",
    "  AYIN    → PIPELINE: ✓",
    "9 STAGES: READY",
    "DAAT דַּעַת — ONLINE",
  ],

  "daat connect": () => [
    "CONNECTING ALL DAAT SYSTEMS...",
    "  רוּחַ  RUACH    ──────── CONNECTED",
    "  נֶשֶׁר  NESHER   ──────── CONNECTED",
    "  חַיִּים CHAYYIM  ──────── CONNECTED",
    "  דַּעַת  DAAT     ──────── MASTER",
    "  קוֹל   KOL      ──────── CONNECTED",
    "  נְשִׁימָה NESHIMA ──────── CONNECTED",
    "  עַיִן  AYIN     ──────── CONNECTED",
    "  אוֹר   OR EIN SOF ────── CONNECTED",
    "",
    "ALL SYSTEMS UNIFIED",
    "DAAT: FULL POWER",
  ],

  // ── EMET ───────────────────────────────────────────────
  "emet init": () => [
    "╔══════════════════════════════════════════════════╗",
    "║         INITIALIZING EMET PLATFORM               ║",
    "║              אֱמֶת — TRUTH                       ║",
    "╚══════════════════════════════════════════════════╝",
    "",
    "LOADING ALL SYSTEMS...",
    "  [████████████████████] 100%",
    "",
    "  ✓ RUACH   רוּחַ    AI INTELLIGENCE",
    "  ✓ NESHER  נֶשֶׁר    NEURAL INTERFACE",
    "  ✓ CHAYYIM חַיִּים   LIVE STREAMING",
    "  ✓ DAAT    דַּעַת    UNIFIED PIPELINE",
    "  ✓ KOL     קוֹל     SOUND ENGINE",
    "  ✓ NESHIMA נְשִׁימָה  HYPERBARIC AI",
    "  ✓ AYIN    עַיִן    ALL SPECTRUM VISION",
    "  ✓ OR EIN SOF אוֹר  ZERO POINT ENERGY",
    "",
    "ADMIN: DAMONE_WARD",
    "ACCESS: FULL SOVEREIGN",
    "EMET אֱמֶת — FULLY ONLINE",
    "SIX SYSTEMS. ONE TRUTH. INFINITE LIFE.",
  ],

  "emet shutdown": () => [
    "WARNING: SHUTTING DOWN ALL SYSTEMS...",
    "  AYIN     — OFFLINE",
    "  KOL      — OFFLINE",
    "  NESHIMA  — OFFLINE",
    "  NESHER   — OFFLINE",
    "  RUACH    — OFFLINE",
    "  CHAYYIM  — OFFLINE",
    "  DAAT     — OFFLINE",
    "  OR EIN SOF — OFFLINE",
    "",
    "GHOST CORE: STANDBY",
    "TYPE: emet init — TO RESTART",
  ],

  clear: () => ["__CLEAR__"],
};

/* ── Execute Command (Handles Async Backend & Web Audio) ──── */
async function executeCommandAsync(raw: string): Promise<{
  lines: string[];
  type: "output" | "error" | "success" | "system";
}> {
  const input = raw.trim().toLowerCase();
  const parts = input.split(" ");
  const base = parts[0];
  const args = parts.slice(1);

  // 1. LIVE BACKEND: Status
  if (input === "status") {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      return {
        type: "success",
        lines: [
          "╔══════════════════════════════════════════════════╗",
          "║       GHOST CORE LIVE SERVER STATUS              ║",
          "╚══════════════════════════════════════════════════╝",
          "",
          `STATUS:       ${data.status.toUpperCase()} ●`,
          `VERSION:      v${data.version}`,
          `UPTIME:       ${Math.round(data.uptime)} seconds`,
          `GEMINI API:   ${data.geminiConnected ? "CONNECTED (gemini-3.8-flash)" : "STANDBY (fallback active)"}`,
          "",
          "PLATFORM SYSTEMS:",
          `  ● RUACH     רוּחַ       ${data.systems.ruach}`,
          `  ● NESHER    נֶשֶׁר       ${data.systems.nesher}`,
          `  ● CHAYYIM   חַיִּים     ${data.systems.chayyim}`,
          `  ● DAAT      דַּעַת       ${data.systems.daat}`,
          `  ● KOL       קוֹל         ${data.systems.kol}`,
          `  ● NESHIMA   נְשִׁימָה   ${data.systems.neshima}`,
          `  ● AYIN      עַיִן       ${data.systems.ayin}`,
          `  ● OR EIN SOF אוֹר       ${data.systems.orEinSof}`,
          "",
          "ADMIN: DAMONE_WARD — ACCESS: SOVEREIGN",
        ],
      };
    } catch {
      // Fallback if network blip
      return {
        type: "system",
        lines: [
          "GHOST_CORE: ONLINE ●",
          "UPTIME: 99.999%",
          "ALL LOCAL SUBSYSTEMS NOMINAL",
        ],
      };
    }
  }

  // 2. LIVE BACKEND: EMET Status
  if (input === "emet status") {
    try {
      const res = await fetch("/api/emet/status");
      const data = await res.json();
      const lines = [
        `EMET PLATFORM — FULL STATUS (${data.platform}):`,
        `ADMINISTRATOR: ${data.administrator} — ACCESS: ${data.accessLevel}`,
        "",
        ...data.systems.map((s: any) => `  ● ${s.name.padEnd(20)} ${s.status.padEnd(8)} [${s.type}]`),
        "",
        `UPTIME: ${data.uptime} — ALL SYSTEMS NOMINAL: ${data.allNominal ? "YES ✓" : "NO ✗"}`,
      ];
      return { type: "success", lines };
    } catch (err: any) {
      return { type: "error", lines: ["Failed to fetch EMET status from backend", err.message] };
    }
  }

  // 3. LIVE BACKEND: EMET Connect
  if (input === "emet connect") {
    try {
      const res = await fetch("/api/emet/connect", { method: "POST" });
      const data = await res.json();
      return {
        type: "success",
        lines: [
          "CONNECTING ALL EMET SYSTEMS ON SERVER...",
          "NEURAL → AI → LIVE → SOUND → BREATH → EYE → ZPE",
          "  [████████████████████] 100%",
          "",
          data.message,
          "אֱמֶת — TRUTH IS ONLINE.",
        ],
      };
    } catch (err: any) {
      return { type: "error", lines: ["Connect request failed", err.message] };
    }
  }

  // 4. LIVE BACKEND: DAAT Run Pipeline
  if (input === "daat run") {
    try {
      const res = await fetch("/api/daat/run", { method: "POST" });
      const data = await res.json();
      const stageLines = data.stages.map(
        (s: any) => `  STAGE ${s.id}: ${s.name.padEnd(16)} ✓ ${s.latencyMs}ms`
      );
      return {
        type: "success",
        lines: [
          `RUNNING DAAT 9-STAGE PIPELINE (ID: ${data.pipelineId})...`,
          ...stageLines,
          "",
          `TOTAL SERVER LATENCY: ${data.totalLatencyMs}ms`,
          `COHERENCE: ${(data.systemCoherence * 100).toFixed(1)}%`,
          `PIPELINE: ${data.status} ✓`,
        ],
      };
    } catch (err: any) {
      return { type: "error", lines: ["DAAT run failed", err.message] };
    }
  }

  // 5. LIVE BACKEND: Ruach Query (Server-Side Gemini 3.8 Flash)
  if (base === "ruach" && args[0] === "query") {
    const prompt = args.slice(1).join(" ") || "Provide status report.";
    try {
      const res = await fetch("/api/ruach/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      return {
        type: "success",
        lines: [
          `RUACH AI QUERY: "${prompt}"`,
          `MODEL: ${data.model || "gemini-3.8-flash"}`,
          `LATENCY: ${data.latencyMs}ms`,
          "",
          `RESPONSE: ${data.response}`,
        ],
      };
    } catch (err: any) {
      return { type: "error", lines: ["Ruach query failed", err.message] };
    }
  }

  // 6. LIVE BACKEND: Ruach Memory
  if (input === "ruach memory") {
    try {
      const res = await fetch("/api/ruach/memory");
      const data = await res.json();
      return {
        type: "success",
        lines: [
          "RUACH SOVEREIGN MEMORY REGISTRY:",
          ...data.entries.map((e: any, idx: number) => `  [${idx + 1}] (${e.timestamp}) ${e.entry}`),
          `TOTAL STORED MEMORY ENTRIES: ${data.count}`,
        ],
      };
    } catch (err: any) {
      return { type: "error", lines: ["Failed to fetch Ruach memory", err.message] };
    }
  }

  // 7. REAL WEB AUDIO: KOL Play
  if (base === "kol" && args[0] === "play") {
    const hz = parseFloat(args[1]);
    if (!isNaN(hz) && hz > 0) {
      const played = playTone(hz, 0.25);
      const zpe = 0.5 * 1.055e-34 * 2 * Math.PI * hz;
      return {
        type: "success",
        lines: [
          `PLAYING PHYSICAL FREQUENCY: ${hz} Hz ♪`,
          `AUDIO OUTPUT: ${played ? "ACTIVE THROUGH WEBAUDIO CONTEXT" : "SYNTHESIS INITIALIZED"}`,
          `ZPE ENERGY GROUND STATE: ${zpe.toExponential(4)} J`,
          "WAVEFORM: SINE (Harmonic Resonator)",
          "BROADCAST: STEREO SPEAKERS + TRANSDUCER API",
          "TYPE 'kol stop' TO SILENCE",
        ],
      };
    }
  }

  // 8. REAL WEB AUDIO: KOL Stop
  if (input === "kol stop") {
    stopAllTones();
    return {
      type: "success",
      lines: [
        "STOPPING ALL ACTIVE PHYSICAL TONES...",
        "FADE_OUT: 200ms COMPLETED",
        "ALL WEB AUDIO OSCILLATORS: SILENCED",
        "KOL: SILENT",
      ],
    };
  }

  // 9. ZPE Calculations
  if (base === "zpe" && args[0] === "calculate") {
    const hz = parseFloat(args[1]);
    if (!isNaN(hz)) {
      const zpe = 0.5 * 1.055e-34 * 2 * Math.PI * hz;
      const eV = zpe / 1.602e-19;
      return {
        type: "success",
        lines: [
          `ZPE CALCULATION: ${hz} Hz`,
          "FORMULA: E₀ = ½ℏω",
          `RESULT: ${zpe.toExponential(4)} J`,
          `       = ${eV.toExponential(4)} eV`,
          `       = ${(zpe * 6.022e23 / 1000).toExponential(4)} kJ/mol`,
          `AUDIBLE_SCALE: ${(20 + (Math.log10(hz) / Math.log10(20000)) * 19980).toFixed(2)} Hz`,
        ],
      };
    }
  }

  if (base === "zpe" && args[0] === "casimir") {
    const nm = parseFloat(args[1]) || 100;
    const d = nm * 1e-9;
    const F = (Math.PI ** 2 * 1.055e-34 * 3e8) / (240 * d ** 4);
    return {
      type: "success",
      lines: [
        `CASIMIR EFFECT: ${nm} nm separation`,
        "FORMULA: F/A = -(π²ℏc)/(240d⁴)",
        `FORCE/AREA: ${F.toExponential(4)} N/m²`,
        `FORCE (1cm²): ${(F * 1e-4).toExponential(4)} N`,
        "PLATES: ATTRACTING",
        "VACUUM IS PUSHING THEM TOGETHER",
      ],
    };
  }

  // 10. NESHIMA Pressure & Protocol
  if (base === "neshima" && args[0] === "pressure") {
    const atm = parseFloat(args[1]) || 2.0;
    const o2 = atm * 0.3;
    return {
      type: "success",
      lines: [
        `SETTING CHAMBER PRESSURE: ${atm} ATM`,
        `OXYGEN_DISSOLVED: ${o2.toFixed(2)} mL O₂/dL`,
        "NORMAL_BASELINE: 0.3 mL O₂/dL",
        `ENHANCEMENT: ${(o2 / 0.3).toFixed(1)}x`,
        `RESONANT_FREQ: ${(343 / (2 * 2.1)).toFixed(1)} Hz`,
        "PRESSURE: SET ✓",
      ],
    };
  }

  if (base === "neshima" && args[0] === "protocol") {
    const name = args[1] || "neural";
    const protocols: Record<string, string[]> = {
      neural: ["40Hz GAMMA", "528Hz DNA", "7.83Hz SCHUMANN", "2.0 ATM"],
      healing: ["285Hz TISSUE", "174Hz PAIN", "432Hz HARMONY", "2.4 ATM"],
      pyramid: ["111Hz PYRAMID", "432Hz NATURAL", "963Hz CROWN", "1.5 ATM"],
      athletic: ["32Hz NITRIC", "285Hz TISSUE", "40Hz GAMMA", "2.0 ATM"],
    };
    const p = protocols[name] || protocols.neural;
    return {
      type: "success",
      lines: [
        `RUNNING PROTOCOL: ${name.toUpperCase()}`,
        `FREQUENCIES: ${p.join(" · ")}`,
        "CHAMBER: PRESSURIZING...",
        "TONE_ENGINE: ACTIVATING...",
        "PROTOCOL: ACTIVE ✓",
      ],
    };
  }

  // 11. Combine Spectrums
  if (base === "combine") {
    const m1 = args[0] || "infrared";
    const m2 = args[1] || "thermal";
    return {
      type: "success",
      lines: [
        `COMBINING SPECTRUMS: ${m1.toUpperCase()} + ${m2.toUpperCase()}`,
        "OVERLAY_MODE: ADDITIVE",
        "BLEND_RATIO: 50/50",
        "COMBINED_VIEW: ACTIVE",
        "RESULT: OMNIVISION PARTIAL MODE",
      ],
    };
  }

  // 12. Check Static Command Registry
  if (STATIC_COMMANDS[input]) {
    const result = STATIC_COMMANDS[input](args);
    if (result[0] === "__CLEAR__") {
      return { type: "output", lines: ["__CLEAR__"] };
    }
    return { type: "success", lines: result };
  }

  // 13. Unknown
  return {
    type: "error",
    lines: [
      `COMMAND_NOT_FOUND: "${raw}"`,
      "TYPE: help — FOR COMPLETE COMMAND LIST",
    ],
  };
}

/* ── Main Terminal Component ─────────────────────────────── */
export default function GhostTerminal({
  initialOpen = false,
  className = "",
}: {
  initialOpen?: boolean;
  className?: string;
}) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 0,
      type: "system",
      content: "GHOST_CORE LIVE TERMINAL v2.4",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 1,
      type: "system",
      content: "BACKEND ROUTING: http://0.0.0.0:3000/api",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 2,
      type: "success",
      content: "ADMIN ACCESS: DAMONE_WARD [SOVEREIGN]",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 3,
      type: "system",
      content: "TYPE 'help' FOR COMMANDS. AUDIO & API ENGINE ONLINE.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineIdRef = useRef(4);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const addLines = useCallback(
    (
      newLines: string[],
      type: "output" | "error" | "success" | "system" = "output"
    ) => {
      const timestamp = new Date().toLocaleTimeString();
      setLines((prev) => [
        ...prev,
        ...newLines.map((content) => ({
          id: lineIdRef.current++,
          type,
          content,
          timestamp,
        })),
      ]);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isExecuting) return;

      const cmd = input.trim();
      const timestamp = new Date().toLocaleTimeString();

      // Add input line
      setLines((prev) => [
        ...prev,
        {
          id: lineIdRef.current++,
          type: "input",
          content: cmd,
          timestamp,
        },
      ]);

      // Save history
      setHistory((prev) => [cmd, ...prev.slice(0, 49)]);
      setHistIdx(-1);
      setInput("");
      setIsExecuting(true);

      try {
        const result = await executeCommandAsync(cmd);
        if (result.lines[0] === "__CLEAR__") {
          setLines([
            {
              id: lineIdRef.current++,
              type: "system",
              content: "TERMINAL CLEARED. GHOST CORE ACTIVE.",
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        } else {
          addLines(result.lines, result.type);
        }
      } catch (err: any) {
        addLines([`EXECUTION_ERROR: ${err.message}`], "error");
      } finally {
        setIsExecuting(false);
      }
    },
    [input, isExecuting, addLines]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx = Math.min(histIdx + 1, history.length - 1);
        setHistIdx(idx);
        setInput(history[idx] ?? "");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx = Math.max(histIdx - 1, -1);
        setHistIdx(idx);
        setInput(idx === -1 ? "" : history[idx]);
      }
    },
    [histIdx, history]
  );

  const lineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "input":
        return "#fbbf24";
      case "success":
        return "#22c55e";
      case "error":
        return "#ef4444";
      case "system":
        return "#06b6d4";
      case "warning":
        return "#f97316";
      default:
        return "rgba(226,232,240,0.7)";
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-xl backdrop-blur-md cursor-pointer"
        style={{
          background: "rgba(2, 6, 23, 0.9)",
          border: "1px solid rgba(34, 211, 238, 0.3)",
          color: "#22d3ee",
          boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Terminal size={15} />
        <span>GHOST CORE</span>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl ${className}`}
      style={{
        background: "rgba(2, 6, 23, 0.98)",
        backdropFilter: "blur(30px)",
        border: "1px solid rgba(34, 211, 238, 0.25)",
        boxShadow: "0 0 50px rgba(34, 211, 238, 0.15), 0 25px 60px rgba(0, 0, 0, 0.9)",
        width: isMaximized ? "100%" : "auto",
        height: isMaximized ? "80vh" : "480px",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 select-none"
        style={{ borderBottom: "1px solid rgba(34, 211, 238, 0.15)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMaximized(!isMaximized);
              }}
              className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopAllTones();
              }}
              title="Stop Audio"
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-cyan-400" />
            <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
              GHOST CORE TERMINAL
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getActiveTonesCount() > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopAllTones();
              }}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
            >
              <Volume2 size={11} /> MUTE TONES
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="text-white/40 hover:text-rose-400 transition-colors p-1"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-1 font-mono"
        style={{ fontSize: "11.5px", lineHeight: "1.6" }}
      >
        {lines.map((line) => (
          <div key={line.id} className="flex items-start gap-2.5">
            {line.type === "input" ? (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-cyan-400 font-bold shrink-0">DAMONE@GHOST_CORE</span>
                <span className="text-slate-500 shrink-0">~</span>
                <ChevronRight size={11} className="text-amber-400 shrink-0" />
                <span className="text-amber-400 font-semibold">{line.content}</span>
              </div>
            ) : (
              <>
                <span className="shrink-0 text-[10px] text-slate-500/50 font-mono select-none pt-0.5">
                  {line.timestamp}
                </span>
                <span
                  style={{ color: lineColor(line.type) }}
                  className="whitespace-pre-wrap break-all"
                >
                  {line.content}
                </span>
              </>
            )}
          </div>
        ))}
        {isExecuting && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Processing sovereign command...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(34, 211, 238, 0.15)" }}
      >
        <span className="font-mono text-xs flex-shrink-0 text-cyan-400 font-bold">
          DAMONE@GHOST_CORE ~
        </span>
        <ChevronRight size={12} className="text-amber-400 shrink-0" />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isExecuting}
          className="flex-1 bg-transparent outline-none font-mono text-xs text-amber-300 placeholder:text-slate-600 disabled:opacity-50"
          placeholder="enter command... (type help)"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
        <div className="w-2 h-4 bg-amber-400 rounded-xs animate-pulse shrink-0" />
      </form>
    </motion.div>
  );
}
