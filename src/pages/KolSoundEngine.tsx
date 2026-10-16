"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Radio, 
  Disc, 
  Download, 
  Sparkles, 
  Activity, 
  Layers, 
  Sliders, 
  Music,
  Waves,
  RefreshCw
} from "lucide-react";
import { 
  playTone, 
  stopTone, 
  stopAllTones, 
  getActiveTones, 
  subscribeSoundEngine, 
  setMasterVolume, 
  getMasterVolume, 
  getAnalyserNode,
  startToneRecording,
  stopToneRecording,
  isRecordingAudio,
  SACRED_FREQUENCIES
} from "@/src/lib/sound-synth";

export default function KolSoundEngine() {
  const [activeTones, setActiveTones] = useState(getActiveTones());
  const [volume, setVolume] = useState(getMasterVolume());
  const [isMuted, setIsMuted] = useState(false);
  const [selectedWaveform, setSelectedWaveform] = useState<OscillatorType>("sine");
  const [customHz, setCustomHz] = useState<number>(432);
  const [gainLevel, setGainLevel] = useState<number>(0.3);

  // Binaural Beat generator state
  const [binauralLeft, setBinauralLeft] = useState<number>(432);
  const [binauralRight, setBinauralRight] = useState<number>(440);
  const [binauralActive, setBinauralActive] = useState<boolean>(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const unsub = subscribeSoundEngine(() => {
      setActiveTones(getActiveTones());
      setIsRecording(isRecordingAudio());
    });
    return () => unsub();
  }, []);

  // Recording timer
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      setRecordDuration(0);
      timer = setInterval(() => setRecordDuration((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Large Real-time Oscilloscope & Spectrum Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = getAnalyserNode();

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (!analyser || activeTones.length === 0) {
        // Flat center line
        ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        return;
      }

      // Draw Time-Domain Waveform
      const bufferLength = analyser.frequencyBinCount;
      const timeData = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(timeData);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#00f0ff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 10;
      ctx.beginPath();

      const sliceWidth = (w * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Spectrum FFT Bars at the bottom
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);

      const barWidth = (w / 128);
      for (let i = 0; i < 128; i++) {
        const barHeight = (freqData[i] / 255) * (h * 0.4);
        const bx = i * barWidth;
        const by = h - barHeight;

        ctx.fillStyle = `rgba(0, 240, 255, ${0.15 + (freqData[i] / 255) * 0.4})`;
        ctx.fillRect(bx, by, barWidth - 1, barHeight);
      }
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeTones.length]);

  const handlePlayCustom = () => {
    playTone(customHz, gainLevel, selectedWaveform, `CUSTOM ${customHz} Hz`);
  };

  const handleTogglePreset = (hz: number, name: string) => {
    if (activeTones.some((t) => t.hz === hz)) {
      stopTone(hz);
    } else {
      playTone(hz, gainLevel, selectedWaveform, name);
    }
  };

  const handleToggleBinaural = () => {
    if (binauralActive) {
      stopTone(binauralLeft);
      stopTone(binauralRight);
      setBinauralActive(false);
    } else {
      playTone(binauralLeft, gainLevel, "sine", `BINAURAL LEFT (${binauralLeft}Hz)`);
      playTone(binauralRight, gainLevel, "sine", `BINAURAL RIGHT (${binauralRight}Hz)`);
      setBinauralActive(true);
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      const blob = await stopToneRecording();
      if (blob) {
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
      }
    } else {
      setRecordedAudioUrl(null);
      startToneRecording();
    }
  };

  const binauralDelta = Math.abs(binauralRight - binauralLeft);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Music className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                  KOL <span className="text-cyan-400">קוֹל</span> — HARMONIC TONE SYNTHESIZER & AUDIO RECORDER
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  REAL WEB AUDIO 48kHz
                </span>
              </div>
              <p className="text-sm text-slate-400">
                True acoustic sine wave synthesis, Solfeggio scale harmonics, binaural beat entrainment, and live audio recording.
              </p>
            </div>
          </div>
        </div>

        {/* Master Controls */}
        <div className="flex items-center gap-2.5">
          {activeTones.length > 0 ? (
            <button
              onClick={() => stopAllTones()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/50 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP ALL TONES ({activeTones.length})</span>
            </button>
          ) : (
            <button
              onClick={() => playTone(432, gainLevel, selectedWaveform, "David's Harp (432 Hz)")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/50 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>INITIALIZE 432 Hz TONE</span>
            </button>
          )}

          <button
            onClick={handleRecordToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
              isRecording
                ? "bg-red-600 text-white border-red-500 animate-pulse shadow-[0_0_15px_#ef4444]"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-red-500"
            }`}
          >
            <Disc className={`w-3.5 h-3.5 ${isRecording ? "animate-spin" : ""}`} />
            <span>{isRecording ? `REC (${recordDuration}s)` : "RECORD AUDIO"}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Oscilloscope & Custom Synth Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Oscilloscope Canvas */}
          <div className="rounded-xl border border-cyan-500/30 bg-black/90 p-3 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-cyan-500/20 text-xs font-mono text-cyan-300">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>ACOUSTIC WAVEFORM & FREQUENCY SPECTRUM (TIME + FFT)</span>
              </div>
              <span className="text-slate-400">
                ACTIVE TONES: <strong className="text-cyan-400">{activeTones.length}</strong>
              </span>
            </div>
            <canvas ref={canvasRef} width={800} height={340} className="w-full h-[320px] bg-slate-950/80 rounded" />
          </div>

          {/* Master Tone Generator Panel */}
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                FREQUENCY GENERATOR & WAVEFORM ENGINE
              </h3>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-xs font-mono">
                {(["sine", "triangle", "sawtooth", "square"] as OscillatorType[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWaveform(w)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      selectedWaveform === w ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency input and fine-tuner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">DIRECT FREQUENCY (Hz)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0.1}
                    max={20000}
                    step={0.1}
                    value={customHz}
                    onChange={(e) => setCustomHz(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-base font-mono font-bold text-cyan-300 focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">Hz</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  OCTAVE SHIFT / FINE ADJUST
                </label>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    onClick={() => setCustomHz((h) => +(h / 2).toFixed(2))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                    title="Octave Down (/2)"
                  >
                    /2
                  </button>
                  <button
                    onClick={() => setCustomHz((h) => Math.max(0.1, +(h - 1).toFixed(2)))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                  >
                    -1Hz
                  </button>
                  <button
                    onClick={() => setCustomHz((h) => +(h + 1).toFixed(2))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                  >
                    +1Hz
                  </button>
                  <button
                    onClick={() => setCustomHz((h) => +(h * 2).toFixed(2))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                    title="Octave Up (*2)"
                  >
                    x2
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">AMPLITUDE GAIN ({Math.round(gainLevel * 100)}%)</label>
                <input
                  type="range"
                  min={0.01}
                  max={0.8}
                  step={0.01}
                  value={gainLevel}
                  onChange={(e) => setGainLevel(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayCustom}
                className="flex-1 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/50 rounded-lg font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              >
                PLAY {customHz} Hz TONE
              </button>
              {activeTones.some((t) => t.hz === customHz) && (
                <button
                  onClick={() => stopTone(customHz)}
                  className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/50 rounded-lg font-mono text-xs font-bold"
                >
                  STOP {customHz}Hz
                </button>
              )}
            </div>
          </div>

          {/* Binaural Beat Generator Box */}
          <div className="p-4 rounded-xl border border-purple-500/20 bg-slate-900/40 backdrop-blur space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-mono font-bold text-slate-200">
                  BINAURAL BEAT ENTRAINMENT ENGINE
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-300">
                Brainwave Beat: <strong className="text-white">{binauralDelta.toFixed(1)} Hz</strong> (
                {binauralDelta < 4 ? "Delta" : binauralDelta < 8 ? "Theta" : binauralDelta < 13 ? "Alpha" : "Beta"}
                )
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">LEFT EAR (Hz)</label>
                <input
                  type="number"
                  value={binauralLeft}
                  onChange={(e) => setBinauralLeft(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">RIGHT EAR (Hz)</label>
                <input
                  type="number"
                  value={binauralRight}
                  onChange={(e) => setBinauralRight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            <button
              onClick={handleToggleBinaural}
              className={`w-full py-2 rounded-lg font-mono text-xs font-bold border transition-all ${
                binauralActive
                  ? "bg-purple-600 text-white border-purple-400 animate-pulse shadow-[0_0_15px_#a855f7]"
                  : "bg-slate-800 hover:bg-purple-950 text-purple-300 border-purple-500/40"
              }`}
            >
              {binauralActive ? `STOP BINAURAL BEAT (${binauralDelta.toFixed(1)} Hz)` : `ENGAGE BINAURAL BEAT (${binauralLeft}Hz / ${binauralRight}Hz)`}
            </button>
          </div>

          {/* Recorded Audio Playback Container if ready */}
          {recordedAudioUrl && (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 backdrop-blur space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-emerald-400" />
                  RECORDED TONE AUDIO READY
                </span>
                <a
                  href={recordedAudioUrl}
                  download={`kol_recording_${Date.now()}.webm`}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD AUDIO</span>
                </a>
              </div>
              <audio controls src={recordedAudioUrl} className="w-full h-9 rounded" />
            </div>
          )}
        </div>

        {/* Right 1 Col: Sacred & Scientific Frequencies Library */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              SACRED & HARMONIC FREQUENCIES
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">SOLFEGGIO + HARP</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {SACRED_FREQUENCIES.map((item) => {
              const isPlaying = activeTones.some((t) => t.hz === item.hz);
              return (
                <div
                  key={item.hz}
                  onClick={() => handleTogglePreset(item.hz, item.name)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isPlaying
                      ? "border-cyan-500 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPlaying ? "bg-cyan-400 animate-ping" : "bg-slate-600"
                        }`}
                      />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {item.hz} Hz
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {item.desc}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-500">
                      {isPlaying ? "STATUS: PLAYING" : "CLICK TO PLAY"}
                    </span>
                    <span className="text-cyan-400">
                      {isPlaying ? "STOP ■" : "PLAY ▶"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
