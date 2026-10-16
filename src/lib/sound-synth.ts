/**
 * Real Web Audio API Sound Synthesizer & Audio Engine
 * Supports Sine, Triangle, Sawtooth, Square oscillators, AnalyserNode for live oscilloscopes,
 * Multi-tone mixing, and Web Audio MediaStream recording.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let mediaDest: MediaStreamAudioDestinationNode | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

export interface ActiveToneInfo {
  hz: number;
  label?: string;
  type: OscillatorType;
  startedAt: number;
}

const activeOscillators: Map<number, { osc: OscillatorNode; gain: GainNode; type: OscillatorType; label?: string }> = new Map();
const listeners: Set<() => void> = new Set();

export function subscribeSoundEngine(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(fn => {
    try { fn(); } catch {}
  });
}

export function getOrCreateContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass({ sampleRate: 48000 });
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.7, audioCtx.currentTime);

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;

      masterGain.connect(analyser);
      analyser.connect(audioCtx.destination);

      if (audioCtx.createMediaStreamDestination) {
        mediaDest = audioCtx.createMediaStreamDestination();
        masterGain.connect(mediaDest);
      }
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getAnalyserNode(): AnalyserNode | null {
  getOrCreateContext();
  return analyser;
}

export function setMasterVolume(volume: number) {
  const ctx = getOrCreateContext();
  if (ctx && masterGain) {
    const clamped = Math.max(0, Math.min(1, volume));
    masterGain.gain.setValueAtTime(clamped, ctx.currentTime);
    notifyListeners();
  }
}

export function getMasterVolume(): number {
  return masterGain ? masterGain.gain.value : 0.7;
}

export function playTone(
  hz: number,
  gainLevel: number = 0.25,
  type: OscillatorType = 'sine',
  label?: string
): boolean {
  try {
    const ctx = getOrCreateContext();
    if (!ctx || !masterGain) return false;

    // Stop existing instance of this specific frequency if already running
    stopTone(hz);

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(hz, ctx.currentTime);

    // Smooth attack envelope (120ms linear ramp)
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gainLevel, ctx.currentTime + 0.12);

    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start();

    activeOscillators.set(hz, { osc, gain: gainNode, type, label });
    notifyListeners();
    return true;
  } catch (err) {
    console.error('Failed to play tone:', err);
    return false;
  }
}

export function stopTone(hz: number): void {
  const item = activeOscillators.get(hz);
  if (item && audioCtx) {
    try {
      const now = audioCtx.currentTime;
      item.gain.gain.setValueAtTime(item.gain.gain.value, now);
      item.gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      setTimeout(() => {
        try {
          item.osc.stop();
          item.osc.disconnect();
          item.gain.disconnect();
        } catch {}
      }, 180);
    } catch {}
    activeOscillators.delete(hz);
    notifyListeners();
  }
}

export function stopAllTones(): void {
  const keys = Array.from(activeOscillators.keys());
  keys.forEach((hz) => stopTone(hz));
  activeOscillators.clear();
  notifyListeners();
}

export function getActiveTones(): ActiveToneInfo[] {
  return Array.from(activeOscillators.entries()).map(([hz, info]) => ({
    hz,
    label: info.label,
    type: info.type,
    startedAt: Date.now(),
  }));
}

export function getActiveTonesCount(): number {
  return activeOscillators.size;
}

export function isTonePlaying(hz: number): boolean {
  return activeOscillators.has(hz);
}

// ── Audio Recording ─────────────────────────────────────────
export function startToneRecording(): boolean {
  try {
    getOrCreateContext();
    if (!mediaDest) return false;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(mediaDest.stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };
    mediaRecorder.start();
    notifyListeners();
    return true;
  } catch (e) {
    console.error('Tone recording failed to start:', e);
    return false;
  }
}

export function stopToneRecording(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      resolve(null);
      return;
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      recordedChunks = [];
      notifyListeners();
      resolve(blob);
    };
    try {
      mediaRecorder.stop();
    } catch {
      resolve(null);
    }
  });
}

export function isRecordingAudio(): boolean {
  return mediaRecorder !== null && mediaRecorder.state === 'recording';
}

// ── Standard Presets ────────────────────────────────────────
export const SACRED_FREQUENCIES = [
  { hz: 432, name: "David's Harp / Universal Pitch", desc: "Acoustic resonance aligned with sacred geometry & 8Hz Schumann subharmonic" },
  { hz: 528, name: "DNA Repair & Transformation", desc: "Solfeggio transformation & repair frequency (MI)" },
  { hz: 40, name: "Gamma Brainwave", desc: "Peak cognition, neural binding, and high-level consciousness" },
  { hz: 111, name: "Pyramid Resonance", desc: "Cellular regeneration & divine coherence tone" },
  { hz: 7.83, name: "Schumann Resonance", desc: "Fundamental electromagnetic resonance of Earth's ionospheric cavity" },
  { hz: 174, name: "Solfeggio 174 Hz", desc: "Anesthetic relief & physical foundation" },
  { hz: 285, name: "Solfeggio 285 Hz", desc: "Tissue restoration & energetic blueprint" },
  { hz: 396, name: "Solfeggio 396 Hz (UT)", desc: "Liberating guilt & fear, ground root chakra" },
  { hz: 417, name: "Solfeggio 417 Hz (RE)", desc: "Facilitating change & undoing negative situations" },
  { hz: 639, name: "Solfeggio 639 Hz (FA)", desc: "Harmonizing relationships & interpersonal resonance" },
  { hz: 741, name: "Solfeggio 741 Hz (SOL)", desc: "Awakening intuition & cellular detoxification" },
  { hz: 852, name: "Solfeggio 852 Hz (LA)", desc: "Spiritual order & pineal activation" },
  { hz: 963, name: "Solfeggio 963 Hz (SI)", desc: "Crown chakra & unity consciousness (Or Ein Sof)" },
];
