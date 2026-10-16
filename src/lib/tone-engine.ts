/**
 * KOL Tone Engine - Core Module
 * Analyzes KOL communication patterns and generates tone-matched content.
 * Ported from Python to TypeScript.
 */

export enum Platform {
  TWITTER = "twitter",
  INSTAGRAM = "instagram",
  LINKEDIN = "linkedin",
  YOUTUBE = "youtube",
  TIKTOK = "tiktok",
}

export enum ToneCategory {
  AUTHORITATIVE = "authoritative",   // Expert, data-driven, formal
  CONVERSATIONAL = "conversational",  // Casual, relatable, friendly
  INSPIRATIONAL = "inspirational",   // Motivational, visionary, emotional
  EDUCATIONAL = "educational",     // Informative, structured, clear
  HUMOROUS = "humorous",        // Witty, playful, sarcastic
  CONTROVERSIAL = "controversial",   // Bold, provocative, debate-sparking
}

export interface ToneFingerprint {
  formality: number;
  emotionality: number;
  assertiveness: number;
  complexity: number;
  engagement: number;
  authenticity: number;
  signature_phrases: string[];
  emoji_patterns: string[];
  avg_sentence_len: number;
  vocabulary_richness: number;
}

export interface KOLProfile {
  kol_id: string;
  name: string;
  platform: Platform;
  niche: string;
  fingerprint: ToneFingerprint;
  sample_posts: string[];
  follower_count?: number;
  avg_engagement_rate?: number;
  created_at: number;
}

export interface GenerationRequest {
  kol_id: string;
  topic: string;
  platform: Platform;
  content_type: string;
  inject_hashtags: boolean;
}

export interface GeneratedContent {
  request_id: string;
  kol_id: string;
  platform: Platform;
  content: string;
  tone_category: ToneCategory;
  confidence: number;
  char_count: number;
  hashtags: string[];
  metadata: any;
}

const ARCHETYPES: Record<ToneCategory, number[]> = {
  [ToneCategory.AUTHORITATIVE]: [0.9, 0.2, 0.9, 0.8, 0.3, 0.2],
  [ToneCategory.CONVERSATIONAL]: [0.2, 0.7, 0.5, 0.3, 0.8, 0.9],
  [ToneCategory.INSPIRATIONAL]: [0.5, 0.9, 0.8, 0.5, 0.7, 0.7],
  [ToneCategory.EDUCATIONAL]: [0.7, 0.3, 0.6, 0.7, 0.5, 0.4],
  [ToneCategory.HUMOROUS]: [0.2, 0.8, 0.6, 0.4, 0.9, 0.8],
  [ToneCategory.CONTROVERSIAL]: [0.5, 0.6, 1.0, 0.6, 0.7, 0.5],
};

const PLATFORM_CONSTRAINTS: Record<Platform, { max_chars: number; hashtag_limit: number; emoji_ok: boolean }> = {
  [Platform.TWITTER]: { max_chars: 280, hashtag_limit: 3, emoji_ok: true },
  [Platform.INSTAGRAM]: { max_chars: 2200, hashtag_limit: 30, emoji_ok: true },
  [Platform.LINKEDIN]: { max_chars: 3000, hashtag_limit: 5, emoji_ok: false },
  [Platform.YOUTUBE]: { max_chars: 5000, hashtag_limit: 15, emoji_ok: true },
  [Platform.TIKTOK]: { max_chars: 2200, hashtag_limit: 20, emoji_ok: true },
};

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function getDominantTone(vector: number[]): ToneCategory {
  let bestMatch = ToneCategory.CONVERSATIONAL;
  let minDistance = Infinity;

  const categories = Object.keys(ARCHETYPES) as ToneCategory[];
  for (const category of categories) {
    const archetype = ARCHETYPES[category];
    const dist = euclideanDistance(vector, archetype);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = category;
    }
  }

  return bestMatch;
}

export class ToneAnalyzer {
  private static FORMAL_MARKERS = new Set(["therefore", "consequently", "furthermore", "hereby", "pursuant", "nevertheless", "notwithstanding"]);
  private static CASUAL_MARKERS = new Set(["lol", "omg", "ngl", "tbh", "btw", "literally", "honestly", "kinda", "gonna", "wanna"]);
  private static EMOTION_MARKERS = new Set(["love", "hate", "amazing", "terrible", "incredible", "devastated", "thrilled", "obsessed", "heartbroken"]);
  private static ASSERTIVE_MARKERS = new Set(["must", "always", "never", "absolutely", "definitely", "proven", "fact", "truth", "wrong", "right"]);
  private static CTA_MARKERS = new Set(["follow", "subscribe", "comment", "share", "like", "click", "check", "dm", "link"]);

