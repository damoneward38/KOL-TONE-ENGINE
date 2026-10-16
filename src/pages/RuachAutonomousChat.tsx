"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Database, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Sliders,
  Layers,
  Activity,
  Bot
} from "lucide-react";
import { playTone, stopAllTones } from "@/src/lib/sound-synth";

interface ChatMessage {
  id: string;
  sender: "user" | "ruach";
  text: string;
  timestamp: string;
  latencyMs?: number;
  model?: string;
  actionExecuted?: {
    type: string;
    description: string;
    system: string;
  };
}

export default function RuachAutonomousChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_1",
      sender: "ruach",
      text: "RUACH רוּחַ Sovereign AI Intelligence initialized. Full autonomous awareness of AYIN Spectrums, NESHER Neural BCI, KOL Sound Synthesizer, NESHIMA Hyperbaric Chamber, and OR EIN SOF ZPE Engine active. Awaiting sovereign directive.",
      timestamp: new Date().toLocaleTimeString(),
      model: "gemini-3.8-flash",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [memoryBank, setMemoryBank] = useState<any[]>([]);
  const [showMemory, setShowMemory] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load initial memory entries
  useEffect(() => {
    loadMemory();
  }, []);

  const loadMemory = async () => {
    try {
      const res = await fetch("/api/ruach/memory");
      const data = await res.json();
      if (data.entries) setMemoryBank(data.entries);
    } catch {}
  };

  // Text-To-Speech Function
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Speech-To-Text (Microphone) using Web Speech API
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition not supported in this browser environment.");
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setInputPrompt(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setSpeechError(err.message || "Failed to start microphone");
        setIsListening(false);
      }
    }
  };

  // Autonomous Action Parser & Dispatcher
  const executeAutonomousAction = (promptText: string) => {
    const lower = promptText.toLowerCase();

    // 1. KOL Tone Synthesizer commands
    if (lower.includes("play 432") || lower.includes("david")) {
      playTone(432, 0.25, "sine", "David's Harp (432 Hz)");
      return { type: "KOL_AUDIO_TRIGGER", description: "Activated 432 Hz David's Harp acoustic resonance tone", system: "KOL קוֹל" };
    }
    if (lower.includes("play 528") || lower.includes("dna")) {
      playTone(528, 0.25, "sine", "DNA Repair (528 Hz)");
      return { type: "KOL_AUDIO_TRIGGER", description: "Activated 528 Hz DNA Repair transformation frequency", system: "KOL קוֹל" };
    }
    if (lower.includes("play 40") || lower.includes("gamma")) {
      playTone(40, 0.35, "sine", "Gamma Brainwave (40 Hz)");
      return { type: "KOL_AUDIO_TRIGGER", description: "Activated 40 Hz Gamma brainwave neural binding tone", system: "KOL קוֹל" };
    }
    if (lower.includes("stop sound") || lower.includes("stop tone") || lower.includes("silence")) {
      stopAllTones();
      return { type: "KOL_AUDIO_STOP", description: "Silenced all active tone generators", system: "KOL קוֹל" };
    }

    // 2. NESHIMA Hyperbaric commands
    if (lower.includes("pressure") || lower.includes("atm")) {
      const match = lower.match(/(\d+(\.\d+)?)\s*atm/);
      const atm = match ? parseFloat(match[1]) : 2.0;
      fetch("/api/neshima/pressure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pressure: atm }),
      });
      return { type: "NESHIMA_PRESSURE_SET", description: `Chamber pressurized to ${atm} ATM (${Math.round((atm-1)*33)} ft sea depth)`, system: "NESHIMA נְשִׁימָה" };
    }
    if (lower.includes("tissue protocol") || lower.includes("healing protocol")) {
      fetch("/api/neshima/protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolName: "tissue" }),
      });
      return { type: "NESHIMA_PROTOCOL_ENGAGE", description: "Engaged Tissue Regeneration Protocol: 2.0 ATM, 100% O2, 90 mins", system: "NESHIMA נְשִׁימָה" };
    }

    // 3. AYIN Spectrum commands
    if (lower.includes("unlock eye") || lower.includes("initialize eye")) {
      fetch("/api/ayin/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "all" }) });
      return { type: "AYIN_SPECTRUM_UNLOCK", description: "Unlocked all 8 electro-optical spectrums at 100% optic sync", system: "AYIN עַיִן" };
    }
    if (lower.includes("thermal")) {
      fetch("/api/ayin/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "thermal" }) });
      return { type: "AYIN_SPECTRUM_CHANGE", description: "Switched AYIN sensor array to FLIR Differential Thermal", system: "AYIN עַיִן" };
    }

    // 4. DAAT Pipeline command
    if (lower.includes("run daat") || lower.includes("run pipeline") || lower.includes("daat run")) {
      fetch("/api/daat/run", { method: "POST" });
      return { type: "DAAT_PIPELINE_RUN", description: "Dispatched DAAT 9-Stage Unified Real-Time Execution Pipeline", system: "DAAT דַּעַת" };
    }

    // 5. NESHER EEG Scan
    if (lower.includes("brain scan") || lower.includes("eeg scan")) {
      fetch("/api/nesher/scan", { method: "POST" });
      return { type: "NESHER_BRAIN_SCAN", description: "Executed 256-channel neural band scan with 48kHz sampling", system: "NESHER נֶשֶׁר" };
    }

    return undefined;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isQuerying) return;

    setInputPrompt("");
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsQuerying(true);

    // Autonomous action trigger evaluation
    const actionResult = executeAutonomousAction(query);

    try {
      const res = await fetch("/api/ruach/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();

      const ruachMsg: ChatMessage = {
        id: `ruach_${Date.now()}`,
        sender: "ruach",
        text: data.response || "Command processed under sovereign parameters.",
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: data.latencyMs,
        model: data.model,
        actionExecuted: actionResult,
      };

      setMessages((prev) => [...prev, ruachMsg]);

      // Speak aloud if autoSpeak enabled
      if (autoSpeak) {
        speakText(ruachMsg.text);
      }

      loadMemory();
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `ruach_${Date.now()}`,
        sender: "ruach",
        text: `RUACH offline fallback: "${query}" registered. Systems synchronized with sovereign consensus.`,
        timestamp: new Date().toLocaleTimeString(),
        actionExecuted: actionResult,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (autoSpeak) speakText(fallbackMsg.text);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] space-y-4">
      {/* Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  RUACH <span className="text-cyan-400">רוּחַ</span> — SOVEREIGN AI & AUTONOMOUS COMMAND
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  FULL AUTONOMY
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Connected to Gemini 3.8 Flash with live cross-system execution across all 8 EMET modules.
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls: Auto-Speak toggle, Memory toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (autoSpeak) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all ${
              autoSpeak
                ? "bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                : "bg-slate-900 text-slate-400 border-slate-700"
            }`}
            title="Toggle autonomous speech readout"
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{autoSpeak ? "SPEAKER: ON" : "SPEAKER: MUTED"}</span>
          </button>

          <button
            onClick={() => setShowMemory(!showMemory)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all ${
              showMemory
                ? "bg-purple-950 text-purple-300 border-purple-500/50"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-purple-500"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MEMORY BANK ({memoryBank.length})</span>
          </button>
        </div>
      </div>

      {/* Main Chat Body: Flex-1 Full Page View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Left 3 Cols: Expansive Chat Feed & Input */}
        <div className={`flex flex-col rounded-xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur shadow-2xl overflow-hidden ${
          showMemory ? "lg:col-span-3" : "lg:col-span-4"
        }`}>
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    msg.sender === "user"
                      ? "bg-slate-800 text-slate-200 border border-slate-700"
                      : "bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  }`}
                >
                  {msg.sender === "user" ? "DW" : "רוּחַ"}
                </div>

                <div className="space-y-1.5">
                  <div
                    className={`p-3.5 rounded-xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700"
                        : "bg-slate-900/90 text-slate-200 rounded-tl-none border border-cyan-500/30 font-sans"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Autonomous Action Badge if executed */}
                    {msg.actionExecuted && (
                      <div className="mt-2.5 p-2 rounded bg-black/60 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                        <div>
                          <span className="font-bold uppercase">AUTONOMOUS ACTION EXECUTED [{msg.actionExecuted.system}]: </span>
                          <span>{msg.actionExecuted.description}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Meta Info */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 px-1">
                    <span>{msg.timestamp}</span>
                    {msg.latencyMs && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400">{msg.latencyMs}ms</span>
                      </>
                    )}
                    {msg.model && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400">{msg.model}</span>
                      </>
                    )}
                    {msg.sender === "ruach" && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="ml-auto text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Read message aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Speak</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isQuerying && (
              <div className="flex gap-3 max-w-xl mr-auto">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/50 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin text-cyan-400" />
                </div>
                <div className="p-3.5 rounded-xl rounded-tl-none bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>RUACH synthesizing neural matrix & cross-system awareness...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Command Bar */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
            <span className="text-slate-500 shrink-0">QUICK ACTIONS:</span>
            <button
              onClick={() => handleSendMessage("Play 528 Hz DNA repair tone and show frequency harmonics")}
              className="px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-cyan-900 hover:border-cyan-500 shrink-0"
            >
              🎵 Play 528 Hz Tone
            </button>
            <button
              onClick={() => handleSendMessage("Set hyperbaric chamber pressure to 2.4 ATM for neuroplasticity")}
              className="px-2 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-900 hover:border-emerald-500 shrink-0"
            >
              🫁 Set Chamber to 2.4 ATM
            </button>
            <button
              onClick={() => handleSendMessage("Run full DAAT 9-stage pipeline and measure coherence")}
              className="px-2 py-1 rounded bg-slate-800 text-purple-300 border border-purple-900 hover:border-purple-500 shrink-0"
            >
              ⚡ Run DAAT Pipeline
            </button>
            <button
              onClick={() => handleSendMessage("Initialize eye and unlock all 8 optical spectrums")}
              className="px-2 py-1 rounded bg-slate-800 text-amber-300 border border-amber-900 hover:border-amber-500 shrink-0"
            >
              👁️ Unlock AYIN Spectrums
            </button>
          </div>

          {/* Chat Input Bar with Microphone & Send */}
          <div className="p-3 border-t border-cyan-500/30 bg-slate-950 flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-lg border transition-all ${
                isListening
                  ? "bg-red-600 text-white border-red-400 animate-pulse shadow-[0_0_15px_#ef4444]"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500"
              }`}
              title={isListening ? "Listening... Click to stop" : "Speak via Microphone"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={isListening ? "Listening... Speak your command now..." : "Ask RUACH anything or command any system (e.g. 'Play 432Hz', 'Set pressure 2.0 ATM')..."}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputPrompt.trim() || isQuerying}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>SEND</span>
            </button>
          </div>

          {speechError && (
            <div className="px-4 py-1.5 bg-red-950/80 border-t border-red-500/40 text-red-300 text-xs font-mono">
              {speechError}
            </div>
          )}
        </div>

        {/* Right 1 Col: Memory Bank Drawer */}
        {showMemory && (
          <div className="rounded-xl border border-purple-500/30 bg-slate-950/90 p-4 space-y-3 overflow-y-auto max-h-[640px]">
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-mono font-bold text-purple-200">RUACH MEMORY</h3>
              </div>
              <button
                onClick={loadMemory}
                className="text-slate-400 hover:text-white"
                title="Refresh Memory"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {memoryBank.map((mem) => (
                <div key={mem.id} className="p-2.5 rounded bg-purple-950/20 border border-purple-900/40">
                  <div className="text-[10px] text-purple-400 mb-1">{mem.timestamp}</div>
                  <div className="text-slate-300 leading-snug">{mem.entry}</div>
                </div>
              ))}
              {memoryBank.length === 0 && (
                <div className="text-slate-500 text-xs py-4 text-center">
                  Memory bank empty. Execute queries to record persistent entries.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
