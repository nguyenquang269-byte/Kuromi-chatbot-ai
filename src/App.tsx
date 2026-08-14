/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Message,
  ChildProfile,
  MemoryFact,
  StarBadge,
  IllustrationCard,
  KuromiMood,
  PrebuiltLesson,
  ParentSettings,
} from "./types";
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredMessages,
  saveStoredMessages,
  getStoredMemories,
  saveStoredMemories,
  getStoredBadges,
  saveStoredBadges,
  getStoredParentSettings,
  saveStoredParentSettings,
  syncToCloud,
  DEFAULT_PROFILE,
  DEFAULT_PARENT_SETTINGS,
} from "./utils/storage";
import { PREBUILT_LESSONS } from "./data/curriculum";
import {
  calculateMathProblem,
  VIETNAMESE_29_LETTERS,
  VIETNAMESE_COMPOUND_LETTERS,
} from "./data/vietnameseCurriculum";
import { ENGLISH_50_WORDS } from "./data/english50Words";
import { soundFX, speakKuromiText, stopSpeaking } from "./utils/speech";
import { HeaderBar } from "./components/HeaderBar";
import { KuromiAvatar } from "./components/KuromiAvatar";
import { ChatView } from "./components/ChatView";
import { IllustrationBoard } from "./components/IllustrationBoard";
import { ParentSettingsModal } from "./components/ParentSettingsModal";