  analyze(texts: string[]): ToneFingerprint {
    if (!texts.length) throw new Error("At least one text sample is required.");

    const formalityScores: number[] = [];
    const emotionalityScores: number[] = [];
    const assertivenessScores: number[] = [];
    const complexityScores: number[] = [];
    const engagementScores: number[] = [];
    const authenticityScores: number[] = [];

    const allTokens: string[] = [];
    const sentenceLengths: number[] = [];
    const emojiFound: string[] = [];
    const ngrams: string[] = [];

    texts.forEach(text => {
      const tokens: string[] = text.match(/\b\w+\b/g) || [];
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const lowerTokens = tokens.map(t => t.toLowerCase());
      const tokenSet = new Set(lowerTokens);

      // Formality
      const formalHits = Array.from(tokenSet).filter(t => ToneAnalyzer.FORMAL_MARKERS.has(t)).length;
      const casualHits = Array.from(tokenSet).filter(t => ToneAnalyzer.CASUAL_MARKERS.has(t)).length;
      formalityScores.push(this.boundedScore(formalHits - casualHits, -5, 5));

      // Emotionality
      const emotionHits = Array.from(tokenSet).filter(t => ToneAnalyzer.EMOTION_MARKERS.has(t)).length;
      emotionalityScores.push(this.boundedScore(emotionHits, 0, 6));

      // Assertiveness
      const assertHits = Array.from(tokenSet).filter(t => ToneAnalyzer.ASSERTIVE_MARKERS.has(t)).length;
      const exclamations = (text.match(/!/g) || []).length;
      assertivenessScores.push(this.boundedScore(assertHits + exclamations, 0, 8));

      // Complexity
      if (tokens.length) {
        const totalLen = tokens.reduce((sum: number, t: string) => sum + t.length, 0);
        const avgWordLen = totalLen / tokens.length;
        complexityScores.push(Math.min(avgWordLen / 10.0, 1.0));
      } else {
        complexityScores.push(0.5);
      }

      // Engagement
      const questionCount = (text.match(/\?/g) || []).length;
      const ctaHits = Array.from(tokenSet).filter(t => ToneAnalyzer.CTA_MARKERS.has(t)).length;
      engagementScores.push(this.boundedScore(questionCount + ctaHits, 0, 8));

      // Authenticity
      const personalHits = lowerTokens.filter(t => ["i", "my", "me", "we", "our"].includes(t)).length;
      authenticityScores.push(this.boundedScore(personalHits, 0, 10));

      allTokens.push(...lowerTokens);
      sentenceLengths.push(...sentences.map(s => s.trim().split(/\s+/).length));
      
      // Emoji extraction (basic)
      const emojis = text.match(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || [];
      emojiFound.push(...emojis);

      // N-grams
      for (let i = 0; i < lowerTokens.length - 2; i++) {
        ngrams.push(lowerTokens.slice(i, i + 3).join(" "));
      }
    });

    return {
      formality: this.mean(formalityScores),
      emotionality: this.mean(emotionalityScores),
      assertiveness: this.mean(assertivenessScores),
      complexity: this.mean(complexityScores),
      engagement: this.mean(engagementScores),
      authenticity: this.mean(authenticityScores),
      avg_sentence_len: this.mean(sentenceLengths),
      vocabulary_richness: allTokens.length ? new Set(allTokens).size / allTokens.length : 0,
      emoji_patterns: Array.from(new Set(emojiFound)).slice(0, 10),
      signature_phrases: this.topNgrams(ngrams, 5),
    };
  }

  private boundedScore(val: number, min: number, max: number): number {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (val - min) / (max - min)));
  }

  private mean(vals: number[]): number {
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0.5;
  }

  private topNgrams(ngrams: string[], n: number): string[] {
    const freqs: Record<string, number> = {};
    ngrams.forEach(ng => freqs[ng] = (freqs[ng] || 0) + 1);
    return Object.entries(freqs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(entry => entry[0]);
  }
}

