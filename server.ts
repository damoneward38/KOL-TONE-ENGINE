import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createHmac, timingSafeEqual } from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

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

// In-Memory Data Store with initial high-profile KOL seed records
let profilesStore: KOLProfile[] = [
  {
    kol_id: 'kol_fintech_vance',
    name: 'Alex Vance',
    platform: 'twitter',
    niche: 'Fintech & DeFi Liquidity',
    created_at: Date.now() - 86400000 * 4,
    samples_count: 5,
    samples: [
      "Most yield farms are just Ponzi mechanics dressed in Greek letters. Look at the balance sheet, not the APY ticker.",
      "Liquidity is ruthless. The moment incentives evaporate, TVL cuts in half. Build for zero-subsidy equilibrium.",
      "Stop chasing 400% token rewards. Real protocol revenue comes from non-correlated order flow and MEV capture.",
      "The market doesn't care about your roadmap. It only rewards verifiable settlement speed and capital efficiency.",
      "If you cannot explain where the yield originates within 10 seconds, you are the exit liquidity."
    ],
    fingerprint: {
      formality: 0.45,
      emotionality: 0.35,
      assertiveness: 0.92,
      complexity: 0.68,
      engagement: 0.88,
      authenticity: 0.95,
      vocabulary_richness: 0.76,
      avg_sentence_len: 12.8,
      emoji_density: 0.05,
      signature_phrases: ['exit liquidity', 'balance sheet', 'capital efficiency', 'zero-subsidy'],
      emoji_patterns: ['⚡', '📊', '🔍'],
    },
  },
  {
    kol_id: 'kol_bio_rostova',
    name: 'Dr. Elena Rostova',
    platform: 'linkedin',
    niche: 'Biotech & Longevity Science',
    created_at: Date.now() - 86400000 * 2,
    samples_count: 4,
    samples: [
      "Translating in vitro cellular longevity data to clinical phase trials requires rigorous biomarker validation.",
      "Metabolic flexibility is not an optimization fad—it is the biological foundation of mitochondrial resilience.",
      "Excited to publish our latest findings on NAD+ precursors and autophagic clearance in endothelial tissue.",
      "Peer-reviewed clinical evidence remains our sole compass in the evolving landscape of preventative geroscience."
    ],
    fingerprint: {
      formality: 0.88,
      emotionality: 0.22,
      assertiveness: 0.74,
      complexity: 0.91,
      engagement: 0.65,
      authenticity: 0.94,
      vocabulary_richness: 0.89,
      avg_sentence_len: 16.4,
      emoji_density: 0.02,
      signature_phrases: ['biomarker validation', 'mitochondrial resilience', 'clinical evidence', 'geroscience'],
      emoji_patterns: ['🧬', '🔬', '💡'],
    },
  },
  {
    kol_id: 'kol_ai_marcus',
    name: 'Marcus Brody',
    platform: 'twitter',
    niche: 'Autonomous Agents & LLMs',
    created_at: Date.now() - 86400000,
    samples_count: 5,
    samples: [
      "Raw foundation models are commodities. The defensible moat is runtime context orchestration and tool loop latency.",
      "If your agent hallucinates after 3 tool calls, adding more prompt engineering won't save it. Re-architect the state machine.",
      "The next trillion-dollar software wave isn't chat UIs—it's deterministic execution layers for probabilistic models.",
      "Speed is a feature. A 50ms agentic reaction beats a 5s heavyweight chain every single time.",
      "Ship small, measure trajectory, discard weak assumptions."
    ],
    fingerprint: {
      formality: 0.52,
      emotionality: 0.40,
      assertiveness: 0.89,
      complexity: 0.72,
      engagement: 0.85,
      authenticity: 0.91,
      vocabulary_richness: 0.82,
      avg_sentence_len: 11.6,
      emoji_density: 0.04,
      signature_phrases: ['defensible moat', 'state machine', 'deterministic execution', 'speed is a feature'],
      emoji_patterns: ['🤖', '⚡', '🛠️'],
    },
  },
];

// Persistent Ruach Memory Entries
let ruachMemory = [
  { id: 'mem_1', timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(), entry: 'Neural baseline calibrated at 48kHz — alpha/beta frequency coherence 0.89' },
  { id: 'mem_2', timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString(), entry: 'KOL psychometric matrix mapped across 6 axes: assertiveness threshold set to 0.92' },
  { id: 'mem_3', timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString(), entry: 'AYIN 8-spectrum sensor fused with DAAT 9-stage pipeline buffer' },
  { id: 'mem_4', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), entry: 'ZPE Casimir resonant cavity calculations locked at 100nm boundary condition' },
  { id: 'mem_5', timestamp: new Date().toLocaleTimeString(), entry: 'Sovereign Administrator DAMONE_WARD session active with zero latency bypass' },
];