export default function App() {
  const [childProfile, setChildProfile] = useState<ChildProfile>(getStoredProfile);
  const [parentSettings, setParentSettings] = useState<ParentSettings>(getStoredParentSettings);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryFact[]>(getStoredMemories);
  const [badges, setBadges] = useState<StarBadge[]>(getStoredBadges);
  const [currentIllustration, setCurrentIllustration] = useState<IllustrationCard | null>(null);
  const [activeMood, setActiveMood] = useState<KuromiMood>("playful");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isIllustrationBoardOpen, setIsIllustrationBoardOpen] = useState<boolean>(false);

  // Initialize network listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize messages or welcome message
  useEffect(() => {
    const loadedMessages = getStoredMessages();
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
      const lastMsg = loadedMessages[loadedMessages.length - 1];
      if (lastMsg.illustration) {
        setCurrentIllustration(lastMsg.illustration);
      }
    } else {
      // Create initial welcoming greeting from Kuromi
      const welcomeIllustration: IllustrationCard = {
        type: "alphabet",
        title: "Chào Mừng Đến Với Kuromi! 🎀",
        subtitle: "Cô giáo & người bạn đồng hành thông thái của bé",
        points: [
          "1. 🇻🇳 Học tiếng Việt & bảng chữ cái vui nhộn",
          "2. 🇬🇧 Làm quen với từ vựng tiếng Anh dễ hiểu",
          "3. 🔬 Giải đáp vạn câu hỏi vì sao kỳ thú",
          "4. 📖 Kể chuyện cổ tích & lắng nghe tâm sự",
          "5. 🎮 Đố vui thông minh & bảng vẽ sáng tạo",
        ],
      };

      const welcomeMsg: Message = {
        id: "msg_welcome_1",
        sender: "kuromi",
        text: `Hehe~ Xin chào ${childProfile.name?.trim() ? childProfile.name.trim() : "bạn nhỏ"} đáng yêu! Kuromi-sama đây! Hôm nay bạn muốn cùng Kuromi học tiếng Việt, học tiếng Anh, nghe kể chuyện hay khám phá điều gì nào?`,
        timestamp: Date.now(),
        mood: "playful",
        illustration: welcomeIllustration,
      };

      setMessages([welcomeMsg]);
      setCurrentIllustration(welcomeIllustration);
      saveStoredMessages([welcomeMsg]);
    }
  }, []);

  // Award badge helper
  const handleAwardBadge = useCallback(
    (badgeId: string, title: string, description: string, icon: string) => {
      setBadges((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const existing = safePrev.find((b) => b && b.id === badgeId);
        if (existing && existing.earnedAt) return safePrev;

        const updated = safePrev.map((b) =>
          b.id === badgeId ? { ...b, earnedAt: new Date().toISOString() } : b
        );

        if (!existing) {
          updated.push({
            id: badgeId,
            title,
            description,
            icon,
            category: "language",
            earnedAt: new Date().toISOString(),
          });
        }

        saveStoredBadges(updated);
        return updated;
      });
    },
    []
  );

  // Offline intelligent rule-based fallback response engine
  const generateOfflineResponse = (userText: string) => {
    const lower = userText.toLowerCase();

    // 1. Check math queries (+, -, *, /, cộng, trừ, nhân, chia, cửu chương)
    const mathResult = calculateMathProblem(userText);
    if (mathResult) {
      return {
        reply: `Hehe! Phép tính ${mathResult.operand1} ${mathResult.operationSymbol} ${mathResult.operand2} = ${mathResult.result} nha! Kuromi đã mở bảng giải toán trực quan với ${mathResult.visualItems?.label || "que tính"} ${mathResult.visualItems?.emoji || "🍎"} và từng bước giải cho bé xem rồi nè!`,
        mood: "teaching" as KuromiMood,
        illustration: {
          type: "math_learning" as const,
          title: `Toán Học: ${mathResult.operand1} ${mathResult.operationSymbol} ${mathResult.operand2} = ${mathResult.result}`,
          subtitle: mathResult.operationNameVi,
          mathData: mathResult,
        },
      };
    }

    // 2. Check Vietnamese Alphabet (29 Single letters + 11 Compound letters)
    const allViLetters = [...VIETNAMESE_COMPOUND_LETTERS, ...VIETNAMESE_29_LETTERS];
    const foundVi = allViLetters.find((item) => {
      const letLow = item.letter.toLowerCase();
      const soundLow = item.sound.toLowerCase();
      return (
        lower.includes(`chữ ${letLow}`) ||
        lower.includes(`âm ${soundLow}`) ||
        lower.includes(`vần ${letLow}`) ||
        lower === letLow ||
        lower === item.letter ||
        lower.includes(`chữ ghép ${letLow}`)
      );
    });

    if (foundVi) {
      return {
        reply: `Hehe! Chữ '${foundVi.letter}' (đọc là âm "${foundVi.sound}", viết thường ô ly là '${foundVi.lower}')! Kuromi đã mở bảng ô ly chuẩn HP001 cho bé ngắm và tập viết nè! 🌸 "${foundVi.rhymePoem}"`,
        mood: "teaching" as KuromiMood,
        illustration: {
          type: "vietnamese_learning" as const,
          title: `Chữ Cái Tiếng Việt: ${foundVi.letter} - ${foundVi.lower}`,
          subtitle: `Âm ${foundVi.sound} - Chuẩn Vở Ô Ly HP001`,
          vietnameseData: {
            letter: foundVi.letter,
            letterLower: foundVi.lower,
            pronunciation: foundVi.sound,
            strokeType: foundVi.strokeType,
            sampleWords: foundVi.sampleWords,
            strokeGuide: foundVi.strokeGuide,
            rhymePoem: foundVi.rhymePoem,
          },
        },
      };
    }

    // 3. Check prebuilt lessons match
    for (const lesson of PREBUILT_LESSONS) {
      if (
        (lower.includes("chicken") && lesson.id === "lesson_english_chicken") ||
        (lower.includes("cat") && lesson.id === "lesson_english_cat") ||
        (lower.includes("chữ a") && lesson.id === "lesson_alphabet_a") ||
        ((lower.includes("chữ b") || lower.includes("chữ bờ")) && lesson.id === "lesson_alphabet_b") ||
        ((lower.includes("mưa") || lower.includes("trời mưa")) && lesson.id === "why_rain") ||
        ((lower.includes("cầu vồng") || lower.includes("7 màu")) && lesson.id === "why_rainbow") ||
        ((lower.includes("mèo") || lower.includes("gừ gừ")) && lesson.id === "why_cats_purr") ||
        ((lower.includes("cây khế") || lower.includes("khế")) && lesson.id === "story_carambola_tree") ||
        ((lower.includes("rùa") || lower.includes("thỏ")) && lesson.id === "story_tortoise_hare") ||
        ((lower.includes("đố vui") || lower.includes("câu đố")) && lesson.id === "riddle_folk_1") ||
        ((lower.includes("buồn") || lower.includes("tâm sự") || lower.includes("lo")) && lesson.id === "confide_cheerup")
      ) {
        return {
          reply: lesson.offlineReply,
          mood:
            lesson.category === "alphabet" || lesson.category === "vocabulary"
              ? ("teaching" as KuromiMood)
              : lesson.category === "fairy_tale"
              ? ("storytelling" as KuromiMood)
              : lesson.category === "confide"
              ? ("caring" as KuromiMood)
              : ("playful" as KuromiMood),
          illustration: lesson.offlineIllustration,
        };
      }
    }

    // 4. Dynamic English word check (50 English words)
    const foundEng = ENGLISH_50_WORDS.find(
      (w) => lower.includes(w.word.toLowerCase()) || lower.includes(w.meaning.toLowerCase())
    );
    if (foundEng) {
      return {
        reply: `Hehe! Từ '${foundEng.word}' ${foundEng.pronunciation} trong tiếng Anh có nghĩa là ${foundEng.meaning} ${foundEng.emoji} đó nha! Kuromi đã mở bảng minh họa từ vựng cho bé xem rồi nè!`,
        mood: "teaching" as KuromiMood,
        illustration: {
          type: "english_learning" as const,
          title: `Học Tiếng Anh: ${foundEng.word.toUpperCase()} ${foundEng.emoji}`,
          subtitle: `Từ vựng tiếng Anh chủ đề ${foundEng.category}`,
          englishData: {
            word: foundEng.word,
            meaning: foundEng.meaning,
            pronunciation: foundEng.pronunciation,
            emoji: foundEng.emoji,
            exampleSentence: foundEng.sentence,
            exampleSentenceVi: foundEng.sentenceVi,
            relatedWords: [
              { word: foundEng.word, emoji: foundEng.emoji, meaning: foundEng.meaning },
            ],
          },
        },
      };
    }

    // 5. Dynamic Vietnamese letter general check
    if (lower.includes("chữ") || lower.includes("tiếng việt") || lower.includes("tập viết") || lower.includes("ô ly")) {
      const defaultVi = VIETNAMESE_29_LETTERS[0];
      return {
        reply: `Hehe, Kuromi dạy bé chữ '${defaultVi.letter}' (phát âm là ${defaultVi.sound}, viết thường là '${defaultVi.lower}') nhé! Kuromi đã mở bảng vở ô ly 4 hàng chuẩn HP001 cho bé nè!`,
        mood: "teaching" as KuromiMood,
        illustration: {
          type: "vietnamese_learning" as const,
          title: `Chữ Cái Tiếng Việt: ${defaultVi.letter} - ${defaultVi.lower}`,
          subtitle: `Âm ${defaultVi.sound} - Tập đọc và tập viết ô ly HP001`,
          vietnameseData: {
            letter: defaultVi.letter,
            letterLower: defaultVi.lower,
            pronunciation: defaultVi.sound,
            strokeType: defaultVi.strokeType,
            sampleWords: defaultVi.sampleWords,
            strokeGuide: defaultVi.strokeGuide,
            rhymePoem: defaultVi.rhymePoem,
          },
        },
      };
    }

    // Generic friendly offline answer
    const currentChildName = childProfile.nickname?.trim() || childProfile.name?.trim() || "bạn nhỏ";
    return {
      reply: `Hehe, Kuromi ghi nhận câu hỏi của ${currentChildName} nè! Bé có thể hỏi Kuromi bất kỳ phép tính toán cộng trừ nhân chia (+, -, ×, ÷) hoặc 29 chữ cái, 11 chữ ghép tiếng Việt trên vở ô ly HP001 nha!`,
      mood: "happy" as KuromiMood,
      illustration: {
        type: "flashcard" as const,
        title: "Khám Phá Cùng Kuromi 🎀",
        subtitle: `Dành riêng cho bạn ${currentChildName}`,
        points: [
          "Học 29 chữ cái & 11 chữ ghép chuẩn font HP001 4 hàng",
          "Giải nhanh toán cộng, trừ, nhân, chia trực quan que tính",
          "Kho 50 từ vựng tiếng Anh kèm phát âm sinh động",
          "Bảng vẽ tự do và tập viết nét trên ô ly tiểu học",
        ],
      },
    };
  };

  // Send message handler (Online with Gemini API or Offline fallback)
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveStoredMessages(newMessages);
    setIsLoading(true);

    try {
      if (isOnline) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: newMessages.slice(-6),
            childProfile,
            parentSettings,
            activeTopic: "vietnamese_education",
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        const kuromiReply = data.reply || "Kuromi-sama đã sẵn sàng tiếp tục cùng bạn!";
        const mood = (data.mood as KuromiMood) || "playful";
        let illustration = data.illustration || null;
        if (illustration) {
          if (!Array.isArray(illustration.points)) {
            illustration.points = [];
          }
          if (illustration.quiz && !Array.isArray(illustration.quiz.options)) {
            illustration.quiz.options = [];
          }
        }

        // Process detected memory fact
        if (data.detectedMemoryFact?.fact) {
          const newMem: MemoryFact = {
            id: `mem_${Date.now()}`,
            date: new Date().toLocaleDateString("vi-VN"),
            category: data.detectedMemoryFact.category || "like",
            fact: data.detectedMemoryFact.fact,
          };
          const safeMems = Array.isArray(memories) ? memories : [];
          const updatedMems = [newMem, ...safeMems];
          setMemories(updatedMems);
          saveStoredMemories(updatedMems);
        }

        // Process badge award
        if (data.illustration?.badgeAwarded) {
          const b = data.illustration.badgeAwarded;
          handleAwardBadge(b.badgeId, b.title, b.description, b.icon);
        }

        const kuromiMsg: Message = {
          id: `kro_${Date.now()}`,
          sender: "kuromi",
          text: kuromiReply,
          timestamp: Date.now(),
          mood,
          illustration,
          isOffline: false,
        };

        const finalMessages = [...newMessages, kuromiMsg];
        setMessages(finalMessages);
        saveStoredMessages(finalMessages);
        setActiveMood(mood);
        if (illustration) setCurrentIllustration(illustration);

        soundFX.playMagicChime();

        if (childProfile.autoPlayAudio) {
          speakKuromiText(kuromiReply, {
            rate: childProfile.speechRate,
            pitch: childProfile.speechPitch,
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          });
        }
      } else {
        // Offline handling
        const offlineResult = generateOfflineResponse(text);
        const kuromiMsg: Message = {
          id: `kro_${Date.now()}`,
          sender: "kuromi",
          text: offlineResult.reply,
          timestamp: Date.now(),
          mood: offlineResult.mood,
          illustration: offlineResult.illustration,
          isOffline: true,
        };

        const finalMessages = [...newMessages, kuromiMsg];
        setMessages(finalMessages);
        saveStoredMessages(finalMessages);
        setActiveMood(offlineResult.mood);
        if (offlineResult.illustration) {
          setCurrentIllustration(offlineResult.illustration);
        }

        soundFX.playMagicChime();

        if (childProfile.autoPlayAudio) {
          speakKuromiText(offlineResult.reply, {
            rate: childProfile.speechRate,
            pitch: childProfile.speechPitch,
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
          });
        }
      }
    } catch (err) {
      console.warn("Online API call error, switching seamlessly to offline logic:", err);
      const offlineResult = generateOfflineResponse(text);
      const kuromiMsg: Message = {
        id: `kro_${Date.now()}`,
        sender: "kuromi",
        text: offlineResult.reply,
        timestamp: Date.now(),
        mood: offlineResult.mood,
        illustration: offlineResult.illustration,
        isOffline: true,
      };

      const finalMessages = [...newMessages, kuromiMsg];
      setMessages(finalMessages);
      saveStoredMessages(finalMessages);
      setActiveMood(offlineResult.mood);
      if (offlineResult.illustration) {
        setCurrentIllustration(offlineResult.illustration);
      }

      if (childProfile.autoPlayAudio) {
        speakKuromiText(offlineResult.reply, {
          rate: childProfile.speechRate,
          pitch: childProfile.speechPitch,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Select a prebuilt lesson directly
  const handleSelectLesson = (lesson: PrebuiltLesson) => {
    setCurrentIllustration(lesson.offlineIllustration);
    handleSendMessage(lesson.promptToAsk);
  };

  // Reset chat handler
  const handleResetChat = () => {
    stopSpeaking();
    const confirmReset = window.confirm(
      "Bé có muốn bắt đầu một buổi học mới cùng Kuromi không nào?"
    );
    if (confirmReset) {
      localStorage.removeItem("kuromi_chat_history_v1");
      const initialIllustration: IllustrationCard = {
        type: "alphabet",
        title: "Buổi Học Mới Cùng Kuromi 🎀",
        subtitle: `Chào mừng ${childProfile.name || "bạn nhỏ"} trở lại!`,
        points: ["Bé hãy chọn một câu hỏi gợi ý hoặc trò chuyện cùng Kuromi nha!"],
      };
      const welcomeMsg: Message = {
        id: `kro_new_${Date.now()}`,
        sender: "kuromi",
        text: `Hehe, một ngày mới tràn ngập niềm vui nhé ${childProfile.name || "bạn nhỏ"}! Hôm nay bạn muốn Kuromi dạy bài học gì nào?`,
        timestamp: Date.now(),
        mood: "happy",
        illustration: initialIllustration,
      };
      setMessages([welcomeMsg]);
      setCurrentIllustration(initialIllustration);
      saveStoredMessages([welcomeMsg]);
      soundFX.playPop();
    }
  };

  // Save profile changes
  const handleSaveProfile = (updated: ChildProfile) => {
    setChildProfile(updated);
    saveStoredProfile(updated);
  };

  // Save parent settings changes
  const handleSaveParentSettings = (updated: ParentSettings) => {
    setParentSettings(updated);
    saveStoredParentSettings(updated);
  };

  return (
    <div
      className="flex flex-col h-screen w-screen bg-[#0d0716] text-purple-100 font-sans select-none overflow-hidden"
      id="app-root"
    >
      {/* Background Subtle Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff31b9]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <HeaderBar
        isOnline={isOnline}
        onToggleOnlineMode={() => setIsOnline(!isOnline)}
        childProfile={childProfile}
        badges={badges}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onResetChat={handleResetChat}
        isIllustrationBoardOpen={isIllustrationBoardOpen}
        onToggleIllustrationBoard={() => setIsIllustrationBoardOpen(!isIllustrationBoardOpen)}
      />

      {/* Main Educational Workspace */}
      <main
        className="flex-1 p-2 sm:p-3 md:p-4 overflow-hidden relative z-10 flex flex-col"
        id="main-educational-workspace"
      >
        <div className={`w-full h-full grid grid-cols-1 ${isIllustrationBoardOpen ? "lg:grid-cols-12" : "max-w-4xl mx-auto"} gap-3 overflow-hidden`}>
          {/* Main Primary View: Kuromi 3D + Child Conversation */}
          <section
            className={`flex flex-col h-full overflow-hidden ${
              isIllustrationBoardOpen ? "lg:col-span-7" : "col-span-12 w-full"
            }`}
            id="chat-and-mascot-section"
          >
            <ChatView
              messages={messages}
              isLoading={isLoading}
              isOnline={isOnline}
              childProfile={childProfile}
              activeMood={activeMood}
              isSpeaking={isSpeaking}
              samplePrompts={parentSettings.samplePrompts}
              onSendMessage={handleSendMessage}
              onQuickPrompt={handleSendMessage}
              onToggleIllustrationBoard={() => setIsIllustrationBoardOpen(!isIllustrationBoardOpen)}
            />
          </section>

          {/* Desktop Side Column: The Magic Illustration Board */}
          {isIllustrationBoardOpen && (
            <section
              className="hidden lg:flex lg:col-span-5 flex-col h-full overflow-hidden"
              id="magic-illustration-board-section"
            >
              <IllustrationBoard
                currentIllustration={currentIllustration}
                childProfile={childProfile}
                badges={badges}
                memories={memories}
                onSelectLesson={handleSelectLesson}
                onAwardBadge={handleAwardBadge}
                onClose={() => setIsIllustrationBoardOpen(false)}
              />
            </section>
          )}
        </div>

        {/* Mobile Overlay Modal: The Magic Illustration Board on Mobile */}
        {isIllustrationBoardOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-3 flex flex-col justify-end animate-in fade-in duration-200">
            <div className="w-full h-[92vh] max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border-2 border-[#ff31b9]">
              <IllustrationBoard
                currentIllustration={currentIllustration}
                childProfile={childProfile}
                badges={badges}
                memories={memories}
                onSelectLesson={(lesson) => {
                  handleSelectLesson(lesson);
                  setIsIllustrationBoardOpen(false);
                }}
                onAwardBadge={handleAwardBadge}
                onClose={() => setIsIllustrationBoardOpen(false)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Parent Settings Modal (Manages Active Purposes, Mandatory Prompts, Sample Prompts, Voice, Profile) */}
      <ParentSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={childProfile}
        onSaveProfile={handleSaveProfile}
        parentSettings={parentSettings}
        onSaveParentSettings={handleSaveParentSettings}
        memories={memories}
        badges={badges}
        onResetChat={handleResetChat}
      />
    </div>
  );
}
