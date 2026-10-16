"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Radio, 
  Disc, 
  Download, 
  Activity,
  Layers,
  Sparkles
} from "lucide-react";
import { 
  playTone, 
  stopAllTones, 
  stopTone, 
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

export default function AudioPlayerBar() {
  const [activeTones, setActiveTones] = useState(getActiveTones());
  const [volume, setVolume] = useState(getMasterVolume());
  const [isMuted, setIsMuted] = useState(false);
  const [selectedWaveform, setSelectedWaveform] = useState<OscillatorType>('sine');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const unsub = subscribeSoundEngine(() => {
      setActiveTones(getActiveTones());
      setIsRecording(isRecordingAudio());
    });
    return () => unsub();
  }, []);

  // Timer for recording
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      setRecordingDuration(0);
      timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Live Oscilloscope Canvas using AnalyserNode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = getAnalyserNode();

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = "rgba(10, 10, 15, 0.4)";
      ctx.fillRect(0, 0, width, height);

      if (!analyser || activeTones.length === 0) {
        // Flat center line with subtle ambient breathing
        ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#00f0ff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceWidth = (width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeTones.length]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) setIsMuted(false);
    setMasterVolume(isMuted ? 0 : newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setMasterVolume(volume);
    } else {
      setIsMuted(true);
      setMasterVolume(0);
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

  const isPlaying = activeTones.length > 0;
  const currentTone = activeTones[0];

  return (
    <div className="border-t border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl px-4 py-2.5 z-40 transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Tone Info & Mini Oscilloscope */}
        <div className="flex items-center gap-3">
          <div className="relative w-28 h-8 rounded border border-cyan-500/30 bg-black/60 overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} width={112} height={32} className="w-full h-full" />
            <div className="absolute top-0.5 right-1 text-[9px] font-mono text-cyan-400 font-bold tracking-tighter">
              {isPlaying ? `${activeTones.length} TONE` : "OFFLINE"}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" : "bg-slate-600"}`} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                {isPlaying ? (currentTone.label || `${currentTone.hz} Hz Tone`) : "KOL Tone Synthesizer"}
              </span>
              {isPlaying && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  {currentTone.hz} Hz ({selectedWaveform})
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>Web Audio 48kHz</span>
              <span>•</span>
              <span>Harmonic Sovereign Synth</span>
            </div>
          </div>
        </div>

        {/* Center: Presets Quick Bar */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => playTone(432, 0.25, selectedWaveform, "David's Harp (432 Hz)")}
            className={`text-xs px-2.5 py-1 rounded font-mono border transition-all ${
              activeTones.some(t => t.hz === 432)
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-amber-500/40"
            }`}
          >
            432Hz David's Harp
          </button>
          <button
            onClick={() => playTone(528, 0.25, selectedWaveform, "DNA Repair (528 Hz)")}
            className={`text-xs px-2.5 py-1 rounded font-mono border transition-all ${
              activeTones.some(t => t.hz === 528)
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-emerald-500/40"
            }`}
          >
            528Hz DNA Repair
          </button>
          <button
            onClick={() => playTone(40, 0.35, selectedWaveform, "Gamma Brainwave (40 Hz)")}
            className={`text-xs px-2.5 py-1 rounded font-mono border transition-all ${
              activeTones.some(t => t.hz === 40)
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-purple-500/40"
            }`}
          >
            40Hz Gamma Brain
          </button>
          <button
            onClick={() => playTone(111, 0.28, selectedWaveform, "Pyramid Tone (111 Hz)")}
            className={`text-xs px-2.5 py-1 rounded font-mono border transition-all ${
              activeTones.some(t => t.hz === 111)
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-cyan-500/40"
            }`}
          >
            111Hz Pyramid
          </button>
        </div>

        {/* Right Controls: Play / Stop, Volume, Waveform, Record */}
        <div className="flex items-center gap-3">
          {/* Waveform Selector */}
          <div className="flex items-center rounded border border-slate-800 bg-slate-900/80 p-0.5 text-[10px] font-mono">
            {(['sine', 'triangle', 'sawtooth', 'square'] as OscillatorType[]).map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWaveform(w)}
                className={`px-1.5 py-0.5 rounded capitalize transition-colors ${
                  selectedWaveform === w ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          {/* Master Play / Stop */}
          {isPlaying ? (
            <button
              onClick={() => stopAllTones()}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              title="Stop all playing frequencies"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>STOP</span>
            </button>
          ) : (
            <button
              onClick={() => playTone(432, 0.25, selectedWaveform, "David's Harp (432 Hz)")}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400/50 rounded text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              title="Start tone synthesizer with 432 Hz"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>PLAY 432Hz</span>
            </button>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Recorder Button */}
          <button
            onClick={handleRecordToggle}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              isRecording
                ? "bg-red-600 text-white border-red-500 animate-pulse shadow-[0_0_12px_#ef4444]"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
            }`}
            title={isRecording ? "Stop Recording Tone" : "Record Audio Tone"}
          >
            <Disc className={`w-3.5 h-3.5 ${isRecording ? "animate-spin" : ""}`} />
            <span>{isRecording ? `${recordingDuration}s REC` : "REC"}</span>
          </button>

          {/* Download Recorded Audio if available */}
          {recordedAudioUrl && (
            <a
              href={recordedAudioUrl}
              download={`kol_tone_${Date.now()}.webm`}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-mono"
              title="Download recorded tone audio"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SAVE</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