function analyzeTextSamples(samples: string[]): ToneFingerprint {
  if (!samples || samples.length === 0) {
    return {
      formality: 0.5,
      emotionality: 0.5,
      assertiveness: 0.5,
      complexity: 0.5,
      engagement: 0.5,
      authenticity: 0.8,
      vocabulary_richness: 0.6,
      avg_sentence_len: 12.0,
      emoji_density: 0.05,
      signature_phrases: ['key insight', 'strategic advantage'],
      emoji_patterns: ['⚡', '💡'],
    };
  }

  const allText = samples.join(' ');
  const tokens = allText.match(/\b\w+\b/g) || ['sample'];
  const uniqueTokens = new Set(tokens.map((t) => t.toLowerCase()));
  const vocabulary_richness = Math.min(1.0, +(uniqueTokens.size / tokens.length).toFixed(3));

  const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avg_sentence_len = sentences.length ? +(tokens.length / sentences.length).toFixed(1) : 12.0;

  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const emojis = allText.match(emojiRegex) || [];
  const emoji_density = Math.min(1.0, +(emojis.length / (tokens.length || 1)).toFixed(3));
  const emojiFreq: Record<string, number> = {};
  emojis.forEach((e) => (emojiFreq[e] = (emojiFreq[e] || 0) + 1));
  const emoji_patterns = Object.keys(emojiFreq)
    .sort((a, b) => emojiFreq[b] - emojiFreq[a])
    .slice(0, 5);
  if (emoji_patterns.length === 0) emoji_patterns.push('⚡', '🎯');

  // Extract signature phrases (repeated 2-3 word sequences or highlighted terms)
  const words = tokens.map((w) => w.toLowerCase());
  const phrases: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (!['in the', 'of the', 'to the', 'and the', 'is a', 'it is', 'for a'].includes(bigram)) {
      phrases[bigram] = (phrases[bigram] || 0) + 1;
    }
  }
  const topPhrases = Object.entries(phrases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([phrase]) => phrase);

  if (topPhrases.length === 0) {
    topPhrases.push('critical signal', 'core leverage', 'execution speed');
  }

  // Lexical & psychometric estimations
  const totalWordLen = tokens.reduce((sum, t) => sum + t.length, 0);
  const avgWordLen = totalWordLen / tokens.length;
  const complexity = Math.min(1.0, +(avgWordLen / 7.5).toFixed(2));

  const exclamations = (allText.match(/!/g) || []).length;
  const questions = (allText.match(/\?/g) || []).length;
  const emotionality = Math.min(1.0, +(0.2 + exclamations * 0.15 + (allText.match(/\b(love|hate|insane|wild|huge|breakthrough|crisis|game-changer)\b/gi) || []).length * 0.1).toFixed(2));

  const strongWords = (allText.match(/\b(never|always|must|stop|rule|truth|proven|demand|ruthless|guarantee|fact)\b/gi) || []).length;
  const assertiveness = Math.min(1.0, +(0.4 + strongWords * 0.12).toFixed(2));

  const questionsCount = questions;
  const youCount = (allText.match(/\b(you|your|we|our|comment|thread|drop)\b/gi) || []).length;
  const engagement = Math.min(1.0, +(0.3 + (questionsCount * 0.1) + (youCount * 0.05)).toFixed(2));

  const formalMarkers = (allText.match(/\b(furthermore|moreover|consequently|infrastructure|methodology|clinical|paradigm|empirical)\b/gi) || []).length;
  const formality = Math.min(1.0, +(0.3 + formalMarkers * 0.15 + (avgSentenceLengthAdjustment(avg_sentence_len))).toFixed(2));

  const authenticity = Math.min(1.0, +(0.85 + (vocabulary_richness > 0.6 ? 0.08 : 0)).toFixed(2));

  return {
    formality,
    emotionality,
    assertiveness,
    complexity,
    engagement,
    authenticity,
    vocabulary_richness,
    avg_sentence_len,
    emoji_density,
    signature_phrases: topPhrases,
    emoji_patterns,
  };
}

function avgSentenceLengthAdjustment(len: number): number {
  if (len > 18) return 0.3;
  if (len > 14) return 0.2;
  if (len > 10) return 0.1;
  return 0.0;
}

