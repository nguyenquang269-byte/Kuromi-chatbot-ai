/**
 * Audio Synthesizer & Speech utilities for Kuromi Chatbot
 * Works 100% offline using Web Audio API and Web Speech API
 */

// Synthesized audio effects for cute feedback
class SoundFX {
  private ctx: AudioContext | null = null;

  private getContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a sparkling sound
  playSparkle() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [659.25, 880.0, 1046.5, 1318.5]; // E5, A5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.1, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch {}
  }

  // Play a cheerful magical chime when Kuromi responds or rewards
  playMagicChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // Audio context might be restricted
    }
  }

  // Correct answer fanfare
  playSuccessFanfare() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.18, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.45);
      });
    } catch {}
  }

  // Cute pop sound for button clicks
  playPop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Cute Kuromi laugh / giggle beep (nhí nhảnh, dễ thương)
  playGiggle() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // High-pitched playful rising-falling cheerful giggle melody (hi-hi-hi-hi)
      const giggleFrequencies = [780, 980, 1150, 980, 1200, 1050];
      giggleFrequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.055);
        // Add tiny vibrato to sound extra cute & cheerful
        osc.frequency.linearRampToValueAtTime(freq + 40, now + i * 0.055 + 0.03);
        gain.gain.setValueAtTime(0.1, now + i * 0.055);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.055);
        osc.stop(now + i * 0.055 + 0.055);
      });
    } catch {}
  }

  // Authentic Kuromi signature cute anime chuckle
  playCuteKuromiGiggle() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // 3 sweet melodic laugh waves
      const bursts = [
        { freqs: [880, 1100], offset: 0 },
        { freqs: [950, 1200], offset: 0.12 },
        { freqs: [1050, 1350], offset: 0.24 },
      ];

      bursts.forEach((burst) => {
        burst.freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          const startT = now + burst.offset + idx * 0.03;
          osc.frequency.setValueAtTime(freq, startT);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.08, startT + 0.05);
          gain.gain.setValueAtTime(0.09, startT);
          gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startT);
          osc.stop(startT + 0.075);
        });
      });
    } catch {}
  }
}

export const soundFX = new SoundFX();

// Regular expression matching Vietnamese characters with diacritics
const VIETNAMESE_CHAR_REGEX =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

// Interface for speech segments
interface SpeechSegment {
  text: string;
  lang: "vi-VN" | "en-US";
}

// Global active session ID to prevent stale callbacks from playing old text
let globalSpeechSessionId = 0;

/**
 * Split text into language-specific segments so English words/sentences are spoken
 * with a genuine English TTS voice, and Vietnamese sentences with a Vietnamese TTS voice!
 */
