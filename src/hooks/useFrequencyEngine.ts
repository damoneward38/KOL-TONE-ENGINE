"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface FrequencyLayer {
  hz:        number;
  gain:      number;
  waveform:  OscillatorType;
  active:    boolean;
  binauralHz?: number;    // For binaural beats — offset freq
}

interface EngineState {
  isRunning:   boolean;
  masterVolume: number;
  layers:      FrequencyLayer[];
  currentHz:   number[];
  latencyMs:   number;
}

export function useFrequencyEngine() {
  const ctxRef       = useRef<AudioContext | null>(null);
  const oscillators  = useRef<Map<number, OscillatorNode>>(new Map());
  const gainNodes    = useRef<Map<number, GainNode>>(new Map());
  const masterGain   = useRef<GainNode | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);

  const [state, setState] = useState<EngineState>({
    isRunning:    false,
    masterVolume: 0.7,
    layers:       [],
    currentHz:    [],
    latencyMs:    0,
  });

  // ── Initialize audio context ───────────────────────────
  const initContext = useCallback(() => {
    if (ctxRef.current) return;

    ctxRef.current = new AudioContext({ sampleRate: 48000 });
    masterGain.current = ctxRef.current.createGain();
    masterGain.current.gain.value = 0.7;

    analyserRef.current = ctxRef.current.createAnalyser();
    analyserRef.current.fftSize = 32768;

    masterGain.current.connect(analyserRef.current);
    analyserRef.current.connect(ctxRef.current.destination);
  }, []);

  // ── Start a frequency ──────────────────────────────────
  const startFrequency = useCallback((
    hz:       number,
    gain:     number = 0.3,
    waveform: OscillatorType = "sine",
    binauralHz?: number,
  ) => {
    if (!ctxRef.current || !masterGain.current) return;

    // Stop if already running
    if (oscillators.current.has(hz)) {
      stopFrequency(hz);
    }

    const t0 = performance.now();

    // Main oscillator
    const osc = ctxRef.current.createOscillator();
    const g   = ctxRef.current.createGain();

    osc.type            = waveform;
    osc.frequency.value = hz;
    g.gain.value        = 0;  // Start silent

    osc.connect(g);
    g.connect(masterGain.current);
    osc.start();

    // Fade in
    g.gain.linearRampToValueAtTime(
      gain,
      ctxRef.current.currentTime + 0.5
    );

    oscillators.current.set(hz, osc);
    gainNodes.current.set(hz, g);

    // Binaural beat — second oscillator slightly offset
    if (binauralHz) {
      const oscR  = ctxRef.current.createOscillator();
      const gR    = ctxRef.current.createGain();
      const merge = ctxRef.current.createChannelMerger(2);

      oscR.type            = waveform;
      oscR.frequency.value = hz + binauralHz;
      gR.gain.value        = gain;

      oscR.connect(gR);
      gR.connect(merge, 0, 1);
      merge.connect(masterGain.current);
      oscR.start();

      // Store with offset key
      oscillators.current.set(hz + 0.001, oscR);
      gainNodes.current.set(hz + 0.001, gR);
    }

    const latency = performance.now() - t0;

    setState(prev => ({
      ...prev,
      currentHz: [...prev.currentHz, hz],
      latencyMs: latency,
    }));
  }, []);

  // ── Stop a frequency ───────────────────────────────────
  const stopFrequency = useCallback((hz: number) => {
    const osc  = oscillators.current.get(hz);
    const gain = gainNodes.current.get(hz);

    if (osc && gain && ctxRef.current) {
      // Fade out before stopping
      gain.gain.linearRampToValueAtTime(
        0,
        ctxRef.current.currentTime + 0.3
      );
      setTimeout(() => {
        try { osc.stop(); } catch {}
        osc.disconnect();
        gain.disconnect();
      }, 350);

      oscillators.current.delete(hz);
      gainNodes.current.delete(hz);
    }

    setState(prev => ({
      ...prev,
      currentHz: prev.currentHz.filter(f => f !== hz),
    }));
  }, []);

  // ── Start full protocol stage ──────────────────────────
  const startProtocolStage = useCallback((frequencies: number[]) => {
    // Stop all current
    const current = Array.from(oscillators.current.keys());
    current.forEach(hz => stopFrequency(hz));

    // Start new frequencies
    frequencies.forEach((hz, i) => {
      setTimeout(() => {
        // Special handling for binaural beats
        if (hz === 40) {
          // 40Hz binaural: left 200Hz, right 240Hz
          startFrequency(200, 0.25, "sine", 40);
        } else if (hz < 20) {
          // Sub-audible — use isochronic tone carrier
          startFrequency(200, 0.2, "sine");
          startIsochronic(hz);
        } else {
          startFrequency(hz, 0.3, "sine");
        }
      }, i * 200);
    });
  }, [startFrequency, stopFrequency]);

  // ── Isochronic tones for sub-20Hz ─────────────────────
  const startIsochronic = useCallback((hz: number) => {
    if (!ctxRef.current || !gainNodes.current.has(200)) return;

    const carrierGain = gainNodes.current.get(200)!;
    const lfo         = ctxRef.current.createOscillator();

    lfo.type            = "square";
    lfo.frequency.value = hz;

    const lfoGain = ctxRef.current.createGain();
    lfoGain.gain.value = 0.5;

    lfo.connect(lfoGain);
    lfoGain.connect(carrierGain.gain);
    lfo.start();

    oscillators.current.set(hz, lfo);
    gainNodes.current.set(hz, lfoGain);
  }, []);

  // ── Set master volume ──────────────────────────────────
  const setVolume = useCallback((vol: number) => {
    if (masterGain.current && ctxRef.current) {
      masterGain.current.gain.linearRampToValueAtTime(
        vol,
        ctxRef.current.currentTime + 0.1
      );
    }
    setState(prev => ({ ...prev, masterVolume: vol }));
  }, []);

  // ── Stop everything ────────────────────────────────────
  const stopAll = useCallback(() => {
    Array.from(oscillators.current.keys())
      .forEach(hz => stopFrequency(hz));
    setState(prev => ({ ...prev, isRunning: false, currentHz: [] }));
  }, [stopFrequency]);

  // ── Get spectrum data ──────────────────────────────────
  const getSpectrum = useCallback((): Float32Array | null => {
    if (!analyserRef.current) return null;
    const data = new Float32Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getFloatFrequencyData(data);
    return data;
  }, []);

  return {
    state,
    analyser:           analyserRef.current,
    initContext,
    startFrequency,
    stopFrequency,
    startProtocolStage,
    setVolume,
    stopAll,
    getSpectrum,
  };
}
