import { ChildProfile, Message, MemoryFact, StarBadge, ParentSettings } from "../types";
import { INITIAL_BADGES } from "../data/badges";

const STORAGE_KEYS = {
  PROFILE: "kuromi_child_profile_v1",
  PARENT_SETTINGS: "kuromi_parent_settings_v1",
  MESSAGES: "kuromi_chat_history_v1",
  MEMORIES: "kuromi_memory_ledger_v1",
  BADGES: "kuromi_star_badges_v1",
  OFFLINE_CACHE: "kuromi_offline_cache_v1",
  LAST_SYNC: "kuromi_last_sync_timestamp",
};

export const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  activePurposes: [
    "learn_vietnamese",
    "learn_english",
    "explain_why",
    "storytelling",
    "confide",
    "play_games",
  ],
  mandatoryPrompt:
    "Luôn xưng hô thân mật là Kuromi và gọi bé bằng tên. Giọng điệu nữ tính, nhí nhảnh, dễ thương, kiên nhẫn và hay cười vui vẻ. Khuyến khích bé nói trọn câu và dạ/vâng lễ phép. Hướng dẫn viết chữ chuẩn mẫu HP001 4 ô ly, từ vựng tiếng Anh có phiên âm, toán học trực quan và kể chuyện sinh động.",
  samplePrompts: [
    "✍️ Dạy bé viết chữ A chuẩn ô ly HP001",
    "🇻🇳 Dạy bé chữ cái & đánh vần tiếng Việt",
    "🇬🇧 Dạy bé từ vựng tiếng Anh (kèm phát âm & ví dụ)",
    "🧮 Đố bé 1 bài toán vui cộng trừ hình ảnh",
    "🔬 Kuromi ơi, vì sao cầu vồng lại có 7 màu sắc?",
    "📖 Kể chuyện cổ tích Sự Tích Cây Khế",
    "🎮 Đố bé một câu đố vui dân gian thật hay!",
    "😂 Kể một câu chuyện cười nhí nhảnh cho bé",
    "💖 Hôm nay bé có chuyện vui muốn kể cho Kuromi",
    "🎨 Mở bảng vẽ ô ly để bé tập viết chữ",
  ],
  enableVoiceInput: true,
  apiKeys: [],
  historyTurnsToKeep: 3,
  compactPromptMode: true,
  includeChildProfileInPrompt: true,
};

export const DEFAULT_PROFILE: ChildProfile = {
  name: "",
  nickname: "",
  age: 6,
  interests: ["Khám phá vũ trụ", "Vẽ tranh", "Nuôi mèo con", "Ăn kem dâu"],
  favoriteColor: "Tím Pastel & Hồng Neon",
  favoriteAnimal: "Mèo Mun & Thỏ Trắng",
  dreamJob: "Nhà Thám Hiểm Vũ Trụ & Cô Giáo",
  level: "Tiểu học lớp 1-2",
  speechRate: 1.08,
  speechPitch: 1.50,
  soundEnabled: true,
  autoPlayAudio: true,
  themeGothMode: "velvet_dark",
};

export const INITIAL_MEMORIES: MemoryFact[] = [
  {
    id: "mem_1",
    date: new Date().toLocaleDateString("vi-VN"),
    category: "like",
    fact: "Bé rất thích màu tím pastel và các câu chuyện về bạn mèo con.",
  },
  {
    id: "mem_2",
    date: new Date().toLocaleDateString("vi-VN"),
    category: "dream",
    fact: "Ước mơ của bé là trở thành một nhà thám hiểm thông thái và biết nói giỏi tiếng Việt!",
  },
];

export function getStoredProfile(): ChildProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        interests: Array.isArray(parsed.interests) ? parsed.interests : DEFAULT_PROFILE.interests,
      };
    }
  } catch {}
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: ChildProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {}
}

export function getStoredParentSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARENT_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PARENT_SETTINGS,
        ...parsed,
        activePurposes: Array.isArray(parsed.activePurposes)
          ? parsed.activePurposes
          : DEFAULT_PARENT_SETTINGS.activePurposes,
        samplePrompts: Array.isArray(parsed.samplePrompts)
          ? parsed.samplePrompts
          : DEFAULT_PARENT_SETTINGS.samplePrompts,
      };
    }
  } catch {}
  return DEFAULT_PARENT_SETTINGS;
}

export function saveStoredParentSettings(settings: ParentSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.PARENT_SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function getStoredMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveStoredMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch {}
}

export function getStoredMemories(): MemoryFact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_MEMORIES;
}

export function saveStoredMemories(memories: MemoryFact[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  } catch {}
}

export function getStoredBadges(): StarBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_BADGES;
}

export function saveStoredBadges(badges: StarBadge[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  } catch {}
}

export async function syncToCloud(payload: {
  profile: ChildProfile;
  chatHistory: Message[];
  memories: MemoryFact[];
  badges: StarBadge[];
}) {
  try {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return { success: true, data };
    }
  } catch (err) {
    console.warn("Cloud sync deferred due to offline connectivity:", err);
  }
  return { success: false, message: "Đang lưu tạm ở bộ nhớ máy. Sẽ tự đồng bộ khi có mạng!" };
}