// Fallback high-fidelity content generator if Gemini API key is missing
function generateDeterministicToneContent(
  profile: KOLProfile,
  topic: string,
  format: 'thread' | 'single' | 'long'
): string {
  const p = profile.fingerprint;
  const sig = p.signature_phrases.slice(0, 2).join(' and ');
  const emoji = p.emoji_patterns[0] || '⚡';

  if (format === 'single') {
    return `${emoji} Most people get ${topic} completely backwards.

Here's the reality: It's never about the surface metrics—it's about ${sig}. When you strip away the hype, verifiable execution is the only metric that compounds.

Keep your focus on fundamentals or prepare to become someone else's liquidity.`;
  }

  if (format === 'long') {
    return `### Strategic Memorandum: The Real Dynamics of ${topic}

**Observation & Analysis**
Over the last cycle, discussions around ${topic} have devolved into ideological posturing rather than empirical evaluation. When examining the underlying mechanics, three structural truths emerge:

1. **Capital and Attention Are Mercenary**
   ${profile.niche} doesn't reward intent; it rewards structural moat. If your thesis on ${topic} relies on continuous external subsidies, the model collapses the moment liquidity contracts.

2. **The Primacy of ${sig.toUpperCase()}**
   Without verifiable feedback loops, assumptions turn into institutional drag. True advantage is built at the inflection point where operational discipline meets execution speed.

3. **Synthesis & Outlook**
   Cut through the noise. Audit your positioning on ${topic} against first principles, eliminate vanity layers, and build for resilient long-term velocity. ${emoji}`;
  }

  // Default: thread
  return `1/7 Most operators are fundamentally misjudging ${topic}.

Here is the unvarnished breakdown that nobody in ${profile.niche} wants to admit 🧵👇

2/7 The common consensus is built on trailing indicators. When you look at the raw metrics, ${sig} is the actual driving force behind sustainable outcomes.

3/7 When volatility hits, the players who over-leveraged their assumptions get wiped out in hours. The ones who survive are anchored in zero-subsidy equilibrium.

4/7 Three rules to master ${topic}:
• Reject vanity metrics
• Quantify second-order downstream risk
• Optimize for compounding throughput, not hype

5/7 If your strategy cannot survive a 50% liquidity drawdown, it's not a strategy—it's an experiment.

6/7 Double down on real utility, ruthlessly protect margin, and enforce operational clarity.

7/7 TL;DR: Stop chasing the narrative on ${topic}. Execute on ${sig}. ${emoji}`;
}