export class ContentGenerator {
  private static TEMPLATES: Record<ToneCategory, string[]> = {
    [ToneCategory.AUTHORITATIVE]: [
      "The data is clear: {topic}. Here's what most people get wrong →\n\n① {point_1}\n② {point_2}\n③ {point_3}\n\nThe bottom line: {conclusion}",
      "Unpopular opinion backed by evidence: {topic}.\n\nStudies show {point_1}. Experts confirm {point_2}.\n\nAct accordingly.",
    ],
    [ToneCategory.CONVERSATIONAL]: [
      "okay real talk about {topic} 👀\n\nnobody told me {point_1} and honestly? {point_2}.\n\nstill figuring out {point_3} but that's the journey 🤷",
      "can we normalize talking about {topic}?\n\nbecause {point_1} and I know I'm not alone.\n\n{conclusion} 💯",
    ],
    [ToneCategory.INSPIRATIONAL]: [
      "Everything changed when I understood {topic}.\n\n{point_1}.\n\nIt won't be easy. But {point_2}.\n\nYour future self is counting on you. Start today. 🔥",
      "The gap between where you are and {topic} is just {point_1}.\n\n{point_2}. {point_3}.\n\nYou've got this. ✨",
    ],
    [ToneCategory.EDUCATIONAL]: [
      "Everything you need to know about {topic}:\n\n▸ {point_1}\n▸ {point_2}\n▸ {point_3}\n\nSave this. Share it. {conclusion}",
      "3 things I wish I knew about {topic} earlier:\n\n1/ {point_1}\n2/ {point_2}\n3/ {point_3}\n\n{conclusion}",
    ],
    [ToneCategory.HUMOROUS]: [
      "Me explaining {topic} to literally anyone who will listen:\n\n\"{point_1}\"\n\n[{point_2}]\n\n{conclusion} 😭💀",
      "Hot take: {topic} is just {point_1} with extra steps.\n\nProof:\n• {point_2}\n• {point_3}\n\nI'm not wrong. 🤌",
    ],
    [ToneCategory.CONTROVERSIAL]: [
      "{topic} is broken and nobody wants to say it.\n\n{point_1}. Full stop.\n\n{point_2}. Don't @ me.\n\nChange my mind. ↓",
      "Controversial: {topic} is actually {point_1}.\n\nEvidence: {point_2}.\n\nIf this makes you uncomfortable, good.\n\nThat's where growth starts.",
    ],
  };

  generate(profile: KOLProfile, request: GenerationRequest, contextOverrides?: Record<string, string>): GeneratedContent {
    const tone = getDominantTone([
      profile.fingerprint.formality,
      profile.fingerprint.emotionality,
      profile.fingerprint.assertiveness,
      profile.fingerprint.complexity,
      profile.fingerprint.engagement,
      profile.fingerprint.authenticity
    ]);

    const ctx = {
      topic: request.topic,
      point_1: contextOverrides?.point_1 || `the fundamentals of ${request.topic}`,
      point_2: contextOverrides?.point_2 || `the most overlooked aspect of ${request.topic}`,
      point_3: contextOverrides?.point_3 || `the future of ${request.topic}`,
      conclusion: contextOverrides?.conclusion || "Your move.",
    };

    const templates = ContentGenerator.TEMPLATES[tone];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    let content = template;
    Object.entries(ctx).forEach(([key, val]) => {
      content = content.replace(new RegExp(`{${key}}`, "g"), val);
    });

    const constraints = PLATFORM_CONSTRAINTS[request.platform];
    if (content.length > constraints.max_chars) {
      content = content.substring(0, constraints.max_chars - 3) + "...";
    }

    const hashtags = request.inject_hashtags ? this.generateHashtags(request.topic, profile.niche, request.platform) : [];
    if (hashtags.length > 0) {
      content += "\n\n" + hashtags.join(" ");
    }

    return {
      request_id: Math.random().toString(36).substring(7),
      kol_id: profile.kol_id,
      platform: request.platform,
      content,
      tone_category: tone,
      confidence: 0.9, // Simplified
      char_count: content.length,
      hashtags,
      metadata: { generated_at: Date.now() },
    };
  }

  private generateHashtags(topic: string, niche: string, platform: Platform): string[] {
    const limit = PLATFORM_CONSTRAINTS[platform].hashtag_limit;
    const tags = [
      `#${topic.split(" ")[0].toLowerCase()}`,
      `#${niche.toLowerCase().replace(/\s+/g, "")}`,
      "#growth", "#insights", "#community"
    ];
    return tags.slice(0, limit);
  }
}

export class KOLToneEngine {
  private analyzer = new ToneAnalyzer();
  private generator = new ContentGenerator();

  buildProfile(kol_id: string, name: string, platform: Platform, niche: string, sample_posts: string[]): KOLProfile {
    const fingerprint = this.analyzer.analyze(sample_posts);
    return {
      kol_id,
      name,
      platform,
      niche,
      fingerprint,
      sample_posts,
      created_at: Date.now(),
    };
  }

  generate(profile: KOLProfile, topic: string, platform?: Platform, context?: Record<string, string>): GeneratedContent {
    return this.generator.generate(profile, {
      kol_id: profile.kol_id,
      topic,
      platform: platform || profile.platform,
      content_type: "post",
      inject_hashtags: true
    }, context);
  }
}
