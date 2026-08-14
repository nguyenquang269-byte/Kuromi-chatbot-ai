import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Shield,
  BookOpen,
  Sparkles,
  Sliders,
  Award,
  Volume2,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  MessageSquare,
  Globe,
  Heart,
  HelpCircle,
  Gamepad2,
  FileText,
  Key,
  Layers,
  Cpu,
  User,
  Zap,
} from "lucide-react";
import {
  ChildProfile,
  ParentSettings,
  ParentGoalMode,
  MemoryFact,
  StarBadge,
} from "../types";
import { DEFAULT_PARENT_SETTINGS } from "../utils/storage";
import { soundFX } from "../utils/speech";

interface ParentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ChildProfile;
  onSaveProfile: (profile: ChildProfile) => void;
  parentSettings: ParentSettings;
  onSaveParentSettings: (settings: ParentSettings) => void;
  memories: MemoryFact[];
  badges: StarBadge[];
  onResetChat: () => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  parentSettings,
  onSaveParentSettings,
  memories,
  badges,
  onResetChat,
}) => {
  const [activeTab, setActiveTab] = useState<
    "purposes" | "api_keys" | "prompt_settings" | "mandatory_prompt" | "sample_prompts" | "profile_voice" | "memories_badges"
  >("purposes");

  // Local copy of parent settings
  const [localSettings, setLocalSettings] = useState<ParentSettings>({
    ...parentSettings,
    apiKeys: Array.isArray(parentSettings.apiKeys) ? [...parentSettings.apiKeys] : [],
    historyTurnsToKeep: parentSettings.historyTurnsToKeep ?? 3,
    compactPromptMode: parentSettings.compactPromptMode ?? true,
    includeChildProfileInPrompt: parentSettings.includeChildProfileInPrompt ?? true,
  });

  // Local copy of profile
  const [localProfile, setLocalProfile] = useState<ChildProfile>({
    ...profile,
  });

  const [newApiKeyInput, setNewApiKeyInput] = useState("");
  const [newPromptInput, setNewPromptInput] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  // Sync on modal open
  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings({
        ...parentSettings,
        apiKeys: Array.isArray(parentSettings.apiKeys) ? [...parentSettings.apiKeys] : [],
        historyTurnsToKeep: parentSettings.historyTurnsToKeep ?? 3,
        compactPromptMode: parentSettings.compactPromptMode ?? true,
        includeChildProfileInPrompt: parentSettings.includeChildProfileInPrompt ?? true,
      });
      setLocalProfile({ ...profile });
    }
  }, [isOpen, parentSettings, profile]);

  if (!isOpen) return null;

  const PURPOSE_OPTIONS: {
    id: ParentGoalMode;
    icon: any;
    title: string;
    description: string;
    badge: string;
    defaultSample: string;
  }[] = [
    {
      id: "learn_vietnamese",
      icon: BookOpen,
      title: "Học Tiếng Việt",
      description: "Dạy bảng chữ cái, ghép vần, mở rộng vốn từ, diễn đạt chuẩn mực và ca dao tục ngữ.",
      badge: "🇻🇳 Tiếng Việt",
      defaultSample: "Dạy con chữ cái và ghép vần tiếng Việt!",
    },
    {
      id: "learn_english",
      icon: Globe,
      title: "Học Tiếng Anh",
      description: "Học từ vựng theo chủ đề, phát âm song ngữ chuẩn, câu giao tiếp ngắn hàng ngày.",
      badge: "🇬🇧 Tiếng Anh",
      defaultSample: "Dạy con 1 từ tiếng Anh mới và cách đọc nhé!",
    },
    {
      id: "explain_why",
      icon: HelpCircle,
      title: "Giải Đáp 'Vì Sao?'",
      description: "Giải thích các hiện tượng tự nhiên, khoa học, động vật, vũ trụ trực quan và dễ hiểu.",
      badge: "🔬 Khoa học",
      defaultSample: "Tại sao cầu vồng lại có 7 màu sắc lung linh?",
    },
    {
      id: "storytelling",
      icon: Sparkles,
      title: "Kể Chuyện Cổ Tích & Thần Tiên",
      description: "Kể truyện cổ tích Việt Nam & thế giới, truyện ngụ ngôn giàu bài học nhân văn.",
      badge: "📖 Cổ tích",
      defaultSample: "Kể cho con nghe câu chuyện Cây Khế thần tiên!",
    },
    {
      id: "confide",
      icon: Heart,
      title: "Tâm Sự & Chia Sẻ Cảm Xúc",
      description: "Lắng nghe tâm tư, an ủi khi bé buồn, dạy bé nhận biết cảm xúc và chia sẻ tích cực.",
      badge: "💖 Cảm xúc",
      defaultSample: "Kuromi ơi, hôm nay ở trường con có chuyện vui muốn kể!",
    },
    {
      id: "play_games",
      icon: Gamepad2,
      title: "Chơi Cùng Nhau & Đố Vui",
      description: "Câu đố dân gian, thử tài đố mẹo thông minh, minigame tính điểm kích thích tư duy.",
      badge: "🎮 Đố vui",
      defaultSample: "Đố con một câu đố vui thật hóc búa nào!",
    },
  ];

  const MANDATORY_PRESETS = [
    "Luôn xưng hô thân mật là Kuromi và gọi bé bằng tên.",
    "Khuyến khích bé nói trọn câu và dạ/vâng lễ phép.",
    "Giải thích ngắn gọn, từ ngữ đơn giản phù hợp lứa tuổi.",
    "Khen ngợi nhiệt tình mỗi khi bé hoàn thành câu hỏi.",
    "Luôn lồng ghép bài học đạo đức và an toàn cho bé.",
    "Tuyệt đối không sử dụng từ ngữ tiêu cực hoặc bạo lực.",
  ];

  const handleTogglePurpose = (modeId: ParentGoalMode) => {
    soundFX.playPop();
    const current = localSettings.activePurposes || [];
    let updated: ParentGoalMode[];
    if (current.includes(modeId)) {
      if (current.length === 1) return;
      updated = current.filter((id) => id !== modeId);
    } else {
      updated = [...current, modeId];
    }
    setLocalSettings({ ...localSettings, activePurposes: updated });
  };

  const handleAddApiKey = () => {
    const trimmed = newApiKeyInput.trim();
    if (!trimmed) return;
    const currentKeys = localSettings.apiKeys || [];
    if (currentKeys.length >= 5) {
      alert("Bạn chỉ có thể nạp tối đa 5 API Key luân phiên!");
      return;
    }
    if (currentKeys.includes(trimmed)) {
      alert("API Key này đã tồn tại trong danh sách!");
      return;
    }
    soundFX.playPop();
    setLocalSettings({
      ...localSettings,
      apiKeys: [...currentKeys, trimmed],
    });
    setNewApiKeyInput("");
  };

  const handleDeleteApiKey = (idx: number) => {
    soundFX.playPop();
    const currentKeys = localSettings.apiKeys || [];
    setLocalSettings({
      ...localSettings,
      apiKeys: currentKeys.filter((_, i) => i !== idx),
    });
  };

  const handleAddSamplePrompt = () => {
    if (!newPromptInput.trim()) return;
    soundFX.playPop();
    const updated = [...(localSettings.samplePrompts || []), newPromptInput.trim()];
    setLocalSettings({ ...localSettings, samplePrompts: updated });
    setNewPromptInput("");
  };

  const handleDeleteSamplePrompt = (index: number) => {
    soundFX.playPop();
    const updated = (localSettings.samplePrompts || []).filter((_, i) => i !== index);
    setLocalSettings({ ...localSettings, samplePrompts: updated });
  };

  const handleAddPresetToMandatory = (preset: string) => {
    soundFX.playPop();
    const current = localSettings.mandatoryPrompt || "";
    if (current.includes(preset)) return;
    const updated = current ? `${current}\n- ${preset}` : `- ${preset}`;
    setLocalSettings({ ...localSettings, mandatoryPrompt: updated });
  };

  const handleSaveAll = () => {
    soundFX.playSuccessFanfare();
    onSaveParentSettings(localSettings);
    onSaveProfile(localProfile);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      id="parent-settings-modal-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#140824] border-2 border-[#ff31b9] shadow-[0_0_40px_rgba(255,49,185,0.4)] text-white overflow-hidden my-auto"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ff31b9]/30 bg-[#1c0c33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff31b9] to-[#8b5cf6] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,49,185,0.5)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Trung Tâm Cài Đặt Phụ Huynh
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff31b9]/20 text-[#ff31b9] font-mono border border-[#ff31b9]/40">
                  Parent Controls
                </span>
              </h3>
              <p className="text-xs text-[#a78bfa]">
                Nạp 5 API Key luân phiên, tối ưu Prompt giảm Token & thiết lập học tập cho bé
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-[#ff31b9]/20 border border-[#ff31b9]/30 flex items-center justify-center text-[#ff31b9] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-[#ff31b9]/20 bg-[#0f051c] px-3 py-2 gap-1.5 scrollbar-hide">
          {[
            { id: "purposes", label: "Mục Đích Sử Dụng", icon: BookOpen },
            { id: "api_keys", label: "Nạp 5 API Key", icon: Key },
            { id: "prompt_settings", label: "Tối Ưu Prompt & Token", icon: Zap },
            { id: "mandatory_prompt", label: "Chỉ Đạo Bắt Buộc", icon: FileText },
            { id: "sample_prompts", label: "Gợi Ý Mẫu Cho Bé", icon: MessageSquare },
            { id: "profile_voice", label: "Hồ Sơ & Giọng Nói", icon: Sliders },
            { id: "memories_badges", label: "Kỷ Niệm & Huy Hiệu", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFX.playPop();
                  setActiveTab(tab.id as any);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-[#ff31b9] text-white shadow-[0_0_12px_rgba(255,49,185,0.4)]"
                    : "text-[#a78bfa] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar">
          {/* TAB 1: MỤC ĐÍCH SỬ DỤNG */}
          {activeTab === "purposes" && (
            <div className="space-y-4">
              <div className="bg-[#1a0b2e]/60 p-4 rounded-2xl border border-[#ff31b9]/30">
                <h4 className="text-sm font-bold text-[#ff31b9] mb-1">
                  Chọn các mục đích học tập & tương tác cho bé
                </h4>
                <p className="text-xs text-[#a78bfa]">
                  Phụ huynh có thể kích hoạt nhiều mục đích cùng lúc. Kuromi sẽ tự động tích hợp
                  các nội dung này trong câu trả lời và bảng minh hoạ!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PURPOSE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isChecked = (localSettings.activePurposes || []).includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleTogglePurpose(opt.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isChecked
                          ? "bg-[#25103d] border-[#ff31b9] shadow-[0_0_15px_rgba(255,49,185,0.25)]"
                          : "bg-black/30 border-[#ff31b9]/20 hover:border-[#ff31b9]/50 opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isChecked
                                ? "bg-[#ff31b9] text-white"
                                : "bg-black/50 text-[#a78bfa]"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {opt.title}
                            </span>
                            <span className="text-[10px] text-[#ff31b9] font-medium">
                              {opt.badge}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                            isChecked
                              ? "bg-[#ff31b9] border-[#ff31b9] text-white"
                              : "border-gray-600 bg-black/40"
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4" />}
                        </div>
                      </div>

                      <p className="text-xs text-[#d1c4e9] leading-relaxed mb-2">
                        {opt.description}
                      </p>

                      <div className="text-[11px] text-[#a78bfa] bg-black/40 px-2.5 py-1 rounded-lg border border-[#ff31b9]/20 flex items-center gap-1.5">
                        <span className="text-[#ff31b9]">💬</span>
                        <span className="truncate">Ví dụ: "{opt.defaultSample}"</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: NẠP 5 API KEY LUÂN PHIÊN (ROUND ROBIN LOAD BALANCING) */}
          {activeTab === "api_keys" && (
            <div className="space-y-4">
              <div className="bg-[#1a0b2e]/60 p-4 rounded-2xl border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <h4 className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  Cơ Chế Nạp Lên Tới 5 API Key Chạy Luân Phiên
                </h4>
                <p className="text-xs text-[#d1c4e9] leading-relaxed">
                  Hệ thống sẽ tự động quay vòng (Round-Robin) lần lượt qua các API Key cho từng tin nhắn. Khi một Key bị chạm giới hạn (Rate Limit 429 / Quota Exceeded), hệ thống sẽ lập tức đổi sang Key tiếp theo mà không làm gián đoạn bài học của bé!
                </p>
                <div className="mt-2.5 pt-2 border-t border-amber-400/20 text-[11px] text-amber-200/90 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Mẹo: Bạn có thể lấy API Key Gemini miễn phí tại <strong>aistudio.google.com/apikey</strong> và nạp vào đây để nhân đôi hạn mức trò chuyện.</span>
                </div>
              </div>

              {/* Add Key Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Thêm API Key mới (Tối đa 5 Key):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newApiKeyInput}
                    onChange={(e) => setNewApiKeyInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddApiKey()}
                    placeholder="Dán mã API Key Gemini (AIzaSy...)..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-black/50 border border-amber-400/40 focus:border-amber-400 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none font-mono"
                  />
                  <button
                    onClick={handleAddApiKey}
                    disabled={(localSettings.apiKeys || []).length >= 5}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_12px_rgba(251,191,36,0.4)] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Key
                  </button>
                </div>
              </div>

              {/* List of active keys */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-[#a78bfa]">
                  <span>Danh sách API Key đang hoạt động:</span>
                  <span className="font-bold text-amber-300">
                    {(localSettings.apiKeys || []).length}/5 Keys
                  </span>
                </div>

                {(localSettings.apiKeys || []).length === 0 ? (
                  <div className="p-4 rounded-2xl bg-black/30 border border-dashed border-[#ff31b9]/30 text-center text-xs text-[#a78bfa]">
                    Chưa có API Key phụ nào được thêm. Hệ thống sẽ sử dụng API Key mặc định của hệ thống. Bạn có thể thêm thêm key để dự phòng!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(localSettings.apiKeys || []).map((k, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-black/50 border border-amber-400/30 hover:border-amber-400/60 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-mono text-white">
                              {k.slice(0, 8)}••••••••••••{k.slice(-6)}
                            </span>
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                              Luân phiên Sẵn sàng
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteApiKey(idx)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-all"
                          title="Xóa Key này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TỐI ƯU HÓA PROMPT & GIẢM TOKEN (COMPACT PROMPT & CHILD CONTEXT) */}
          {activeTab === "prompt_settings" && (
            <div className="space-y-4">
              <div className="bg-[#1a0b2e]/60 p-4 rounded-2xl border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <h4 className="text-sm font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Cấu Hình Tối Ưu Prompt & Giảm Tiêu Hao Token
                </h4>
                <p className="text-xs text-[#d1c4e9] leading-relaxed">
                  Tích hợp thông tin bé và lịch sử hội thoại gần nhất vào 1 prompt duy nhất để phản hồi nhanh hơn, mạch lạc hơn và tiết kiệm tới 70% token đầu vào.
                </p>
              </div>

              {/* History Turn Limit */}
              <div className="bg-black/40 p-4 rounded-2xl border border-[#ff31b9]/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold text-white block">
                      Số lượt hội thoại gần nhất lưu giữ:
                    </label>
                    <span className="text-[11px] text-[#a78bfa]">
                      (Khuyến nghị 3 lượt để giảm tối đa chi phí token nhưng vẫn hiểu ngữ cảnh)
                    </span>
                  </div>
                  <span className="text-base font-black font-mono text-[#ff31b9] bg-black/60 px-3 py-1 rounded-xl border border-[#ff31b9]/40">
                    {localSettings.historyTurnsToKeep ?? 3} lượt
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={localSettings.historyTurnsToKeep ?? 3}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      historyTurnsToKeep: parseInt(e.target.value) || 3,
                    })
                  }
                  className="w-full accent-[#ff31b9]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>1 lượt (Siêu nhẹ)</span>
                  <span className="text-pink-300 font-bold">3 lượt (Chuẩn khuyên dùng)</span>
                  <span>6 lượt (Đầy đủ)</span>
                </div>
              </div>

              {/* Toggle Compact Mode */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-[#ff31b9]/30">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">
                    Gói gọn hội thoại trong 1 Prompt duy nhất (Compact Mode)
                  </span>
                  <p className="text-[11px] text-[#a78bfa]">
                    Tóm tắt ngắn gọn các tin nhắn trước và gộp chung trong 1 prompt gửi đi để giảm thiểu token đầu vào.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.compactPromptMode !== false}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      compactPromptMode: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#ff31b9] rounded cursor-pointer"
                />
              </div>

              {/* Toggle Child Profile Embedding */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-[#ff31b9]/30">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">
                    Tích hợp sẵn thông tin của bé vào Prompt
                  </span>
                  <p className="text-[11px] text-[#a78bfa]">
                    Gửi kèm tên ({localProfile.name}), tuổi ({localProfile.age}), sở thích và trình độ để Kuromi trò chuyện thân thiết và liền mạch hơn.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.includeChildProfileInPrompt !== false}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      includeChildProfileInPrompt: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#ff31b9] rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PROMPT CHỈ ĐẠO BẮT BUỘC TỪ PHỤ HUYNH */}
          {activeTab === "mandatory_prompt" && (
            <div className="space-y-4">
              <div className="bg-[#1a0b2e]/60 p-4 rounded-2xl border border-[#ff31b9]/30">
                <h4 className="text-sm font-bold text-[#ff31b9] mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#ff31b9]" />
                  Chỉ đạo bắt buộc từ phụ huynh gửi AI (Mandatory Instructions)
                </h4>
                <p className="text-xs text-[#a78bfa]">
                  Những nguyên tắc này sẽ được gửi kèm trong mọi lượt trò chuyện để đảm bảo Kuromi luôn
                  giao tiếp đúng chuẩn mực gia đình mong muốn.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wider">
                  Nội dung chỉ đạo bắt buộc:
                </label>
                <textarea
                  value={localSettings.mandatoryPrompt}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, mandatoryPrompt: e.target.value })
                  }
                  rows={5}
                  placeholder="Nhập các nguyên tắc bắt buộc cho Kuromi khi dạy bé..."
                  className="w-full p-3.5 rounded-2xl bg-black/50 border-2 border-[#ff31b9]/40 focus:border-[#ff31b9] text-sm text-white placeholder-gray-500 focus:outline-none transition-all resize-none shadow-inner"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-xs font-bold text-[#ff31b9] block mb-2">
                  + Thêm nhanh nguyên tắc mẫu:
                </span>
                <div className="flex flex-wrap gap-2">
                  {MANDATORY_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddPresetToMandatory(preset)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-black/40 hover:bg-[#ff31b9]/20 border border-[#ff31b9]/30 text-[#d1c4e9] hover:text-white transition-all text-left flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-[#ff31b9]" />
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROMPT MẪU CHO BÉ */}
          {activeTab === "sample_prompts" && (
            <div className="space-y-4">
              <div className="bg-[#1a0b2e]/60 p-4 rounded-2xl border border-[#ff31b9]/30">
                <h4 className="text-sm font-bold text-[#ff31b9] mb-1">
                  Quản lý câu gợi ý mẫu xuất hiện trên màn hình của bé
                </h4>
                <p className="text-xs text-[#a78bfa]">
                  Bé có thể bấm vào những câu gợi ý này để hỏi Kuromi nhanh mà không cần gõ phím.
                </p>
              </div>

              {/* Add new sample prompt */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPromptInput}
                  onChange={(e) => setNewPromptInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSamplePrompt()}
                  placeholder="Nhập câu gợi ý mới cho bé (vd: ✍️ Dạy bé viết chữ O chuẩn ô ly)..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-black/50 border border-[#ff31b9]/40 focus:border-[#ff31b9] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  onClick={handleAddSamplePrompt}
                  className="px-4 py-2.5 rounded-2xl bg-[#ff31b9] hover:bg-[#ff31b9]/90 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,49,185,0.4)]"
                >
                  <Plus className="w-4 h-4" />
                  Thêm
                </button>
              </div>

              {/* Quick Preset Chips for Parents */}
              <div>
                <span className="text-[11px] font-bold text-[#ff77cf] block mb-1.5">
                  Thêm nhanh các mẫu gợi ý theo tính năng mới:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-1 bg-black/20 rounded-xl border border-[#ff31b9]/20">
                  {[
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
                  ].map((presetText, pIdx) => {
                    const isAlreadyAdded = (localSettings.samplePrompts || []).includes(presetText);
                    return (
                      <button
                        key={pIdx}
                        disabled={isAlreadyAdded}
                        onClick={() => {
                          soundFX.playPop();
                          setLocalSettings({
                            ...localSettings,
                            samplePrompts: [...(localSettings.samplePrompts || []), presetText],
                          });
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                          isAlreadyAdded
                            ? "bg-purple-950/40 text-purple-400/50 border border-purple-900/30 cursor-not-allowed"
                            : "bg-[#280d46] hover:bg-[#ff31b9]/30 text-pink-200 hover:text-white border border-[#ff31b9]/40 active:scale-95"
                        }`}
                      >
                        <span>{presetText}</span>
                        {!isAlreadyAdded && <Plus className="w-3 h-3 text-[#ff77cf]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* List of sample prompts */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {(localSettings.samplePrompts || []).map((prompt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-[#ff31b9]/30 hover:border-[#ff31b9]/60 transition-all"
                  >
                    <div className="flex items-center gap-2.5 flex-1 mr-2">
                      <span className="w-6 h-6 rounded-full bg-[#ff31b9]/20 text-[#ff31b9] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-white">{prompt}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSamplePrompt(idx)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    soundFX.playPop();
                    setLocalSettings({
                      ...localSettings,
                      samplePrompts: DEFAULT_PARENT_SETTINGS.samplePrompts,
                    });
                  }}
                  className="text-xs text-[#a78bfa] hover:text-[#ff31b9] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Khôi phục gợi ý mặc định
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: HỒ SƠ BÉ & GIỌNG NÓI */}
          {activeTab === "profile_voice" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#a78bfa] mb-1.5 uppercase">
                    Tên của bé:
                  </label>
                  <input
                    type="text"
                    value={localProfile.name}
                    onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#ff31b9]/40 focus:border-[#ff31b9] text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a78bfa] mb-1.5 uppercase">
                    Tuổi của bé:
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    value={localProfile.age}
                    onChange={(e) =>
                      setLocalProfile({ ...localProfile, age: parseInt(e.target.value) || 5 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#ff31b9]/40 focus:border-[#ff31b9] text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a78bfa] mb-1.5 uppercase">
                    Trình độ học tập:
                  </label>
                  <select
                    value={localProfile.level}
                    onChange={(e) =>
                      setLocalProfile({ ...localProfile, level: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#ff31b9]/40 focus:border-[#ff31b9] text-sm text-white focus:outline-none"
                  >
                    <option value="Mầm non (3-5 tuổi)">Mầm non (3-5 tuổi)</option>
                    <option value="Tiểu học lớp 1-2">Tiểu học lớp 1-2</option>
                    <option value="Tiểu học lớp 3-5">Tiểu học lớp 3-5</option>
                    <option value="Khám phá tự do">Khám phá tự do</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a78bfa] mb-1.5 uppercase">
                    Sở thích của bé:
                  </label>
                  <input
                    type="text"
                    value={localProfile.interests.join(", ")}
                    onChange={(e) =>
                      setLocalProfile({
                        ...localProfile,
                        interests: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    placeholder="Vẽ tranh, vũ trụ, nuôi mèo..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#ff31b9]/40 focus:border-[#ff31b9] text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Voice Speed & Pitch */}
              <div className="bg-[#1a0b2e]/60 p-4 rounded-2xl border border-[#ff31b9]/30 space-y-4 pt-4">
                <h4 className="text-xs font-bold text-[#ff31b9] uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#ff31b9]" />
                  Điều Chỉnh Giọng Nói Kuromi (Tự Động Phân Biệt Anh / Việt)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-[#a78bfa] mb-1">
                      <span>Tốc độ đọc (Rate):</span>
                      <span className="font-mono text-[#ff31b9]">{localProfile.speechRate}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={localProfile.speechRate}
                      onChange={(e) =>
                        setLocalProfile({
                          ...localProfile,
                          speechRate: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-[#ff31b9]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#a78bfa] mb-1">
                      <span>Cao độ giọng Kuromi (Pitch):</span>
                      <span className="font-mono text-[#ff31b9]">{localProfile.speechPitch}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.8"
                      step="0.05"
                      value={localProfile.speechPitch}
                      onChange={(e) =>
                        setLocalProfile({
                          ...localProfile,
                          speechPitch: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-[#ff31b9]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#ff31b9]/20">
                  <span className="text-xs text-white">Tự động đọc to khi Kuromi trả lời</span>
                  <input
                    type="checkbox"
                    checked={localProfile.autoPlayAudio}
                    onChange={(e) =>
                      setLocalProfile({
                        ...localProfile,
                        autoPlayAudio: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#ff31b9] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: KỶ NIỆM & HUY HIỆU */}
          {activeTab === "memories_badges" && (
            <div className="space-y-4">
              <div className="bg-[#1a0b2e]/60 p-4 rounded-2xl border border-[#ff31b9]/30">
                <h4 className="text-sm font-bold text-[#ff31b9] mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#ff31b9]" />
                  Tiến trình học tập & Kỷ niệm của bé
                </h4>
                <p className="text-xs text-[#a78bfa]">
                  Theo dõi những kỷ niệm Kuromi đã ghi nhớ và các huy hiệu bé đã đạt được.
                </p>
              </div>

              {/* Badges Preview */}
              <div>
                <h5 className="text-xs font-bold text-white mb-2">Huy Hiệu Ngôi Sao Đã Đạt:</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        b.earnedAt
                          ? "bg-black/50 border-[#ff31b9] text-white shadow-[0_0_10px_rgba(255,49,185,0.2)]"
                          : "bg-black/20 border-white/10 opacity-40 text-gray-400"
                      }`}
                    >
                      <span className="text-2xl">{b.icon}</span>
                      <div>
                        <div className="text-xs font-bold leading-tight">{b.title}</div>
                        {b.earnedAt && (
                          <span className="text-[9px] text-emerald-400 font-bold">✓ Đã đạt</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memories List */}
              <div className="border-t border-[#ff31b9]/20 pt-3">
                <h5 className="text-xs font-bold text-white mb-2">Sổ Ghi Nhớ Về Bé ({memories.length}):</h5>
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {memories.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded-xl bg-black/40 border border-[#ff31b9]/20 text-xs text-[#d1c4e9] flex items-start gap-2"
                    >
                      <span>💌</span>
                      <div className="flex-1">
                        <p>{m.fact}</p>
                        <span className="text-[10px] text-[#a78bfa]">{m.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset History */}
              <div className="pt-3 border-t border-[#ff31b9]/20 flex justify-between items-center">
                <span className="text-xs text-rose-300">Xóa lịch sử cuộc trò chuyện hiện tại:</span>
                <button
                  onClick={() => {
                    if (window.confirm("Bạn có chắc muốn làm mới lại cuộc trò chuyện từ đầu?")) {
                      onResetChat();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all"
                >
                  Xóa Lịch Sử Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#ff31b9]/30 bg-[#1c0c33] flex items-center justify-between">
          <div className="text-xs text-[#a78bfa]">
            {savedToast && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Đã lưu cài đặt thành công!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-black/40 hover:bg-white/10 text-xs font-bold text-[#d1c4e9] transition-all"
            >
              Đóng
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-[#ff31b9] hover:bg-[#ff31b9]/90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,49,185,0.4)] flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              Lưu & Áp Dụng
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