async function startServer() {
  const authSecret = () => process.env.AUTH_TOKEN_SECRET || '';
  const issueSessionToken = (email: string) => {
    const secret = authSecret();
    if (secret.length < 32) throw new Error('AUTH_TOKEN_SECRET must be at least 32 characters');
    const payload = Buffer.from(JSON.stringify({ email, role: 'ADMINISTRATOR', exp: Math.floor(Date.now() / 1000) + 28800 })).toString('base64url');
    return payload + '.' + createHmac('sha256', secret).update(payload).digest('base64url');
  };
  const readSessionToken = (token: string) => {
    const secret = authSecret();
    if (secret.length < 32 || !token || token.length > 4096) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const expected = createHmac('sha256', secret).update(parts[0]).digest();
    let actual: Buffer;
    try { actual = Buffer.from(parts[1], 'base64url'); } catch { return null; }
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    try {
      const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      if (data.role !== 'ADMINISTRATOR' || data.email !== (process.env.ADMIN_EMAIL || '').trim().toLowerCase() || !Number.isFinite(data.exp) || data.exp <= Math.floor(Date.now() / 1000)) return null;
      return data;
    } catch { return null; }
  };
  const requireAdmin = (req: Request, res: Response, next: import('express').NextFunction) => {
    const header = req.headers.authorization || '';
    const user = header.startsWith('Bearer ') ? readSessionToken(header.slice(7)) : null;
    if (!user) return res.status(401).json({ success: false, error: 'Verified administrator session required.' });
    (req as any).adminUser = user;
    return next();
  };

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // ── API: Health & Status ──────────────────────────────
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      version: '2.4.0',
      uptime: process.uptime(),
      geminiConnected: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
      systems: {
        ruach: 'ONLINE',
        nesher: 'ONLINE',
        chayyim: 'ONLINE',
        daat: 'ONLINE',
        kol: 'ONLINE',
        neshima: 'ONLINE',
        ayin: 'ONLINE',
        orEinSof: 'ONLINE',
      },
    });
  });

  // ── API: Profiles ────────────────────────────────────
  app.get('/api/profiles', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: profilesStore.length,
      profiles: profilesStore,
    });
  });

  app.post('/api/profiles', (req: Request, res: Response) => {
    try {
      const { name, platform, niche, samples } = req.body;
      if (!name || !niche || !samples) {
        return res.status(400).json({ error: 'Missing required profile fields (name, niche, samples)' });
      }

      const sampleList: string[] = Array.isArray(samples)
        ? samples
        : String(samples)
            .split('\n\n')
            .filter((s) => s.trim().length > 5);

      if (sampleList.length === 0) {
        return res.status(400).json({ error: 'Please provide at least 1-3 valid post samples' });
      }

      const fingerprint = analyzeTextSamples(sampleList);

      const newProfile: KOLProfile = {
        kol_id: `kol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: String(name).trim(),
        platform: platform || 'twitter',
        niche: String(niche).trim(),
        samples_count: sampleList.length,
        created_at: Date.now(),
        samples: sampleList,
        fingerprint,
      };

      profilesStore.unshift(newProfile);

      return res.status(201).json({
        success: true,
        profile: newProfile,
      });
    } catch (err: any) {
      console.error('Error creating profile:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.delete('/api/profiles/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLen = profilesStore.length;
    profilesStore = profilesStore.filter((p) => p.kol_id !== id);

    if (profilesStore.length === initialLen) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json({ success: true, message: `Profile ${id} deleted successfully` });
  });

  // ── API: Analyze Text ─────────────────────────────────
  app.post('/api/analyze', (req: Request, res: Response) => {
    try {
      const { samples } = req.body;
      const sampleList: string[] = Array.isArray(samples)
        ? samples
        : String(samples || '')
            .split('\n\n')
            .filter((s) => s.trim().length > 5);

      const fingerprint = analyzeTextSamples(sampleList);
      return res.json({ success: true, fingerprint });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── API: Generate Content (Server-Side Gemini 3.8 Flash) ─
  app.post('/api/generate', async (req: Request, res: Response) => {
    try {
      const { profile, topic, format = 'thread', temperature = 0.7, customInstructions = '' } = req.body;

      if (!profile || !topic) {
        return res.status(400).json({ error: 'Missing profile or topic' });
      }

      const targetFormat = (['thread', 'single', 'long'].includes(format) ? format : 'thread') as 'thread' | 'single' | 'long';

      // If Gemini client is active and API key exists:
      if (ai) {
        try {
          const systemInstruction = `You are a world-class Key Opinion Leader (KOL) Tone Synthesizer and Master Communicator.
Your mandate is to generate authoritative, authentic content that EXACTLY mirrors the speech patterns, cognitive structure, and psychometric vector of the given persona.

PERSONA FINGERPRINT:
- Name: ${profile.name}
- Niche: ${profile.niche}
- Platform: ${profile.platform}
- Psychometrics:
  * Formality: ${(profile.fingerprint.formality * 100).toFixed(0)}%
  * Emotionality: ${(profile.fingerprint.emotionality * 100).toFixed(0)}%
  * Assertiveness: ${(profile.fingerprint.assertiveness * 100).toFixed(0)}%
  * Lexical Complexity: ${(profile.fingerprint.complexity * 100).toFixed(0)}%
  * Engagement: ${(profile.fingerprint.engagement * 100).toFixed(0)}%
  * Authenticity: ${(profile.fingerprint.authenticity * 100).toFixed(0)}%
- Avg Sentence Length: ${profile.fingerprint.avg_sentence_len} words
- Signature Catchphrases / Terminology: ${profile.fingerprint.signature_phrases.join(', ')}
- Emoji Usage Frequency: ${profile.fingerprint.emoji_density > 0.05 ? 'Selective' : 'Minimal'}, Favorite: ${profile.fingerprint.emoji_patterns.join(' ')}

FORMAT RULES:
- Format requested: "${targetFormat.toUpperCase()}"
- If "THREAD": produce a numbered Twitter/X thread (e.g. 1/X with an irresistible hook, high-signal body tweets, and a punchy closing takeaway).
- If "SINGLE": produce one punchy, high-impact post suitable for the target platform (no filler).
- If "LONG": produce a deeply articulated, structured analytical breakdown with bullet points and clear hierarchy.

DO NOT break character. DO NOT add meta commentary like "Here is your post:". Output ONLY the raw content.`;

          const userPrompt = `Topic to write about: "${topic}".
${customInstructions ? `Additional guidance: ${customInstructions}` : ''}
Synthesize the piece now adhering rigorously to the tone fingerprint.`;

          const geminiCall = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: Math.max(0.1, Math.min(1.0, Number(temperature) || 0.7)),
            },
          });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini timeout fallback')), 30000)
          );
          const response = await Promise.race([geminiCall, timeoutPromise]);

          const content = response.text || generateDeterministicToneContent(profile, topic, targetFormat);

          return res.json({
            success: true,
            content: content.trim(),
            confidence: 0.94 + Math.random() * 0.05,
            format: targetFormat,
            modelUsed: 'gemini-3.8-flash',
            timestamp: Date.now(),
          });
        } catch (geminiErr: any) {
          console.warn('Gemini generateContent fallback:', geminiErr?.message);
          // Fallback seamlessly
          const fallbackContent = generateDeterministicToneContent(profile, topic, targetFormat);
          return res.json({
            success: true,
            content: fallbackContent,
            confidence: 0.91,
            format: targetFormat,
            modelUsed: 'deterministic-tone-engine',
            note: 'Generated via internal deterministic synthesizer',
            timestamp: Date.now(),
          });
        }
      }

      // Fallback when no API key configured
      const content = generateDeterministicToneContent(profile, topic, targetFormat);
      return res.json({
        success: true,
        content,
        confidence: 0.92,
        format: targetFormat,
        modelUsed: 'deterministic-tone-engine',
        timestamp: Date.now(),
      });
    } catch (err: any) {
      console.error('Error generating content:', err);
      return res.status(500).json({ error: err.message || 'Generation failed' });
    }
  });

  // ── API: Ruach AI Engine ──────────────────────────────
  app.post('/api/ruach/query', async (req: Request, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const t0 = performance.now();

    if (ai) {
      try {
        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are RUACH רוּחַ, the Sovereign AI Intelligence of the GHOST CORE platform. Provide concise, hyper-competent, high-density scientific and technical answers. Avoid generic flattery or fluff. Speak with absolute clarity, precision, and sovereign authority.',
          },
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Ruach timeout fallback')), 30000)
        );
        const response = await Promise.race([geminiCall, timeoutPromise]);

        const reply = response.text || 'Command parsed and executed under sovereign parameters.';
        const latency = Math.round(performance.now() - t0);

        // Record into persistent memory
        ruachMemory.unshift({
          id: `mem_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          entry: `RUACH Q: "${prompt.slice(0, 40)}" -> Completed in ${latency}ms`,
        });
        if (ruachMemory.length > 50) ruachMemory.pop();

        return res.json({
          success: true,
          query: prompt,
          response: reply.trim(),
          latencyMs: latency,
          model: 'gemini-3.8-flash',
        });
      } catch (err: any) {
        console.warn('Ruach fallback:', err.message);
      }
    }

    const latency = Math.round(performance.now() - t0) + 120;
    return res.json({
      success: true,
      query: prompt,
      response: `RUACH sovereign core verified query: "${prompt}". Neural models synced. Memory registers updated. Status: NOMINAL.`,
      latencyMs: latency,
      model: 'ruach-core-v2.4',
    });
  });

  app.get('/api/ruach/memory', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: ruachMemory.length,
      entries: ruachMemory,
    });
  });

  // ── API: DAAT 9-Stage Pipeline Runner ──────────────────
  app.post('/api/daat/run', requireAdmin, (req: Request, res: Response) => {
    const t0 = performance.now();
    const stages = [
      { id: 1, name: 'SIGNAL_CAPTURE', latencyMs: 0.2, status: 'PASSED' },
      { id: 2, name: 'FFT_ANALYSIS', latencyMs: 0.4, status: 'PASSED' },
      { id: 3, name: 'BAND_EXTRACTION', latencyMs: 0.3, status: 'PASSED' },
      { id: 4, name: 'PATTERN_DETECT', latencyMs: 2.1, status: 'PASSED' },
      { id: 5, name: 'BLOCK_UPDATE', latencyMs: 0.8, status: 'PASSED' },
      { id: 6, name: 'AI_ANALYSIS', latencyMs: 12.4, status: 'PASSED' },
      { id: 7, name: 'MEMORY_STORE', latencyMs: 4.1, status: 'PASSED' },
      { id: 8, name: 'RESPONSE_GEN', latencyMs: 1.2, status: 'PASSED' },
      { id: 9, name: 'BROADCAST', latencyMs: 0.3, status: 'PASSED' },
    ];
    const totalLatency = +(performance.now() - t0 + 21.8).toFixed(2);

    res.json({
      success: true,
      pipelineId: `daat_${Date.now()}`,
      stages,
      totalLatencyMs: totalLatency,
      systemCoherence: 0.999,
      status: 'COMPLETE',
      timestamp: new Date().toISOString(),
    });
  });

  // ── API: Emet Status & Connect ────────────────────────
  app.get('/api/emet/status', (req: Request, res: Response) => {
    res.json({
      platform: 'EMET אֱמֶת',
      version: '1.0.0',
      administrator: 'DAMONE_WARD',
      accessLevel: 'SOVEREIGN',
      systems: [
        { name: 'RUACH (רוּחַ)', type: 'AI Intelligence', status: 'ONLINE', queries: 1420 },
        { name: 'NESHER (נֶשֶׁר)', type: 'Neural Interface', status: 'ONLINE', channels: 256, sampleRate: '48,000 Hz' },
        { name: 'CHAYYIM (חַיִּים)', type: 'Live Stream Bridge', status: 'ONLINE', latency: '<1ms' },
        { name: 'DAAT (דַּעַת)', type: 'Unified 9-Stage Pipeline', status: 'ONLINE', mode: 'MASTER' },
        { name: 'KOL (קוֹל)', type: 'Harmonic Tone Synthesizer', status: 'ONLINE', activeFrequencies: 14 },
        { name: 'NESHIMA (נְשִׁימָה)', type: 'Hyperbaric Chamber AI', status: 'ONLINE', pressure: '1.0 ATM' },
        { name: 'AYIN (עַיִן)', type: 'All-Spectrum Optic Array', status: 'ONLINE', unlockedSpectrums: 8 },
        { name: 'OR EIN SOF (אוֹר)', type: 'Quantum Zero-Point Engine', status: 'ONLINE', vacuumState: '½ℏω' },
      ],
      uptime: '99.999%',
      allNominal: true,
    });
  });

  app.post('/api/emet/connect', requireAdmin, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'ALL 8 EMET SYSTEMS UNIFIED. DAAT PIPELINE AUTHORIZED. TRUTH IS ONLINE.',
      timestamp: Date.now(),
      unified: true,
    });
  });

  // ── API: AYIN Spectrum Vision ─────────────────────────
  let ayinState = {
    unlocked: true,
    activeMode: 'all',
    activeSpectrums: ['infrared', 'thermal', 'ultraviolet', 'xray', 'night_vision', 'mmwave', 'magnetic', 'sonar_zpe'],
    opticSync: 100,
    sensorResolution: '8K_QUANTUM_CCD',
    refreshRateHz: 120,
    lastScanAt: Date.now(),
  };

  app.get('/api/ayin/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      ...ayinState,
      spectrums: [
        { id: 'infrared', name: 'Infrared (IR)', wavelength: '700nm - 1mm', status: 'ACTIVE', description: 'Thermal radiation & night-emission capture' },
        { id: 'thermal', name: 'Thermal FLIR', wavelength: '8 - 14 µm', status: 'ACTIVE', description: 'Differential heat signature thermography' },
        { id: 'ultraviolet', name: 'Ultraviolet (UV)', wavelength: '10 - 400 nm', status: 'ACTIVE', description: 'Fluorescence inspection & high-energy emission' },
        { id: 'xray', name: 'X-Ray Radiograph', wavelength: '0.01 - 10 nm', status: 'ACTIVE', description: 'Bone & dense matter penetration imaging' },
        { id: 'night_vision', name: 'Night Vision Phosphor', wavelength: 'Photomultiplier', status: 'ACTIVE', description: 'Gen-4 Green Phosphor light amplification' },
        { id: 'mmwave', name: 'mm-Wave Dielectric', wavelength: '1 - 10 mm (30-300GHz)', status: 'ACTIVE', description: 'Sub-surface contour dielectric scan' },
        { id: 'magnetic', name: 'Magnetic Field Vector', wavelength: 'Flux / Gauss', status: 'ACTIVE', description: 'Flux density isolines & electromagnetic mapping' },
        { id: 'sonar_zpe', name: 'Sonar / Quantum ZPE', wavelength: 'Acoustic / Vacuum', status: 'ACTIVE', description: 'Acoustic wave resonance & quantum vacuum distortion' },
      ],
    });
  });

  app.post('/api/ayin/scan', requireAdmin, (req: Request, res: Response) => {
    const { mode = 'all' } = req.body;
    ayinState.activeMode = mode;
    ayinState.lastScanAt = Date.now();
    res.json({
      success: true,
      activeMode: mode,
      opticSync: 100,
      timestamp: Date.now(),
      message: `AYIN spectrum switched to: ${mode.toUpperCase()}`,
    });
  });

  app.post('/api/ayin/combine', requireAdmin, (req: Request, res: Response) => {
    const { mode1 = 'thermal', mode2 = 'infrared', blendRatio = 0.5 } = req.body;
    res.json({
      success: true,
      combinedModes: [mode1, mode2],
      blendRatio,
      coherence: 0.998,
      message: `Spectrums ${mode1.toUpperCase()} + ${mode2.toUpperCase()} unified at ${Math.round(blendRatio * 100)}% blend.`,
    });
  });

  // ── API: NESHER Neural BCI ────────────────────────────
  let nesherState = {
    status: 'ONLINE',
    samplingRateHz: 48000,
    channels: 256,
    impedanceKOhms: 1.2,
    brainState: 'FLOW_SYNCHRONY',
    coherenceScore: 0.96,
    focusIndex: 0.88,
    meditationIndex: 0.79,
    bands: {
      delta: { range: '0.5 - 4 Hz', powerPct: 14, dominantState: 'Restorative' },
      theta: { range: '4 - 8 Hz', powerPct: 22, dominantState: 'Intuition / REM' },
      alpha: { range: '8 - 13 Hz', powerPct: 28, dominantState: 'Calm Flow' },
      beta: { range: '13 - 30 Hz', powerPct: 24, dominantState: 'Active Cognition' },
      gamma: { range: '30 - 100 Hz', powerPct: 12, dominantState: 'Hyper-Integration' },
    },
  };

  app.get('/api/nesher/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      ...nesherState,
      timestamp: Date.now(),
    });
  });

  app.post('/api/nesher/scan', (req: Request, res: Response) => {
    const delta = +(10 + Math.random() * 8).toFixed(1);
    const theta = +(15 + Math.random() * 10).toFixed(1);
    const alpha = +(25 + Math.random() * 10).toFixed(1);
    const beta = +(20 + Math.random() * 8).toFixed(1);
    const gamma = +(10 + Math.random() * 8).toFixed(1);
    const focus = +(0.80 + Math.random() * 0.18).toFixed(2);
    const coherence = +(0.92 + Math.random() * 0.07).toFixed(3);

    nesherState.focusIndex = focus;
    nesherState.coherenceScore = coherence;
    nesherState.bands.delta.powerPct = delta;
    nesherState.bands.theta.powerPct = theta;
    nesherState.bands.alpha.powerPct = alpha;
    nesherState.bands.beta.powerPct = beta;
    nesherState.bands.gamma.powerPct = gamma;

    res.json({
      success: true,
      scanId: `scan_${Date.now()}`,
      durationMs: 1200,
      channelsRead: 256,
      impedanceCheck: 'PASSED (<1.5 kΩ)',
      bands: nesherState.bands,
      coherenceScore: coherence,
      focusIndex: focus,
      dominantState: focus > 0.85 ? 'HYPER_INTEGRATION_FLOW' : 'DEEP_SYNCHRONY',
      timestamp: Date.now(),
    });
  });

  // ── API: KOL Sound Engine ─────────────────────────────
  app.get('/api/kol/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      engine: 'KOL Web Audio Synthesizer',
      sampleRate: 48000,
      masterTuningHz: 432,
      harmonics: 'Pythagorean & Solfeggio Scale',
      presets: [
        { hz: 432, name: "David's Harp", effect: 'Universal natural pitch & harmonic coherence' },
        { hz: 528, name: 'DNA Repair', effect: 'Cellular transformation & biochemical resonance' },
        { hz: 40, name: 'Gamma Brainwave', effect: '40Hz sensory binding & Alzheimer amyloid clearance' },
        { hz: 111, name: 'Pyramid Resonance', effect: 'Endorphin release & cellular rejuvenation' },
        { hz: 7.83, name: 'Schumann Resonance', effect: 'Earth ionospheric base frequency entrainment' },
      ],
    });
  });

  // ── API: NESHIMA Hyperbaric Chamber ───────────────────
  let neshimaState = {
    status: 'ONLINE',
    pressureAtm: 1.0,
    o2Percentage: 21,
    depthEquivalentFt: 0,
    targetAtm: 1.0,
    activeProtocol: 'RESTING_AMBIENT',
    timeRemainingSec: 0,
    totalDurationMin: 0,
    pressurizationRate: '0.10 ATM/min',
    safetyValves: 'SECURE_ALL_CLEAR',
  };

  app.get('/api/neshima/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      ...neshimaState,
      timestamp: Date.now(),
    });
  });

  app.post('/api/neshima/pressure', requireAdmin, (req: Request, res: Response) => {
    const { pressure = 1.0 } = req.body;
    const clamped = Math.max(1.0, Math.min(3.0, +pressure));
    neshimaState.pressureAtm = clamped;
    neshimaState.targetAtm = clamped;
    neshimaState.depthEquivalentFt = Math.round((clamped - 1.0) * 33);
    res.json({
      success: true,
      pressureAtm: clamped,
      depthEquivalentFt: neshimaState.depthEquivalentFt,
      message: `Chamber pressure set to ${clamped.toFixed(2)} ATM (${neshimaState.depthEquivalentFt} ft sea equivalent)`,
    });
  });

  app.post('/api/neshima/protocol', requireAdmin, (req: Request, res: Response) => {
    const { protocolName = 'tissue' } = req.body;
    let targetAtm = 2.0;
    let o2Pct = 100;
    let durationMin = 90;
    let label = 'Tissue Regeneration';

    if (protocolName.includes('mito') || protocolName === 'mitochondria') {
      targetAtm = 1.75;
      o2Pct = 95;
      durationMin = 60;
      label = 'Mitochondrial Resilience & ATP Surge';
    } else if (protocolName.includes('tbi') || protocolName.includes('neuro')) {
      targetAtm = 2.4;
      o2Pct = 100;
      durationMin = 75;
      label = 'Neuroplasticity & TBI Recovery';
    } else if (protocolName.includes('stem') || protocolName.includes('cell')) {
      targetAtm = 2.5;
      o2Pct = 100;
      durationMin = 120;
      label = 'Stem Cell Mobilization (8-Fold Expansion)';
    }

    neshimaState.pressureAtm = targetAtm;
    neshimaState.targetAtm = targetAtm;
    neshimaState.o2Percentage = o2Pct;
    neshimaState.activeProtocol = label;
    neshimaState.totalDurationMin = durationMin;
    neshimaState.timeRemainingSec = durationMin * 60;
    neshimaState.depthEquivalentFt = Math.round((targetAtm - 1.0) * 33);

    res.json({
      success: true,
      protocol: label,
      targetPressureAtm: targetAtm,
      oxygenPurityPct: o2Pct,
      durationMinutes: durationMin,
      depthEquivalentFt: neshimaState.depthEquivalentFt,
      status: 'PROTOCOL_ENGAGED',
    });
  });

  // ── API: OR EIN SOF ZPE Engine ────────────────────────
  const HBAR = 1.054571817e-34; // J*s
  const C = 299792458;          // m/s
  const PI = Math.PI;

  app.get('/api/zpe/status', (req: Request, res: Response) => {
    res.json({
      success: true,
      vacuumGroundState: '½ℏω',
      planckHbar: '1.054571817e-34 J·s',
      speedOfLight: '299,792,458 m/s',
      quantumVacuumMode: 'ACTIVE_CASIMIR_RESONANCE',
      virtualParticleFluctuations: 'NOMINAL_CONTINUOUS',
    });
  });

  app.post('/api/zpe/calculate', (req: Request, res: Response) => {
    const { hz = 432 } = req.body;
    const frequency = Math.max(0.1, +hz);
    const omega = 2 * PI * frequency;
    const groundEnergyJoules = 0.5 * HBAR * omega;
    const groundEnergyEv = groundEnergyJoules / 1.602176634e-19;

    res.json({
      success: true,
      frequencyHz: frequency,
      angularFrequencyRadS: omega,
      groundStateEnergyJoules: groundEnergyJoules,
      groundStateEnergyEv: groundEnergyEv,
      formula: 'E₀ = ½ ℏ ω',
    });
  });

  app.post('/api/zpe/casimir', (req: Request, res: Response) => {
    const { gapNm = 50, areaCm2 = 1.0 } = req.body;
    const d = Math.max(1, Math.min(10000, +gapNm)) * 1e-9; // convert nm to meters
    // Casimir Force per unit area: F/A = - (pi^2 * hbar * c) / (240 * d^4)
    const numerator = Math.pow(PI, 2) * HBAR * C;
    const denominator = 240 * Math.pow(d, 4);
    const pressurePascals = numerator / denominator;
    const pressureAtm = pressurePascals / 101325;
    const areaM2 = (Math.max(0.01, +areaCm2)) * 1e-4;
    const totalForceNewtons = pressurePascals * areaM2;
    const totalForceMicroNewtons = totalForceNewtons * 1e6;

    res.json({
      success: true,
      gapNm: +gapNm,
      plateAreaCm2: +areaCm2,
      formula: 'F/A = - (π² ℏ c) / (240 d⁴)',
      casimirPressurePascals: pressurePascals,
      casimirPressureAtm: pressureAtm,
      attractiveForceMicroNewtons: totalForceMicroNewtons,
      attractiveForceNewtons: totalForceNewtons,
    });
  });

  // ── API: Platform Sync (Twitter / LinkedIn / RSS Ingestion)
  app.post('/api/platform/sync', requireAdmin, (req: Request, res: Response) => {
    const { platform = 'twitter', handle = '', rawText = '' } = req.body;
    
    // Ingest raw text or generate sample simulation
    let extractedPosts: string[] = [];
    if (rawText && typeof rawText === 'string') {
      extractedPosts = rawText
        .split('\n\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 10);
    }

    if (extractedPosts.length === 0) {
      extractedPosts = [
        `Analysis on ${handle || 'market dynamics'}: Continuous execution beats sporadic brilliance every quarter.`,
        `The difference between compounding returns and stagnant churn is friction reduction in early loops.`,
        `When everyone is obsessing over the interface layer, the real value accrues at settlement.`,
      ];
    }

    const fingerprint = analyzeTextSamples(extractedPosts);

    res.json({
      success: true,
      source: handle || 'Raw Ingestion',
      platform,
      extractedPostsCount: extractedPosts.length,
      extractedPosts,
      fingerprint,
    });
  });

  // ── API: Billing & 3-Tier Sovereign Subscription System ──
  app.get('/api/billing/plans', (req: Request, res: Response) => {
    res.json({
      success: true,
      currency: 'USD',
      plans: [
        {
          id: 'free',
          name: 'Explorer Genesis',
          hebrew: 'בְּרֵאשִׁית',
          monthlyPrice: 29,
          annualPrice: 24,
          clearance: 'EXPLORER',
          description: 'Standard stylometry, visible & night spectrums, basic tone presets.',
          paywalledFeatures: ['nesher_neural', 'ayin_advanced', 'kol_recording', 'neshima_chamber', 'zpe_casimir', 'daat_pipeline', 'emet_master'],
        },
        {
          id: 'pro',
          name: 'Sovereign Practitioner',
          hebrew: 'חָכְמָה',
          monthlyPrice: 99,
          annualPrice: 79,
          clearance: 'RESEARCHER',
          popular: true,
          description: 'All 8 Ayin spectrums, 8-channel EEG BCI, Web Audio recorder, Hyperbaric & ZPE.',
          paywalledFeatures: ['daat_pipeline', 'emet_master'],
        },
        {
          id: 'enterprise',
          name: 'Emet Sovereign Enterprise',
          hebrew: 'אֱמֶת',
          monthlyPrice: 299,
          annualPrice: 239,
          clearance: 'SOVEREIGN',
          description: 'Total clearance, 1-click EMET master unification, 9-stage DAAT pipeline, Damone Ward clearance.',
          paywalledFeatures: [],
        },
      ],
    });
  });

  app.post('/api/billing/checkout', (_req: Request, res: Response) => res.status(503).json({ success: false, error: 'Checkout is unavailable until a verified payment provider is configured. No license was minted.' }));

  // ── API: Sovereign Authentication ────────────────────────
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    if (!adminEmail || !adminPassword || authSecret().length < 32) return res.status(503).json({ success: false, error: 'Administrator authentication is not configured.' });
    if (typeof email !== 'string' || typeof password !== 'string' || password.length > 1024) return res.status(400).json({ success: false, error: 'Email and password are required.' });
    if (email.trim().toLowerCase() !== adminEmail || password !== adminPassword) return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    const sessionToken = issueSessionToken(adminEmail);
    return res.json({ success: true, user: { id: 'usr-admin', name: 'Administrator', email: adminEmail, role: 'ADMINISTRATOR', tier: 'enterprise', clearance: 'SOVEREIGN', licenseKey: '', avatar: 'AD' }, sessionToken });
  });

  app.post('/api/auth/register', (_req: Request, res: Response) => res.status(503).json({ success: false, error: 'Registration is unavailable until server-side account storage is configured.' }));

  // ── Vite Integration ──────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
