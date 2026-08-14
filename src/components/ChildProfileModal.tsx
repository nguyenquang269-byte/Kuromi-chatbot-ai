import React, { useState } from "react";
import { motion } from "motion/react";
import { ChildProfile, Message, MemoryFact, StarBadge } from "../types";
import { soundFX, speakKuromiText } from "../utils/speech";
import {
  X,
  User,
  Sparkles,
  Heart,
  Volume2,
  CloudUpload,
  Download,
  RotateCcw,
  Check,
  Award,
} from "lucide-react";

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ChildProfile;
  onSaveProfile: (profile: ChildProfile) => void;
  onSyncCloud: () => Promise<void>;
  isSyncing: boolean;
  syncStatusMessage: string | null;
  memoriesCount: number;
  badgesCount: number;
}

export const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onSyncCloud,
  isSyncing,
  syncStatusMessage,
  memoriesCount,
  badgesCount,
}) => {
  const [formData, setFormData] = useState<ChildProfile>({ ...profile });
  const [activeTab, setActiveTab] = useState<"profile" | "voice" | "sync">("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInterestToggle = (interest: string) => {
    soundFX.playPop();
    const current = formData.interests || [];
    if (current.includes(interest)) {
      setFormData({ ...formData, interests: current.filter((i) => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...current, interest] });
    }
  };

  const handleSave = () => {
    soundFX.playSuccessFanfare();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const testVoice = () => {
    soundFX.playPop();
    speakKuromiText(
      `Chào ${formData.name || "bạn nhỏ"}! Kuromi-sama đây! Giọng này đã đủ ngọt ngào và cá tính chưa nào?`,
      {
        rate: formData.speechRate,
        pitch: formData.speechPitch,
      }
    );
  };

  const availableInterests = [
    "Khám phá vũ trụ 🚀",
    "Nuôi mèo & thú cưng 🐾",
    "Vẽ tranh & tô màu 🎨",
    "Cổ tích & thần tiên 📖",
    "Hát & nghe nhạc 🎵",
    "Khoa học tự nhiên 🔬",
    "Ăn bánh ngọt & kem 🍦",
    "Chơi đố vui 👑",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-[#1a0b2e] border-2 border-[#ff31b9] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-3.5 bg-[#ff31b9] text-white flex items-center justify-between font-black uppercase tracking-tighter">
          <div className="flex items-center gap-2">
            <span className="text-xl">😈</span>
            <div>
              <h3 className="text-sm font-black tracking-wide">
                HỒ SƠ BÉ & CÀI ĐẶT KUROMI
              </h3>
              <p className="text-[10px] opacity-90 normal-case font-normal">
                Tùy chỉnh thông tin để Kuromi thấu hiểu và xưng hô thân mật
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-[#ff31b9]/30 bg-black/40 p-1.5 gap-1">
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("profile");
            }}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-[#ff31b9] text-white shadow-[0_0_10px_rgba(255,49,185,0.4)]"
                : "text-[#a78bfa] hover:text-white"
            }`}
          >
            Thông Tin Bé
          </button>
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("voice");
            }}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "voice"
                ? "bg-[#ff31b9] text-white shadow-[0_0_10px_rgba(255,49,185,0.4)]"
                : "text-[#a78bfa] hover:text-white"
            }`}
          >
            Giọng Nói Kuromi
          </button>
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("sync");
            }}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "sync"
                ? "bg-[#ff31b9] text-white shadow-[0_0_10px_rgba(255,49,185,0.4)]"
                : "text-[#a78bfa] hover:text-white"
            }`}
          >
            Đám Mây & Sao Lưu
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar scrollbar-hide text-xs">
          {activeTab === "profile" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#a78bfa] font-semibold mb-1">
                    Tên của bé:
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="vd: Bé Bắp, Minh Anh..."
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[#ff31b9]/40 text-white focus:outline-none focus:border-[#ff31b9]"
                  />
                </div>
                <div>
                  <label className="block text-[#a78bfa] font-semibold mb-1">
                    Tuổi của bé:
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="12"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[#ff31b9]/40 text-white focus:outline-none focus:border-[#ff31b9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a78bfa] font-semibold mb-1">
                  Trình độ / Lứa tuổi học tập:
                </label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[#ff31b9]/40 text-white focus:outline-none focus:border-[#ff31b9]"
                >
                  <option value="Mầm non (3-5 tuổi)">Mầm non (3-5 tuổi) - Làm quen chữ cái & đồng dao</option>
                  <option value="Tiểu học lớp 1-2">Tiểu học lớp 1-2 - Đọc viết tiếng Việt & từ vựng</option>
                  <option value="Tiểu học lớp 3-5">Tiểu học lớp 3-5 - Kể chuyện, ghép câu & khoa học</option>
                  <option value="Khám phá tự do">Khám phá tự do song ngữ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[#a78bfa] font-semibold mb-1">
                    Con vật bé thích:
                  </label>
                  <input
                    type="text"
                    value={formData.favoriteAnimal}
                    onChange={(e) =>
                      setFormData({ ...formData, favoriteAnimal: e.target.value })
                    }
                    placeholder="vd: Mèo mun, Thỏ trắng..."
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[#ff31b9]/40 text-white focus:outline-none focus:border-[#ff31b9]"
                  />
                </div>
                <div>
                  <label className="block text-[#a78bfa] font-semibold mb-1">
                    Ước mơ tương lai:
                  </label>
                  <input
                    type="text"
                    value={formData.dreamJob}
                    onChange={(e) =>
                      setFormData({ ...formData, dreamJob: e.target.value })
                    }
                    placeholder="vd: Họa sĩ, Bác sĩ, Nhà thám hiểm..."
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-[#ff31b9]/40 text-white focus:outline-none focus:border-[#ff31b9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a78bfa] font-semibold mb-1.5">
                  Sở thích của bé (Chọn để Kuromi ghi nhớ):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableInterests.map((interest) => {
                    const isSelected = formData.interests?.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-[#ff31b9] text-white border-[#ff31b9] shadow-sm"
                            : "bg-black/40 text-[#a78bfa] border-[#ff31b9]/30 hover:bg-black/60 hover:text-white"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "voice" && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#a78bfa] font-semibold">
                    Độ cao giọng (Pitch Anime):
                  </span>
                  <span className="text-[#ff31b9] font-mono font-bold">
                    {formData.speechPitch.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.8"
                  step="0.05"
                  value={formData.speechPitch}
                  onChange={(e) =>
                    setFormData({ ...formData, speechPitch: Number(e.target.value) })
                  }
                  className="w-full accent-[#ff31b9] cursor-pointer"
                />
                <p className="text-[10px] text-[#a78bfa]/70 mt-0.5">
                  Tăng lên 1.3 - 1.5 để có giọng anime Kuromi nhí nhảnh, dễ thương.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#a78bfa] font-semibold">
                    Tốc độ đọc (Rate):
                  </span>
                  <span className="text-[#ff31b9] font-mono font-bold">
                    {formData.speechRate.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={formData.speechRate}
                  onChange={(e) =>
                    setFormData({ ...formData, speechRate: Number(e.target.value) })
                  }
                  className="w-full accent-[#ff31b9] cursor-pointer"
                />
                <p className="text-[10px] text-[#a78bfa]/70 mt-0.5">
                  Tốc độ vừa phải giúp bé nghe rõ từng vần điệu tiếng Việt.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-[#ff31b9]/30">
                <span className="text-white font-medium">
                  Tự động đọc lời thoại của Kuromi:
                </span>
                <input
                  type="checkbox"
                  checked={formData.autoPlayAudio}
                  onChange={(e) =>
                    setFormData({ ...formData, autoPlayAudio: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#ff31b9] cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={testVoice}
                className="w-full py-2.5 rounded-xl bg-black/60 hover:bg-[#ff31b9] text-white font-bold flex items-center justify-center gap-2 border border-[#ff31b9]/50 transition-colors shadow"
              >
                <Volume2 className="w-4 h-4" />
                <span>Thử Giọng Nói Của Kuromi 🎤</span>
              </button>
            </div>
          )}

          {activeTab === "sync" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-black/40 border border-[#ff31b9]/30">
                <h4 className="font-bold text-[#ff31b9] mb-1 flex items-center gap-1.5">
                  <CloudUpload className="w-4 h-4 text-[#ff31b9]" />
                  Đồng Bộ Hóa Đám Mây An Toàn
                </h4>
                <p className="text-[#a78bfa] leading-relaxed text-[11px]">
                  Hệ thống hỗ trợ lưu trữ hoàn toàn ngoại tuyến trên máy của bạn và đồng bộ đám mây tức thì khi có kết nối mạng để không bao giờ bị mất bài học hay kỷ niệm.
                </p>

                <div className="grid grid-cols-2 gap-2 my-3 text-center">
                  <div className="p-2 rounded-xl bg-black/60 border border-[#ff31b9]/30">
                    <span className="text-lg font-bold text-[#ff31b9]">{memoriesCount}</span>
                    <span className="block text-[10px] text-[#a78bfa]">Kỷ niệm đã nhớ</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/60 border border-[#ff31b9]/30">
                    <span className="text-lg font-bold text-amber-400">{badgesCount}</span>
                    <span className="block text-[10px] text-[#a78bfa]">Huy hiệu đạt được</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSyncCloud}
                  disabled={isSyncing}
                  className="w-full py-2 rounded-xl bg-[#ff31b9] hover:brightness-110 text-white font-bold transition-all shadow-[0_0_12px_rgba(255,49,185,0.4)] flex items-center justify-center gap-2"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{isSyncing ? "Đang đồng bộ..." : "Đồng Bộ Ngay Bây Giờ"}</span>
                </button>

                {syncStatusMessage && (
                  <p className="mt-2 text-center text-emerald-400 font-medium text-[11px]">
                    ✓ {syncStatusMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-black/40 border-t border-[#ff31b9]/30 flex items-center justify-between">
          <button
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-[#a78bfa] hover:text-white text-xs font-semibold border border-[#ff31b9]/30 transition-colors"
          >
            Đóng
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#ff31b9] hover:brightness-110 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,49,185,0.4)] hover:scale-105 transition-transform flex items-center gap-1.5"
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{saveSuccess ? "Đã Lưu!" : "Lưu Thay Đổi"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
