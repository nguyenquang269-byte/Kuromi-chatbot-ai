export type KuromiMood =
  | "playful"
  | "happy"
  | "sassy"
  | "teaching"
  | "storytelling"
  | "thinking"
  | "proud"
  | "caring";

export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  rewardPraise?: string;
  userSelectedIndex?: number;
  isAnsweredCorrectly?: boolean;
}

export interface BadgeAward {
  badgeId: string;
  title: string;
  description: string;
  icon: string;
}

export interface EnglishLearningData {
  word: string;
  meaning: string;
  pronunciation?: string;
  emoji?: string;
  exampleSentence?: string;
  exampleSentenceVi?: string;
  relatedWords?: Array<{ word: string; emoji?: string; meaning?: string }>;
}

export interface VietnameseLearningData {
  letter?: string;
  letterLower?: string;
  isCompound?: boolean;
  compoundComponents?: string; // e.g. "c + h"
  pronunciation?: string;
  strokeType?: string;
  sampleWords?: Array<{ word: string; emoji?: string; meaning?: string }>;
  strokeGuide?: string[];
  rhymePoem?: string;
  standardFontNote?: string; // e.g. "Font HP001 4 hàng / Tiêu học chuẩn Bộ GD&ĐT"
}

export interface MathLearningData {
  operation: "add" | "subtract" | "multiply" | "divide";
  operationSymbol: "+" | "-" | "×" | "÷";
  operand1: number;
  operand2: number;
  result: number;
  operationNameVi: string; // "Phép Cộng", "Phép Trừ", "Phép Nhân", "Phép Chia"
  stepsExplanation: string[];
  visualItems?: {
    emoji: string;
    label: string;
    group1Count: number;
    group2Count: number;
    totalCount: number;
  };
  tableData?: Array<{ formula: string; result: number }>;
  practiceQuiz?: {
    question: string;
    options: number[];
    correctAnswer: number;
    explanation: string;
  };
}

export interface IllustrationCard {
  type:
    | "flashcard"
    | "story_scene"
    | "quiz"
    | "why_explanation"
    | "alphabet"
    | "badge_award"
    | "drawing_canvas"
    | "english_learning"
    | "vietnamese_learning"
    | "math_learning";
  title: string;
  subtitle: string;
  iconCategory?: string;
  contentHtmlOrText?: string;
  points?: string[];
  quiz?: QuizData;
  badgeAwarded?: BadgeAward;
  sceneImagePrompt?: string;
  soundEffect?: string;
  englishData?: EnglishLearningData;
  vietnameseData?: VietnameseLearningData;
  mathData?: MathLearningData;
}

export interface Message {
  id: string;
  sender: "user" | "kuromi" | "system";
  text: string;
  timestamp: number;
  mood?: KuromiMood;
  illustration?: IllustrationCard;
  isOffline?: boolean;
}

export interface MemoryFact {
  id: string;
  date: string;
  category: "like" | "dislike" | "family" | "dream" | "achievement" | "feeling";
  fact: string;
}

export interface StarBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
  category: "language" | "science" | "story" | "friendship" | "quiz";
}

export interface ChildProfile {
  name: string;
  nickname: string;
  age: number;
  interests: string[];
  favoriteColor: string;
  favoriteAnimal: string;
  dreamJob: string;
  level: "Mầm non (3-5 tuổi)" | "Tiểu học lớp 1-2" | "Tiểu học lớp 3-5" | "Khám phá tự do";
  speechRate: number;
  speechPitch: number;
  soundEnabled: boolean;
  autoPlayAudio: boolean;
  themeGothMode: "velvet_dark" | "gothic_pastel" | "candy_pink";
}

export interface PrebuiltLesson {
  id: string;
  title: string;
  category: "alphabet" | "vocabulary" | "why_science" | "fairy_tale" | "riddle" | "confide";
  iconName: string;
  badge: string;
  shortDesc: string;
  promptToAsk: string;
  offlineIllustration: IllustrationCard;
  offlineReply: string;
}

export type ParentGoalMode =
  | "learn_english"
  | "learn_vietnamese"
  | "explain_why"
  | "storytelling"
  | "confide"
  | "play_games";

export type KuromiOutfitId =
  | "classic_goth"
  | "biker_leader"
  | "master_chef"
  | "romantic_lady"
  | "smart_sensei"
  | "sakura_kimono"
  | "space_astronaut"
  | "fairy_princess"
  | "detective_sherlock"
  | "punk_rocker"
  | "magical_girl"
  | "ocean_mermaid"
  | "doctor_nurse"
  | "artist_painter"
  | "super_heroine"
  | "cosy_pajamas"
  | "sailor_school"
  | "winter_snow"
  | "ninja_shadow"
  | "sports_champion"
  | "circus_ringmaster"
  | "flower_fairy"
  | "cyber_punk2077"
  | "baker_pastry"
  | "royal_queen"
  | "rainbow_unicorn";

export type KuromiAccessoryId =
  | "none"
  | "kuromi_note"
  | "shallots_skewer"
  | "rocker_sunglasses"
  | "magic_wand"
  | "punk_crown"
  | "electric_guitar";

export type KuromiHeadwearId =
  | "pink_skull"
  | "giant_pink_bow"
  | "witch_hat"
  | "sakura_flower"
  | "biker_bandana";

export interface KuromiWardrobeState {
  outfit: KuromiOutfitId;
  accessory: KuromiAccessoryId;
  headwear: KuromiHeadwearId;
}

export interface ParentSettings {
  activePurposes: ParentGoalMode[];
  mandatoryPrompt: string;
  samplePrompts: string[];
  enableVoiceInput: boolean;
  parentPin?: string;
  // Multi API Key rotation pool (up to 5 keys)
  apiKeys?: string[];
  // Prompt Optimization & Token Reduction Settings
  historyTurnsToKeep?: number; // e.g., 3 turns
  compactPromptMode?: boolean; // combine history and profile into a compact unified prompt
  includeChildProfileInPrompt?: boolean; // seamlessly inject child's personal info
}
