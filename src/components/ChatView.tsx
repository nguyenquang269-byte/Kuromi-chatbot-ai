import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Message, ChildProfile, KuromiMood } from "../types";
import { soundFX, speakKuromiText, stopSpeaking } from "../utils/speech";
import { Kuromi3D } from "./KuromiAvatar";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RotateCcw,
  Heart,
  VolumeX,
} from "lucide-react";

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  isOnline: boolean;
  childProfile: ChildProfile;
  activeMood: KuromiMood;
  isSpeaking: boolean;
  samplePrompts?: string[];
  onSendMessage: (text: string) => void;
  onQuickPrompt: (text: string) => void;
  onToggleIllustrationBoard?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  isOnline,
  childProfile,
  activeMood,
  isSpeaking,
  samplePrompts = [],
  onSendMessage,
  onQuickPrompt,
  onToggleIllustrationBoard,
}) => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Find the last Kuromi message for live speech bubble
  const lastKuromiMessage = [...messages].reverse().find((m) => m.sender === "kuromi");

  // Handle Speech-to-Text (Microphone)
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (
      typeof window === "undefined" ||
      (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window))
    ) {
      setRecordingError("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      setTimeout(() => setRecordingError(null), 3500);
      return;
    }

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        soundFX.playPop();
        setIsRecording(true);
        setRecordingError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          // If child speaks, automatically send message for a magical voice-to-voice feel
          onSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === "not-allowed") {
          setRecordingError("Vui lòng cấp quyền Micro trong trình duyệt để nói chuyện cùng Kuromi.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsRecording(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;
    soundFX.playPop();
    onSendMessage(text);
    setInputText("");
  };

  const displayPrompts = samplePrompts.length > 0 ? samplePrompts : [
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
  ];

  return (
    <div
      className="flex flex-col h-full bg-[#130722]/80 backdrop-blur-md rounded-3xl border-2 border-[#ff31b9]/40 p-3 sm:p-4 relative overflow-hidden shadow-[0_0_30px_rgba(255,49,185,0.2)]"
      id="chat-view-container"
    >
      {/* Background Magic Sparkles Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#ff31b9 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ================= 1. INTEGRATED KUROMI 3D LIVE STAGE ================= */}
      <div
        className="relative z-10 shrink-0 mb-3 bg-gradient-to-b from-[#240c42]/90 to-[#17072b]/95 p-3 sm:p-4 rounded-2xl border border-[#ff31b9]/50 shadow-[0_4px_20px_rgba(255,49,185,0.25)] flex flex-col items-center justify-center text-center"
        id="integrated-kuromi-live-stage"
      >
        {/* Top Floating Action Pill for Re-speaking */}
        <div className="w-full flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-[#ff31b9]/30 text-xs font-bold text-[#ff77cf]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Phòng Trò Chuyện Kuromi 3D</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Re-speak toggle */}
            <button
              onClick={() => {
                soundFX.playPop();
                if (isSpeaking) {
                  stopSpeaking();
                } else if (lastKuromiMessage) {
                  speakKuromiText(lastKuromiMessage.text, {
                    rate: childProfile.speechRate,
                    pitch: childProfile.speechPitch,
                  });
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
                isSpeaking
                  ? "bg-[#ff31b9] text-white border-pink-300 shadow-[0_0_12px_rgba(255,49,185,0.6)] animate-pulse"
                  : "bg-black/40 text-pink-300 hover:bg-[#ff31b9]/20 border-[#ff31b9]/40"
              }`}
              title="Phát hoặc dừng giọng nói Kuromi"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Dừng Đọc</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe Kuromi Đọc</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3D Kuromi Character Centerpiece */}
        <div className="py-1">
          <Kuromi3D
            mood={activeMood}
            isSpeaking={isSpeaking}
            isListening={isRecording}
            size="stage"
          />
        </div>
      </div>

      {/* ================= 2. MESSAGES THREAD ================= */}
      <div
        className="flex-1 overflow-y-auto space-y-3.5 pr-1 relative z-10 custom-scrollbar scrollbar-hide min-h-[140px]"
        id="messages-thread"
      >
        {!Array.isArray(messages) || messages.length === 0 ? (
          <div className="py-4 text-center flex flex-col items-center justify-center space-y-3">
            <div>
              <h4 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff77cf] via-pink-300 to-[#c084fc]">
                Xin chào {childProfile.name || "bạn nhỏ"}! 🎀
              </h4>
              <p className="text-xs text-[#c4b5fd] max-w-sm mt-0.5">
                Bấm vào các chủ đề gợi ý bên dưới hoặc giữ Micro để nói chuyện cùng Kuromi nhé!
              </p>
            </div>

            {/* Quick Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg text-left">
              {[
                {
                  icon: "✍️",
                  title: "Luyện Chữ HP001",
                  desc: "Tập viết chữ A chuẩn 4 ô ly tiểu học",
                  prompt: "✍️ Dạy bé viết chữ A chuẩn ô ly HP001",
                },
                {
                  icon: "🇬🇧",
                  title: "Học Tiếng Anh",
                  desc: "Học từ mới kèm phát âm chuẩn",
                  prompt: "🇬🇧 Dạy bé từ vựng tiếng Anh (kèm phát âm & ví dụ)",
                },
                {
                  icon: "🧮",
                  title: "Toán Vui Trực Quan",
                  desc: "Đố toán cộng trừ có hình ảnh",
                  prompt: "🧮 Đố bé 1 bài toán vui cộng trừ hình ảnh",
                },
                {
                  icon: "🔬",
                  title: "Vạn Câu Hỏi Vì Sao",
                  desc: "Giải thích cầu vồng 7 màu & tự nhiên",
                  prompt: "🔬 Kuromi ơi, vì sao cầu vồng lại có 7 màu sắc?",
                },
                {
                  icon: "📖",
                  title: "Cổ Tích Ý Nghĩa",
                  desc: "Kể chuyện Sự Tích Cây Khế hấp dẫn",
                  prompt: "📖 Kể chuyện cổ tích Sự Tích Cây Khế",
                },
                {
                  icon: "😂",
                  title: "Đố Vui & Cười Nhí Nhảnh",
                  desc: "Truyện cười & câu đố dân gian vui nhộn",
                  prompt: "😂 Kể một câu chuyện cười nhí nhảnh cho bé",
                },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    soundFX.playPop();
                    onQuickPrompt(item.prompt);
                  }}
                  className="p-2.5 rounded-2xl bg-[#1e0a38]/80 hover:bg-[#ff31b9]/20 border border-[#ff31b9]/30 hover:border-[#ff31b9] transition-all flex items-start gap-2 text-left group shadow-[0_2px_10px_rgba(0,0,0,0.2)] active:scale-95"
                >
                  <span className="text-xl shrink-0 p-1 rounded-xl bg-black/40 border border-[#ff31b9]/30 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-pink-200 group-hover:text-white flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-[#ff77cf] opacity-0 group-hover:opacity-100 transition-opacity">
                        Hỏi ngay →
                      </span>
                    </div>
                    <p className="text-[11px] text-[#c4b5fd]/80 truncate">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isKuromi = msg.sender === "kuromi";
            const formattedTime = new Date(msg.timestamp || Date.now()).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            );

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${isKuromi ? "justify-start" : "justify-end"}`}
              >
                {/* Kuromi small mascot indicator on bubble */}
                {isKuromi && (
                  <div className="w-8 h-8 rounded-full bg-black/60 border border-[#ff31b9] flex items-center justify-center text-sm shrink-0 shadow-[0_0_8px_rgba(255,49,185,0.4)]">
                    😈
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] ${
                    isKuromi
                      ? "bg-[#210c3d] border-2 border-[#ff31b9]/60 p-3.5 rounded-2xl rounded-tl-sm shadow-[0_4px_15px_rgba(0,0,0,0.3)] text-white"
                      : "bg-gradient-to-r from-[#ff31b9] to-[#d9269e] text-white p-3.5 rounded-2xl rounded-tr-sm shadow-[0_4px_15px_rgba(255,49,185,0.4)]"
                  }`}
                >
                  {/* Bubble header */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-xs font-black tracking-wide ${
                        isKuromi ? "text-[#ff77cf]" : "text-white"
                      }`}
                    >
                      {isKuromi ? "Kuromi Sensei" : childProfile.name || "Bé Ngoan"}
                    </span>
                    {isKuromi && (
                      <button
                        onClick={() => {
                          soundFX.playPop();
                          speakKuromiText(msg.text, {
                            rate: childProfile.speechRate,
                            pitch: childProfile.speechPitch,
                          });
                        }}
                        className="p-1 rounded-full text-pink-300 hover:text-white hover:bg-[#ff31b9]/30 transition-colors"
                        title="Nghe Kuromi đọc lại câu này"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Bubble text */}
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.text}
                  </p>

                  {/* Illustration quick notification link */}
                  {msg.illustration && (
                    <button
                      onClick={() => {
                        if (onToggleIllustrationBoard) {
                          onToggleIllustrationBoard();
                        }
                      }}
                      className="mt-2.5 pt-2 border-t border-[#ff31b9]/30 flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-bold w-full text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Xem thẻ minh họa: {msg.illustration.title} ➔</span>
                    </button>
                  )}

                  {/* Bubble timestamp */}
                  <div
                    className={`mt-1 text-[10px] text-right ${
                      isKuromi ? "text-purple-300" : "text-pink-100"
                    }`}
                  >
                    <span>{formattedTime}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-pink-200 bg-[#210c3d] border-2 border-[#ff31b9]/60 p-3 rounded-2xl w-fit shadow-lg"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff31b9] animate-bounce" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff31b9] animate-bounce [animation-delay:0.2s]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff31b9] animate-bounce [animation-delay:0.4s]" />
            <span className="font-bold">Kuromi đang suy nghĩ và trả lời bé... 😈✨</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= 3. QUICK PROMPT SUGGESTION CHIPS ================= */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar relative z-10 shrink-0">
        <span className="text-[11px] text-[#ff77cf] font-black whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Gợi ý:
        </span>
        {displayPrompts.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundFX.playPop();
              onQuickPrompt(promptText);
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#200b3b] hover:bg-[#ff31b9]/30 hover:border-[#ff31b9] border border-[#ff31b9]/50 text-xs font-bold text-pink-200 hover:text-white whitespace-nowrap transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(255,49,185,0.2)] active:scale-95 shrink-0"
          >
            <span>{promptText}</span>
          </button>
        ))}
      </div>

      {/* Error alert if mic permission failed */}
      {recordingError && (
        <div className="mb-2 px-3 py-2 bg-rose-950/90 text-rose-200 text-xs border border-rose-600 rounded-xl flex items-center justify-between relative z-10 shadow-lg">
          <span>{recordingError}</span>
          <button onClick={() => setRecordingError(null)} className="text-xs font-bold p-1">
            ✕
          </button>
        </div>
      )}

      {/* ================= 4. PROMINENT BIG MICROPHONE & INPUT CONTROLS ================= */}
      <div className="mt-auto relative z-10 shrink-0 pt-1">
        {/* If recording: Glowing animated active status wave */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-amber-500 text-white flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse"
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
              <span className="text-xs sm:text-sm font-black">
                Kuromi đang lắng nghe bé nói... Hãy nói thật to rõ nhé!
              </span>
            </div>
            {/* Equalizer Sound Waves */}
            <div className="flex items-center gap-1">
              <span className="w-1 h-4 bg-white rounded-full animate-bounce" />
              <span className="w-1 h-6 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-5 bg-white rounded-full animate-bounce [animation-delay:0.45s]" />
            </div>
          </motion.div>
        )}

        <form
          onSubmit={handleSend}
          className="flex items-center gap-2.5 sm:gap-3 bg-[#1e0a35] p-2 sm:p-2.5 rounded-2xl border-2 border-[#ff31b9]/50 shadow-[0_0_20px_rgba(255,49,185,0.25)]"
        >
          {/* ================= BIG COLOR-CHANGING FLASHING MICROPHONE BUTTON ================= */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`relative rounded-2xl flex items-center justify-center transition-all shrink-0 select-none ${
              isRecording
                ? "w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 text-white shadow-[0_0_30px_rgba(244,63,94,0.9)] scale-110 border-2 border-white ring-4 ring-rose-500/50"
                : "w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-[#ff31b9] to-[#8b5cf6] text-white hover:brightness-110 shadow-[0_0_15px_rgba(255,49,185,0.6)] border-2 border-pink-300 hover:scale-105 active:scale-95"
            }`}
            title={isRecording ? "Dừng nói và gửi" : "Bấm vào đây để nói chuyện bằng giọng nói!"}
            id="big-voice-microphone-btn"
          >
            {/* Concentric pulsing radar waves when recording */}
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-2xl bg-rose-500 animate-ping opacity-75 pointer-events-none" />
                <span className="absolute -inset-1.5 rounded-2xl border-2 border-rose-400 animate-pulse pointer-events-none" />
              </>
            )}

            {isRecording ? (
              <MicOff className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse text-white" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow" />
                <span className="text-[9px] font-black tracking-tight text-pink-100 uppercase">
                  Nói
                </span>
              </div>
            )}
          </button>

          {/* Text Input Field */}
          <input
            id="chat-user-input-field"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? "Đang ghi nhận giọng nói của bé..."
                : "Hoặc gõ chữ vào đây để hỏi Kuromi..."
            }
            className="flex-1 bg-black/40 border border-[#ff31b9]/30 rounded-xl px-3 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-pink-300/40 font-medium outline-none focus:border-[#ff31b9] transition-all"
          />

          {/* Send Message Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white transition-all shrink-0 ${
              inputText.trim() && !isLoading
                ? "bg-[#ff31b9] shadow-[0_0_15px_rgba(255,49,185,0.7)] hover:brightness-110 cursor-pointer active:scale-95 border border-pink-300"
                : "bg-white/10 text-white/30 cursor-not-allowed border border-white/5"
            }`}
            title="Gửi tin nhắn"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
