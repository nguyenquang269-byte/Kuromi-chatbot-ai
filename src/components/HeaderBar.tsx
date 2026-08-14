import React from "react";
import { soundFX } from "../utils/speech";
import {
  Shield,
  Star,
  Sparkles,
  RotateCcw,
  LayoutGrid,
} from "lucide-react";
import { ChildProfile, StarBadge } from "../types";

interface HeaderBarProps {
  isOnline: boolean;
  onToggleOnlineMode: () => void;
  childProfile: ChildProfile;
  badges: StarBadge[];
  onOpenSettings: () => void;
  onResetChat: () => void;
  isIllustrationBoardOpen: boolean;
  onToggleIllustrationBoard: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  childProfile,
  badges,
  onOpenSettings,
  onResetChat,
  isIllustrationBoardOpen,
  onToggleIllustrationBoard,
}) => {
  const safeBadges = Array.isArray(badges) ? badges : [];
  const earnedBadgesCount = safeBadges.filter((b) => b && b.earnedAt).length;

  return (
    <header
      className="h-14 bg-[#140824]/90 backdrop-blur-md border-b-2 border-[#ff31b9] flex items-center justify-between px-3 sm:px-5 shadow-[0_0_20px_rgba(255,49,185,0.25)] z-20 shrink-0"
      id="app-header-bar"
    >
      {/* Brand Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 bg-black border-2 border-[#ff31b9] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,49,185,0.5)] shrink-0">
          <span className="text-lg select-none">😈</span>
        </div>

        <div>
          <h1 className="text-sm sm:text-base font-black tracking-wide text-[#ff31b9] flex items-center gap-1.5">
            KUROMI 3D
            <span className="hidden xs:inline text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-[#ff31b9]/20 text-pink-300 border border-[#ff31b9]/40 font-mono">
              AI Bạn Nhỏ
            </span>
          </h1>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Toggle Magic Illustration Board Button */}
        <button
          onClick={() => {
            soundFX.playPop();
            onToggleIllustrationBoard();
          }}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
            isIllustrationBoardOpen
              ? "bg-[#ff31b9] text-white border-pink-300 shadow-[0_0_12px_rgba(255,49,185,0.5)]"
              : "bg-black/50 text-[#ff77cf] hover:bg-[#ff31b9]/20 border-[#ff31b9]/40"
          }`}
          title={isIllustrationBoardOpen ? "Thu gọn Bảng Minh Họa" : "Mở Bảng Minh Họa, Bài Học & Góc Vẽ"}
          id="toggle-magic-board-btn"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">
            {isIllustrationBoardOpen ? "Thu Gọn Bảng" : "Bảng Minh Họa"}
          </span>
          <span className="sm:hidden">Bảng</span>
        </button>

        {/* Star Counter */}
        <div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/50 border border-amber-400/40 text-xs font-bold text-amber-300 shadow-sm"
          title="Số huy hiệu ngôi sao bé đã đạt"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{earnedBadgesCount}</span>
        </div>

        {/* Reset Chat */}
        <button
          onClick={() => {
            soundFX.playPop();
            onResetChat();
          }}
          className="p-2 rounded-xl bg-black/40 hover:bg-[#ff31b9]/20 text-[#a78bfa] hover:text-[#ff31b9] border border-[#ff31b9]/30 transition-all text-xs flex items-center gap-1"
          title="Bắt đầu buổi học mới"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Làm Mới</span>
        </button>

        {/* Main Parent Settings Button */}
        <button
          onClick={() => {
            soundFX.playPop();
            onOpenSettings();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff31b9] hover:bg-[#ff31b9]/90 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,49,185,0.5)] border border-pink-300 transition-all hover:scale-105 active:scale-95"
          id="parent-settings-open-btn"
        >
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Phụ Huynh</span>
          <span className="sm:hidden">Cài Đặt</span>
        </button>
      </div>
    </header>
  );
};