export function segmentTextByLanguage(text: string): SpeechSegment[] {
  // Clean emojis, markdown and unwanted formatting
  const clean = text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/[#*_~`\[\]()]/g, "")
    .replace(/http\S+/g, "")
    .trim();

  if (!clean) return [];

  // Check if the entire string has NO Vietnamese diacritics and is English
  const hasAnyViDiacritics = VIETNAMESE_CHAR_REGEX.test(clean);
  if (!hasAnyViDiacritics && /^[a-zA-Z0-9\s.,!?'\-\/:]+$/.test(clean)) {
    // Check if it has obvious Vietnamese unaccented words
    const commonViUnaccented = new Set([
      "la", "va", "co", "con", "em", "anh", "chi", "me", "ba", "ong",
      "cho", "di", "den", "khi", "nhu", "sao", "gi", "ai", "dau", "nay", "do",
      "mot", "hai", "ba", "bon", "nam", "sau", "bay", "tam", "chin", "muoi", "doc", "viet", "hoc", "be", "xin", "chao", "ngay"
    ]);
    const words = clean.toLowerCase().split(/\s+/).filter(Boolean);
    const viWordCount = words.filter((w) => commonViUnaccented.has(w)).length;
    if (viWordCount === 0 || viWordCount < words.length * 0.25) {
      return [{ text: clean, lang: "en-US" }];
    }
  }

  // Split into sentences / meaningful phrases based on quotes, colons, or punctuation
  const chunks = clean
    .split(/(["'“”«»][^"'“”«»]+["'“”«»]|(?<=[.!?:\n])\s+)/g)
    .filter(Boolean);

  const segments: SpeechSegment[] = [];

  for (const rawChunk of chunks) {
    const trimmed = rawChunk.trim();
    if (!trimmed) continue;

    const unquoted = trimmed.replace(/^["'“”«»]|["'“”«»]$/g, "").trim();
    if (!unquoted) continue;

    const hasVietnameseDiacritics = VIETNAMESE_CHAR_REGEX.test(unquoted);
    const isPureEnglish = /^[a-zA-Z0-9\s.,!?'\-\/:]+$/.test(unquoted);

    const commonVietnameseNonAccented = new Set([
      "la", "va", "co", "con", "em", "anh", "chi", "me", "ba", "ong",
      "cho", "di", "den", "khi", "nhu", "sao", "gi", "ai", "dau", "nay", "do",
      "mot", "hai", "ba", "bon", "nam", "sau", "bay", "tam", "chin", "muoi", "doc", "viet", "hoc", "be", "chao"
    ]);

    const words = unquoted.toLowerCase().split(/\s+/).filter(Boolean);
    const hasCommonVi = words.some((w) => commonVietnameseNonAccented.has(w));

    let lang: "vi-VN" | "en-US" = "vi-VN";

    if (hasVietnameseDiacritics) {
      lang = "vi-VN";
    } else if (isPureEnglish && !hasCommonVi && unquoted.length >= 2) {
      lang = "en-US";
    } else {
      lang = "vi-VN";
    }

    if (segments.length > 0 && segments[segments.length - 1].lang === lang) {
      segments[segments.length - 1].text += " " + unquoted;
    } else {
      segments.push({ text: unquoted, lang });
    }
  }

  if (segments.length === 0) {
    const isEng = !VIETNAMESE_CHAR_REGEX.test(clean) && /^[a-zA-Z0-9\s.,!?'\-\/:]+$/.test(clean);
    segments.push({ text: clean, lang: isEng ? "en-US" : "vi-VN" });
  }

  return segments;
}

/**
 * Intelligent Web Speech Text to Speech (TTS) that seamlessly speaks
 * English parts in English (en-US) and Vietnamese parts in Vietnamese (vi-VN)!
 * Ensures stale previous utterances are cancelled completely.
 */
export function speakKuromiText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    forceLang?: "vi-VN" | "en-US";
    onStart?: () => void;
    onEnd?: () => void;
  }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  // Increment session ID to cancel any prior speech queue or stale asynchronous callback
  const currentSessionId = ++globalSpeechSessionId;

  // Cancel any ongoing speech in the browser immediately
  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/[#*_~`\[\]()]/g, "")
    .replace(/http\S+/g, "")
    .trim();

  if (!cleanText) return;

  const voices = window.speechSynthesis.getVoices();

  // Helper to find the best cute female voice for a specific language code
  const getBestVoice = (targetLang: "vi-VN" | "en-US") => {
    const langPrefix = targetLang.slice(0, 2).toLowerCase();
    const isVietnamese = langPrefix === "vi";

    const maleFilter = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.includes("namminh") ||
        lower.includes("nam minh") ||
        lower.includes("male") ||
        lower.includes("david") ||
        lower.includes("guy") ||
        lower.includes("george") ||
        lower.includes("mark") ||
        lower.includes("vietnamese male")
      );
    };

    const isFemalePreferred = (name: string) => {
      const lower = name.toLowerCase();
      if (isVietnamese) {
        return (
          lower.includes("linh") ||
          lower.includes("mai") ||
          lower.includes("hoaimy") ||
          lower.includes("hoài my") ||
          lower.includes("google tiếng việt") ||
          lower.includes("female") ||
          lower.includes("nữ") ||
          lower.includes("nu") ||
          lower.includes("natural") ||
          lower.includes("gtts")
        );
      } else {
        return (
          lower.includes("samantha") ||
          lower.includes("jenny") ||
          lower.includes("aria") ||
          lower.includes("victoria") ||
          lower.includes("zira") ||
          lower.includes("karen") ||
          lower.includes("ana") ||
          lower.includes("emma") ||
          lower.includes("female") ||
          lower.includes("natural") ||
          lower.includes("google us english") ||
          lower.includes("google uk english female")
        );
      }
    };

    // 1. High priority: Match language + Explicit female name without male flags
    const femaleVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(langPrefix) &&
        !maleFilter(v.name) &&
        isFemalePreferred(v.name)
    );
    if (femaleVoice) return femaleVoice;

    // 2. Medium priority: Match language + Not marked as male
    const nonMaleVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(langPrefix) &&
        !maleFilter(v.name)
    );
    if (nonMaleVoice) return nonMaleVoice;

    // 3. Fallback: Any voice of this language
    return voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
  };

  // Default lively, cute, cheerful female pitch and rate for Kuromi
  const DEFAULT_VI_PITCH = 1.50; // Cute, youthful, cheerful female pitch
  const DEFAULT_VI_RATE = 1.08;  // Lively & playful
  const DEFAULT_EN_PITCH = 1.45;
  const DEFAULT_EN_RATE = 1.02;

  // If forced language is provided, speak single utterance directly in that language
  if (options?.forceLang) {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.forceLang;
    utterance.pitch = options?.pitch ?? (options.forceLang === "en-US" ? DEFAULT_EN_PITCH : DEFAULT_VI_PITCH);
    utterance.rate = options?.rate ?? (options.forceLang === "en-US" ? DEFAULT_EN_RATE : DEFAULT_VI_RATE);

    const matchedVoice = getBestVoice(options.forceLang);
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onstart = () => {
      if (globalSpeechSessionId !== currentSessionId) return;
      if (options?.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (globalSpeechSessionId !== currentSessionId) return;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      if (globalSpeechSessionId !== currentSessionId) return;
      if (options?.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return;
  }

  // Otherwise, split into multi-language segments for natural bilingual reading
  const segments = segmentTextByLanguage(text);
  if (segments.length === 0) return;

  let currentIndex = 0;
  let hasStarted = false;

  const speakNextSegment = () => {
    // Check if session is still valid
    if (globalSpeechSessionId !== currentSessionId) return;

    if (currentIndex >= segments.length) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    const segment = segments[currentIndex];
    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.lang = segment.lang;

    utterance.pitch = options?.pitch ?? (segment.lang === "en-US" ? DEFAULT_EN_PITCH : DEFAULT_VI_PITCH);
    utterance.rate = options?.rate ?? (segment.lang === "en-US" ? DEFAULT_EN_RATE : DEFAULT_VI_RATE);

    const voiceForLang = getBestVoice(segment.lang);
    if (voiceForLang) {
      utterance.voice = voiceForLang;
    }

    utterance.onstart = () => {
      if (globalSpeechSessionId !== currentSessionId) return;
      if (!hasStarted) {
        hasStarted = true;
        if (options?.onStart) options.onStart();
      }
    };

    utterance.onend = () => {
      if (globalSpeechSessionId !== currentSessionId) return;
      currentIndex++;
      speakNextSegment();
    };

    utterance.onerror = () => {
      if (globalSpeechSessionId !== currentSessionId) return;
      currentIndex++;
      speakNextSegment();
    };

    window.speechSynthesis.speak(utterance);
  };

  speakNextSegment();
}

/**
 * Spoken cute Kuromi giggle / laugh voice helper
 */
export function speakKuromiGiggle(customLaugh?: string, onEnd?: () => void) {
  const laughs = [
    "Hi hi hi~ ✨",
    "Hí hí! Vui quá đi à! 💖",
    "He he he! Nhí nhảnh ghê chưa nè! 🎀",
    "Hi hi~ bạn nhỏ đáng yêu ghê á! 🌸",
    "Hí hí hí~ ✨",
  ];
  const phrase = customLaugh || laughs[Math.floor(Math.random() * laughs.length)];
  soundFX.playCuteKuromiGiggle();
  speakKuromiText(phrase, {
    pitch: 1.58,
    rate: 1.15,
    forceLang: "vi-VN",
    onEnd,
  });
}

export function stopSpeaking() {
  globalSpeechSessionId++;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
