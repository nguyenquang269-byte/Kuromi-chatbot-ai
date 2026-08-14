import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  IllustrationCard,
  ChildProfile,
  StarBadge,
  PrebuiltLesson,
} from "../types";
import { soundFX, speakKuromiText } from "../utils/speech";
import {
  Sparkles,
  Palette,
  Volume2,
  RotateCcw,
  Eraser,
  Download,
  CheckCircle2,
  BookOpen,
  Languages,
  PenTool,
  Grid,
  Heart,
  Star,
  Search,
  X,
  Calculator,
  Plus,
  Minus,
  Divide,
  HelpCircle,
  Award,
} from "lucide-react";
import { ENGLISH_50_WORDS, EnglishWordItem } from "../data/english50Words";
import { HP001StandardViewer } from "./HP001StandardViewer";
import { getHP001LetterModel, HP001LetterModel } from "../data/hp001LetterPaths";
import {
  VIETNAMESE_29_LETTERS,
  VIETNAMESE_COMPOUND_LETTERS,
  VietnameseLetterItem,
  MATH_ADDITION_TABLES,
  MATH_MULTIPLICATION_TABLES,
  MATH_SUBTRACTION_TABLES,
  MATH_DIVISION_TABLES,
  calculateMathProblem,
} from "../data/vietnameseCurriculum";

interface IllustrationBoardProps {
  currentIllustration: IllustrationCard | null;
  childProfile: ChildProfile;
  badges?: StarBadge[];
  onSelectLesson?: (lesson: PrebuiltLesson) => void;
  onAwardBadge?: (badgeId: string, title: string, desc: string, icon: string) => void;
  onClose?: () => void;
}

export const IllustrationBoard: React.FC<IllustrationBoardProps> = ({
  currentIllustration,
  childProfile,
  onClose,
}) => {
  // Main tabs: "vietnamese" | "math" | "english" | "drawing"
  const [activeTab, setActiveTab] = useState<"vietnamese" | "math" | "english" | "drawing">("vietnamese");

  // VIETNAMESE STATE
  const [viLetterType, setViLetterType] = useState<"single" | "compound">("single");
  const [selectedViItem, setSelectedViItem] = useState<VietnameseLetterItem>(VIETNAMESE_29_LETTERS[0]);
  const [viSearchQuery, setViSearchQuery] = useState<string>("");
  const [olyGridType, setOlyGridType] = useState<"4hang" | "5hang">("4hang");

  // MATH STATE
  const [mathOperation, setMathOperation] = useState<"add" | "subtract" | "multiply" | "divide">("add");
  const [mathNum1, setMathNum1] = useState<number>(5);
  const [mathNum2, setMathNum2] = useState<number>(3);
  const [customMathInput, setCustomMathInput] = useState<string>("");
  const [selectedMathTableBase, setSelectedMathTableBase] = useState<number>(2);
  const [mathQuizAnswered, setMathQuizAnswered] = useState<number | null>(null);

  // ENGLISH STATE
  const [selectedEngWord, setSelectedEngWord] = useState<EnglishWordItem>(ENGLISH_50_WORDS[0]);
  const [selectedEngCategory, setSelectedEngCategory] = useState<string>("all");
  const [engSearchQuery, setEngSearchQuery] = useState<string>("");

  // DRAWING CANVAS STATE
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#ff31b9");
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [showDrawingLetterGuide, setShowDrawingLetterGuide] = useState<boolean>(true);
  const [guideLetterChar, setGuideLetterChar] = useState<string>("a");

  // Auto-switch tab based on incoming illustration cards
  useEffect(() => {
    if (!currentIllustration) return;
    if (currentIllustration.type === "math_learning" || currentIllustration.mathData) {
      setActiveTab("math");
      if (currentIllustration.mathData) {
        setMathOperation(currentIllustration.mathData.operation);
        setMathNum1(currentIllustration.mathData.operand1);
        setMathNum2(currentIllustration.mathData.operand2);
      }
    } else if (
      currentIllustration.type === "vietnamese_learning" ||
      currentIllustration.type === "alphabet" ||
      currentIllustration.vietnameseData
    ) {
      setActiveTab("vietnamese");
      if (currentIllustration.vietnameseData?.letter) {
        const found =
          VIETNAMESE_29_LETTERS.find(
            (l) => l.letter.toLowerCase() === currentIllustration.vietnameseData?.letter?.toLowerCase()
          ) ||
          VIETNAMESE_COMPOUND_LETTERS.find(
            (l) => l.letter.toLowerCase() === currentIllustration.vietnameseData?.letter?.toLowerCase()
          );
        if (found) {
          setSelectedViItem(found);
          setViLetterType(found.isCompound ? "compound" : "single");
        }
      }
    } else if (currentIllustration.type === "english_learning" || currentIllustration.englishData) {
      setActiveTab("english");
      if (currentIllustration.englishData?.word) {
        const found = ENGLISH_50_WORDS.find(
          (w) => w.word.toLowerCase() === currentIllustration.englishData?.word?.toLowerCase()
        );
        if (found) setSelectedEngWord(found);
      }
    }
  }, [currentIllustration]);

  // Setup Canvas
  useEffect(() => {
    if (activeTab === "drawing" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeTab]);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (selectedSticker) {
      soundFX.playPop();
      ctx.font = "36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(selectedSticker, x, y);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedSticker) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = drawColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    soundFX.playPop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    soundFX.playSuccessFanfare();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#ff31b9", "#8b5cf6", "#fbbf24"],
    });

    const link = document.createElement("a");
    link.download = `kuromi_tap_viet_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Filtered Vietnamese items
  const viListToSearch = viLetterType === "single" ? VIETNAMESE_29_LETTERS : VIETNAMESE_COMPOUND_LETTERS;
  const filteredViList = viListToSearch.filter((item) => {
    if (!viSearchQuery.trim()) return true;
    const q = viSearchQuery.toLowerCase();
    return (
      item.letter.toLowerCase().includes(q) ||
      item.sound.toLowerCase().includes(q) ||
      item.sampleWords.some((w) => w.word.toLowerCase().includes(q))
    );
  });

  // Filtered English items
  const filteredEnglishWords = ENGLISH_50_WORDS.filter((item) => {
    const matchesCategory = selectedEngCategory === "all" || item.category === selectedEngCategory;
    const matchesSearch =
      !engSearchQuery.trim() ||
      item.word.toLowerCase().includes(engSearchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(engSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Current Math computation
  const activeMathData =
    currentIllustration?.mathData && currentIllustration.type === "math_learning"
      ? currentIllustration.mathData
      : calculateMathProblem(
          mathOperation === "add"
            ? `${mathNum1} + ${mathNum2}`
            : mathOperation === "subtract"
            ? `${mathNum1} - ${mathNum2}`
            : mathOperation === "multiply"
            ? `${mathNum1} * ${mathNum2}`
            : `${mathNum1} / ${mathNum2}`
        ) || {
          operation: mathOperation,
          operationSymbol: mathOperation === "add" ? "+" : mathOperation === "subtract" ? "-" : mathOperation === "multiply" ? "×" : "÷",
          operand1: mathNum1,
          operand2: mathNum2,
          result:
            mathOperation === "add"
              ? mathNum1 + mathNum2
              : mathOperation === "subtract"
              ? mathNum1 - mathNum2
              : mathOperation === "multiply"
              ? mathNum1 * mathNum2
              : Math.floor(mathNum1 / (mathNum2 || 1)),
          operationNameVi:
            mathOperation === "add"
              ? "Phép Cộng (Gộp Lại)"
              : mathOperation === "subtract"
              ? "Phép Trừ (Bớt Đi)"
              : mathOperation === "multiply"
              ? "Phép Nhân (Lấy Nhiều Lần)"
              : "Phép Chia (Chia Đều)",
          stepsExplanation: [
            `Phép tính: ${mathNum1} ${mathOperation === "add" ? "+" : mathOperation === "subtract" ? "-" : mathOperation === "multiply" ? "×" : "÷"} ${mathNum2}`,
            `Kết quả chính xác là ${
              mathOperation === "add"
                ? mathNum1 + mathNum2
                : mathOperation === "subtract"
                ? mathNum1 - mathNum2
                : mathOperation === "multiply"
                ? mathNum1 * mathNum2
                : Math.floor(mathNum1 / (mathNum2 || 1))
            }!`,
          ],
        };

  return (
    <div
      className="w-full h-full flex flex-col bg-gradient-to-b from-[#180a29] via-[#12071f] to-[#0c0414] rounded-3xl border-2 border-[#ff31b9]/50 shadow-[0_0_35px_rgba(255,49,185,0.25)] overflow-hidden"
      id="kuromi-illustration-board-main"
    >
      {/* ================= TOP TABS BAR ================= */}
      <div className="p-2 sm:p-3 bg-black/60 border-b border-[#ff31b9]/30 flex flex-wrap items-center justify-between gap-2 shrink-0 backdrop-blur-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {/* Tab 1: Tiếng Việt */}
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("vietnamese");
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all border shrink-0 ${
              activeTab === "vietnamese"
                ? "bg-gradient-to-r from-[#ff31b9] to-pink-600 text-white border-pink-300 shadow-[0_0_12px_rgba(255,49,185,0.6)]"
                : "bg-purple-950/40 text-pink-200 hover:bg-pink-900/30 border-pink-500/20"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Tiếng Việt (HP001)</span>
          </button>

          {/* Tab 2: Toán Học */}
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("math");
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all border shrink-0 ${
              activeTab === "math"
                ? "bg-gradient-to-r from-amber-500 to-pink-600 text-white border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                : "bg-purple-950/40 text-pink-200 hover:bg-pink-900/30 border-pink-500/20"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-yellow-300" />
            <span>Toán Tiểu Học (+, -, ×, ÷)</span>
          </button>

          {/* Tab 3: Tiếng Anh */}
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("english");
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all border shrink-0 ${
              activeTab === "english"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-300 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                : "bg-purple-950/40 text-pink-200 hover:bg-pink-900/30 border-pink-500/20"
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-sky-300" />
            <span>Tiếng Anh (50 Từ)</span>
          </button>

          {/* Tab 4: Bảng Vẽ */}
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab("drawing");
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all border shrink-0 ${
              activeTab === "drawing"
                ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-300 shadow-[0_0_12px_rgba(255,49,185,0.6)]"
                : "bg-purple-950/40 text-pink-200 hover:bg-pink-900/30 border-pink-500/20"
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-pink-300" />
            <span>Tập Viết & Bảng Vẽ</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-purple-950/60 hover:bg-pink-900/50 text-pink-300 border border-pink-500/30 text-xs font-bold"
          >
            ✕ Đóng
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: TIẾNG VIỆT (29 CHỮ CÁI & 11 CHỮ GHÉP - FONT HP001 4 HÀNG & TIỂU HỌC)
          ========================================================================= */}
      {activeTab === "vietnamese" && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3.5">
          {/* Sub-selector: 29 Chữ Cái Đơn vs 11 Chữ Ghép + Chọn Vở Ô Ly */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-black/40 p-2 rounded-2xl border border-pink-500/30">
            {/* Single vs Compound Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundFX.playPop();
                  setViLetterType("single");
                  setSelectedViItem(VIETNAMESE_29_LETTERS[0]);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  viLetterType === "single"
                    ? "bg-[#ff31b9] text-white border-pink-300 shadow-[0_0_10px_rgba(255,49,185,0.6)]"
                    : "bg-black/40 text-pink-300 border-pink-500/20"
                }`}
              >
                🔤 29 Chữ Cái Đơn
              </button>
              <button
                onClick={() => {
                  soundFX.playPop();
                  setViLetterType("compound");
                  setSelectedViItem(VIETNAMESE_COMPOUND_LETTERS[0]);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  viLetterType === "compound"
                    ? "bg-amber-500 text-purple-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                    : "bg-black/40 text-pink-300 border-pink-500/20"
                }`}
              >
                🧩 11 Chữ Ghép (ch, gh, kh, th...)
              </button>
            </div>

            {/* Notebook Grid Switcher */}
            <div className="flex items-center gap-1.5 text-xs text-pink-200">
              <span className="text-[11px] font-bold text-amber-300">Vở:</span>
              <button
                onClick={() => {
                  soundFX.playPop();
                  setOlyGridType("4hang");
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                  olyGridType === "4hang"
                    ? "bg-blue-600 text-white border-blue-300"
                    : "bg-black/40 text-slate-300 border-blue-500/30"
                }`}
              >
                HP001 4 hàng
              </button>
              <button
                onClick={() => {
                  soundFX.playPop();
                  setOlyGridType("5hang");
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                  olyGridType === "5hang"
                    ? "bg-blue-600 text-white border-blue-300"
                    : "bg-black/40 text-slate-300 border-blue-500/30"
                }`}
              >
                Ô ly 5 hàng
              </button>
            </div>
          </div>

          {/* Primary Vietnamese Showcase Stage with Full HP001 Vector Model */}
          <HP001StandardViewer
            letterItem={selectedViItem}
            olyGridType={olyGridType}
            onSwitchToDrawing={() => {
              soundFX.playPop();
              setActiveTab("drawing");
              setShowGrid(true);
            }}
          />

          {/* Sample Words with Emojis */}
          {selectedViItem.sampleWords && selectedViItem.sampleWords.length > 0 && (
            <div className="w-full bg-[#1a072f]/80 p-3 rounded-2xl border border-pink-500/30">
              <span className="text-xs font-black text-[#ff77cf] block mb-2 text-left">
                Từ vựng mẫu chuẩn tiểu học chứa âm "{selectedViItem.sound}":
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedViItem.sampleWords.map((item, wIdx) => (
                  <button
                    key={wIdx}
                    onClick={() => {
                      soundFX.playPop();
                      speakKuromiText(`${item.word}! ${item.meaning || ""}`, {
                        rate: childProfile.speechRate,
                        pitch: childProfile.speechPitch,
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-[#ff31b9]/30 border border-pink-400/40 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="font-hp001 text-sm text-amber-300 font-bold">{item.word}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Picker Grid (29 Chữ Cái Đơn hoặc 11 Chữ Ghép) */}
          <div className="bg-black/40 p-3 rounded-2xl border border-pink-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#ff77cf] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                {viLetterType === "single" ? "Kho 29 Chữ Cái Tiếng Việt:" : "Kho 11 Chữ Ghép Tiếng Việt:"}
              </span>
              {/* Search input */}
              <input
                type="text"
                value={viSearchQuery}
                onChange={(e) => setViSearchQuery(e.target.value)}
                placeholder="Tìm chữ cái hoặc từ..."
                className="px-2.5 py-0.5 rounded-xl bg-black/60 border border-pink-500/30 text-xs text-pink-100 placeholder-pink-400/50 w-36 focus:outline-none focus:border-[#ff31b9]"
              />
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {filteredViList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFX.playPop();
                    setSelectedViItem(item);
                    speakKuromiText(`Chữ ${item.letter}, đọc là ${item.sound}!`, {
                      rate: childProfile.speechRate,
                      pitch: childProfile.speechPitch,
                    });
                  }}
                  className={`p-1.5 rounded-xl border flex flex-col items-center justify-center font-bold transition-all active:scale-95 ${
                    selectedViItem.id === item.id
                      ? "bg-[#ff31b9] border-white text-white shadow-[0_0_10px_rgba(255,49,185,0.7)] scale-105"
                      : "bg-black/50 border-pink-500/30 text-pink-200 hover:bg-pink-900/40"
                  }`}
                >
                  <span className="text-xs font-bold leading-none">{item.letter}</span>
                  <span className="text-xs font-hp001 text-amber-300 leading-none mt-0.5">{item.lower}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TOÁN TIỂU HỌC (+, -, ×, ÷) - TRỰC QUAN QUE TÍNH & BẢNG CỬU CHƯƠNG
          ========================================================================= */}
      {activeTab === "math" && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3.5">
          {/* Top Operation Selector (+, -, ×, ÷) & Custom Math Input */}
          <div className="bg-black/40 p-3 rounded-2xl border border-pink-500/30 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              {/* 4 Operation Buttons */}
              <div className="flex items-center gap-1">
                {[
                  { op: "add" as const, sym: "+", label: "Cộng (+)" },
                  { op: "subtract" as const, sym: "-", label: "Trừ (-)" },
                  { op: "multiply" as const, sym: "×", label: "Nhân (×)" },
                  { op: "divide" as const, sym: "÷", label: "Chia (÷)" },
                ].map((item) => (
                  <button
                    key={item.op}
                    onClick={() => {
                      soundFX.playPop();
                      setMathOperation(item.op);
                      setMathQuizAnswered(null);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      mathOperation === item.op
                        ? "bg-gradient-to-r from-amber-500 to-pink-600 text-white border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                        : "bg-black/50 text-pink-200 border-pink-500/20 hover:bg-pink-900/30"
                    }`}
                  >
                    <span className="font-mono font-black">{item.sym}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Math Prompt Input */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customMathInput}
                  onChange={(e) => setCustomMathInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customMathInput.trim()) {
                      const res = calculateMathProblem(customMathInput);
                      if (res) {
                        setMathOperation(res.operation);
                        setMathNum1(res.operand1);
                        setMathNum2(res.operand2);
                        setCustomMathInput("");
                        soundFX.playSparkle();
                        speakKuromiText(
                          `Phép tính ${res.operand1} ${res.operationSymbol} ${res.operand2} bằng ${res.result}!`,
                          { rate: childProfile.speechRate, pitch: childProfile.speechPitch }
                        );
                      }
                    }
                  }}
                  placeholder="Nhập phép tính (vd: 7 * 8, 15 + 9)..."
                  className="px-2.5 py-1 rounded-xl bg-black/60 border border-pink-500/30 text-xs text-pink-100 placeholder-pink-400/50 focus:outline-none focus:border-amber-400 w-full sm:w-56"
                />
                <button
                  onClick={() => {
                    if (customMathInput.trim()) {
                      const res = calculateMathProblem(customMathInput);
                      if (res) {
                        setMathOperation(res.operation);
                        setMathNum1(res.operand1);
                        setMathNum2(res.operand2);
                        setCustomMathInput("");
                        soundFX.playSparkle();
                        speakKuromiText(
                          `Phép tính ${res.operand1} ${res.operationSymbol} ${res.operand2} bằng ${res.result}!`,
                          { rate: childProfile.speechRate, pitch: childProfile.speechPitch }
                        );
                      }
                    }
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-purple-950 rounded-xl font-bold text-xs shrink-0 shadow active:scale-95"
                >
                  Giải
                </button>
              </div>
            </div>

            {/* Quick Number Spinners */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 bg-purple-950/60 px-3 py-1 rounded-xl border border-pink-500/30">
                <span className="text-pink-300 font-bold">Số thứ 1:</span>
                <button
                  onClick={() => setMathNum1((p) => Math.max(0, p - 1))}
                  className="w-5 h-5 rounded bg-black/40 border border-pink-500/40 text-pink-200 font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono font-black text-amber-300 text-sm">{mathNum1}</span>
                <button
                  onClick={() => setMathNum1((p) => Math.min(100, p + 1))}
                  className="w-5 h-5 rounded bg-black/40 border border-pink-500/40 text-pink-200 font-bold"
                >
                  +
                </button>
              </div>

              <span className="font-mono font-black text-base text-pink-400">{activeMathData.operationSymbol}</span>

              <div className="flex items-center gap-1.5 bg-purple-950/60 px-3 py-1 rounded-xl border border-pink-500/30">
                <span className="text-pink-300 font-bold">Số thứ 2:</span>
                <button
                  onClick={() => setMathNum2((p) => Math.max(mathOperation === "divide" ? 1 : 0, p - 1))}
                  className="w-5 h-5 rounded bg-black/40 border border-pink-500/40 text-pink-200 font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono font-black text-amber-300 text-sm">{mathNum2}</span>
                <button
                  onClick={() => setMathNum2((p) => Math.min(50, p + 1))}
                  className="w-5 h-5 rounded bg-black/40 border border-pink-500/40 text-pink-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Visual Math Showcase Card (Phép Tính & Minh Họa Trực Quan Đồ Vật) */}
          <div className="relative bg-gradient-to-br from-[#270c42] via-[#1a072f] to-[#2c0e4a] p-4 sm:p-5 rounded-3xl border-2 border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/50">
                {activeMathData.operationNameVi}
              </span>
            </div>

            {/* Giant Visual Math Formula */}
            <div className="my-2 p-3 sm:p-4 rounded-2xl bg-black/60 border border-amber-400/40 w-full max-w-md shadow-inner flex items-center justify-center gap-3">
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-mono font-black text-pink-300">{activeMathData.operand1}</span>
                <span className="text-[10px] text-slate-400">Số hạng 1</span>
              </div>

              <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                {activeMathData.operationSymbol}
              </span>

              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-mono font-black text-pink-300">{activeMathData.operand2}</span>
                <span className="text-[10px] text-slate-400">Số hạng 2</span>
              </div>

              <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">=</span>

              <div className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-mono font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">
                  {activeMathData.result}
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">Kết quả</span>
              </div>
            </div>

            {/* Visual Item Demonstration (Que Tính / Quả Táo / Bánh Kẹo) */}
            <div className="w-full max-w-md bg-purple-950/40 p-3 rounded-2xl border border-pink-500/30 my-2 text-left">
              <div className="text-xs font-black text-amber-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Minh họa số lượng trực quan cho bé:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 py-1">
                {/* Group 1 items */}
                <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-pink-950/40 border border-pink-500/30">
                  {Array.from({ length: Math.min(activeMathData.operand1, 15) }).map((_, i) => (
                    <span key={i} className="text-lg">
                      {activeMathData.visualItems?.emoji || "🍎"}
                    </span>
                  ))}
                  {activeMathData.operand1 > 15 && <span className="text-xs text-pink-300 font-bold">+{activeMathData.operand1 - 15} nữa</span>}
                </div>

                <span className="font-mono font-black text-amber-300 text-sm">{activeMathData.operationSymbol}</span>

                {/* Group 2 items */}
                <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-purple-950/50 border border-purple-500/30">
                  {Array.from({ length: Math.min(activeMathData.operand2, 15) }).map((_, i) => (
                    <span key={i} className="text-lg">
                      {activeMathData.visualItems?.emoji || "🍎"}
                    </span>
                  ))}
                  {activeMathData.operand2 > 15 && <span className="text-xs text-purple-300 font-bold">+{activeMathData.operand2 - 15} nữa</span>}
                </div>
              </div>

              {/* Step by step explanation */}
              <div className="mt-2 pt-2 border-t border-pink-500/20 text-xs text-pink-100 space-y-1">
                {activeMathData.stepsExplanation.map((st, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Read Math Solution Audio Button */}
            <button
              onClick={() => {
                soundFX.playPop();
                speakKuromiText(
                  `Phép tính: ${activeMathData.operand1} ${activeMathData.operationSymbol} ${activeMathData.operand2} bằng ${activeMathData.result}! ${activeMathData.stepsExplanation.join(". ")}`,
                  { rate: childProfile.speechRate, pitch: childProfile.speechPitch }
                );
              }}
              className="mt-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe Kuromi giải thích phép tính</span>
            </button>

            {/* Mini Practice Quiz if available */}
            {activeMathData.practiceQuiz && (
              <div className="w-full max-w-md bg-black/50 p-3 rounded-2xl border border-amber-400/40 mt-3 text-left">
                <div className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
                  <span>Bé thử tài nhẩm nhanh:</span>
                </div>
                <p className="text-xs text-pink-100 mb-2">{activeMathData.practiceQuiz.question}</p>

                <div className="flex items-center gap-2">
                  {activeMathData.practiceQuiz.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => {
                        setMathQuizAnswered(opt);
                        if (opt === activeMathData.practiceQuiz?.correctAnswer) {
                          soundFX.playSuccessFanfare();
                          confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
                          speakKuromiText(`Chính xác rồi! Bé tính nhẩm siêu quá!`, {
                            rate: childProfile.speechRate,
                            pitch: childProfile.speechPitch,
                          });
                        } else {
                          soundFX.playPop();
                          speakKuromiText(`Chưa đúng rồi bé ơi, bé thử lại xem nha!`, {
                            rate: childProfile.speechRate,
                            pitch: childProfile.speechPitch,
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs border transition-all active:scale-95 ${
                        mathQuizAnswered === opt
                          ? opt === activeMathData.practiceQuiz.correctAnswer
                            ? "bg-emerald-600 text-white border-emerald-300"
                            : "bg-red-600 text-white border-red-300"
                          : "bg-purple-950/60 hover:bg-pink-900/40 text-pink-200 border-pink-500/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {mathQuizAnswered !== null && (
                  <p
                    className={`mt-2 text-xs font-bold ${
                      mathQuizAnswered === activeMathData.practiceQuiz.correctAnswer
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {mathQuizAnswered === activeMathData.practiceQuiz.correctAnswer
                      ? activeMathData.practiceQuiz.explanation
                      : "Gợi ý: Bé đếm que tính xem nha!"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bảng Cửu Chương & Bảng Tính Tiểu Học Tra Cứu Nhanh */}
          <div className="bg-black/40 p-3 rounded-2xl border border-pink-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-pink-400" />
                Tra cứu Bảng Cửu Chương & Bảng Tính:
              </span>
              <div className="flex items-center gap-1">
                {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      soundFX.playPop();
                      setSelectedMathTableBase(num);
                    }}
                    className={`w-6 h-6 rounded-lg text-xs font-black font-mono transition-all ${
                      selectedMathTableBase === num
                        ? "bg-amber-400 text-purple-950 shadow"
                        : "bg-purple-950/60 text-pink-200 border border-pink-500/30"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of the selected multiplication/addition table */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1">
              {Array.from({ length: 10 }, (_, i) => {
                const step = i + 1;
                const formula =
                  mathOperation === "multiply"
                    ? `${selectedMathTableBase} × ${step} = ${selectedMathTableBase * step}`
                    : mathOperation === "divide"
                    ? `${selectedMathTableBase * step} ÷ ${selectedMathTableBase} = ${step}`
                    : mathOperation === "subtract"
                    ? `${selectedMathTableBase + step} - ${selectedMathTableBase} = ${step}`
                    : `${selectedMathTableBase} + ${step} = ${selectedMathTableBase + step}`;
                return (
                  <button
                    key={step}
                    onClick={() => {
                      soundFX.playPop();
                      if (mathOperation === "multiply") {
                        setMathNum1(selectedMathTableBase);
                        setMathNum2(step);
                      } else if (mathOperation === "divide") {
                        setMathNum1(selectedMathTableBase * step);
                        setMathNum2(selectedMathTableBase);
                      } else if (mathOperation === "subtract") {
                        setMathNum1(selectedMathTableBase + step);
                        setMathNum2(selectedMathTableBase);
                      } else {
                        setMathNum1(selectedMathTableBase);
                        setMathNum2(step);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-purple-950/50 hover:bg-pink-900/40 border border-pink-500/30 text-pink-200 text-xs font-mono font-bold text-center active:scale-95 transition-all"
                  >
                    {formula}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TIẾNG ANH (50 TỪ VỰNG & PHÁT ÂM)
          ========================================================================= */}
      {activeTab === "english" && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3.5">
          {/* English Showcase Card */}
          <div className="relative bg-gradient-to-br from-[#260d40] via-[#1a072e] to-[#2c0e4a] p-4 sm:p-5 rounded-3xl border-2 border-purple-400/70 shadow-[0_0_25px_rgba(168,85,247,0.3)] flex flex-col items-center text-center">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-purple-600/30 text-purple-200 border border-purple-400/50 mb-2">
              Từ Vựng Tiếng Anh Trẻ Em
            </span>

            <motion.div
              key={selectedEngWord.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl sm:text-7xl my-1 drop-shadow"
            >
              {selectedEngWord.emoji}
            </motion.div>

            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{selectedEngWord.word}</div>
            <div className="text-xs text-pink-300 font-mono italic">{selectedEngWord.pronunciation}</div>
            <div className="text-lg font-bold text-amber-300 mt-1">{selectedEngWord.meaning}</div>

            {/* Pronunciation speech button */}
            <button
              onClick={() => {
                soundFX.playPop();
                speakKuromiText(`${selectedEngWord.word}! Nghĩa là ${selectedEngWord.meaning}!`, {
                  rate: childProfile.speechRate,
                  pitch: childProfile.speechPitch,
                });
              }}
              className="mt-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe đọc: {selectedEngWord.word}</span>
            </button>

            {/* Sentence example */}
            {selectedEngWord.sentence && (
              <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-pink-500/30 w-full max-w-sm text-left text-xs">
                <div className="text-pink-100 font-medium">💬 "{selectedEngWord.sentence}"</div>
                {selectedEngWord.sentenceVi && (
                  <div className="text-pink-300/80 text-[11px] italic mt-0.5">➔ {selectedEngWord.sentenceVi}</div>
                )}
              </div>
            )}
          </div>

          {/* 50 English Words Explorer */}
          <div className="bg-black/40 p-3 rounded-2xl border border-pink-500/30 space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-pink-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Kho 50 Từ Tiếng Anh ({filteredEnglishWords.length}/50):
              </span>
              <input
                type="text"
                value={engSearchQuery}
                onChange={(e) => setEngSearchQuery(e.target.value)}
                placeholder="Tìm từ vựng..."
                className="px-2.5 py-0.5 rounded-xl bg-black/60 border border-pink-500/30 text-xs text-pink-100 placeholder-pink-400/50 w-full sm:w-44 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {[
                { id: "all", label: "🌟 Tất Cả (50)" },
                { id: "animals", label: "🐾 Động Vật (10)" },
                { id: "food", label: "🍎 Hoa Quả (10)" },
                { id: "nature", label: "🌈 Thiên Nhiên (10)" },
                { id: "school_toys", label: "🎒 Trường Học (10)" },
                { id: "family_actions", label: "💖 Gia Đình (10)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedEngCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap border ${
                    selectedEngCategory === cat.id
                      ? "bg-purple-600 text-white border-purple-300 shadow"
                      : "bg-black/40 text-pink-300 border-pink-500/20"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {filteredEnglishWords.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFX.playPop();
                    setSelectedEngWord(item);
                    speakKuromiText(`${item.word}! Nghĩa là ${item.meaning}!`, {
                      rate: childProfile.speechRate,
                      pitch: childProfile.speechPitch,
                    });
                  }}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-left transition-all active:scale-95 ${
                    selectedEngWord.id === item.id
                      ? "bg-purple-600/40 border-purple-400 text-white shadow scale-105"
                      : "bg-black/50 border-pink-500/20 text-pink-200 hover:bg-pink-900/30"
                  }`}
                >
                  <span className="text-xl shrink-0">{item.emoji}</span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{item.word}</div>
                    <div className="text-[10.5px] text-amber-300 truncate">{item.meaning}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: TẬP VIẾT Ô LY & BẢNG VẼ TỰ DO CHO BÉ
          ========================================================================= */}
      {activeTab === "drawing" && (
        <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden" id="child-drawing-canvas-view">
          {/* Letter Quick Picker Ribbon for Tracing */}
          <div className="bg-purple-950/80 p-2 rounded-2xl border border-pink-500/30 mb-2 flex items-center gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-bold text-pink-300 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Mẫu chữ tô:</span>
            </div>
            <div className="flex items-center gap-1">
              {VIETNAMESE_29_LETTERS.map((item) => (
                <button
                  key={item.letter}
                  onClick={() => {
                    soundFX.playPop();
                    setGuideLetterChar(item.letter);
                    setShowDrawingLetterGuide(true);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all font-mono shrink-0 ${
                    guideLetterChar.toLowerCase() === item.letter.toLowerCase() && showDrawingLetterGuide
                      ? "bg-gradient-to-r from-[#ff31b9] to-pink-500 text-white shadow-md scale-105 border border-white/60"
                      : "bg-purple-900/50 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50"
                  }`}
                >
                  {item.letter}
                </button>
              ))}
              {VIETNAMESE_COMPOUND_LETTERS.map((item) => (
                <button
                  key={item.letter}
                  onClick={() => {
                    soundFX.playPop();
                    setGuideLetterChar(item.letter);
                    setShowDrawingLetterGuide(true);
                  }}
                  className={`px-2 py-1 rounded-xl text-xs font-bold transition-all font-mono shrink-0 ${
                    guideLetterChar.toLowerCase() === item.letter.toLowerCase() && showDrawingLetterGuide
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105 border border-white/60"
                      : "bg-purple-900/50 hover:bg-purple-800/60 text-amber-200 border border-purple-700/50"
                  }`}
                >
                  {item.letter}
                </button>
              ))}
            </div>
          </div>

          {/* Drawing Tools Ribbon */}
          <div className="bg-black/50 p-2 rounded-2xl border border-[#ff31b9]/40 mb-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              {[
                { color: "#ff31b9", name: "Hồng" },
                { color: "#8b5cf6", name: "Tím" },
                { color: "#fbbf24", name: "Vàng" },
                { color: "#10b981", name: "Xanh lá" },
                { color: "#3b82f6", name: "Xanh dương" },
                { color: "#ef4444", name: "Đỏ" },
                { color: "#000000", name: "Đen" },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => {
                    soundFX.playPop();
                    setDrawColor(c.color);
                    setIsEraser(false);
                    setSelectedSticker(null);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    drawColor === c.color && !isEraser && !selectedSticker
                      ? "scale-125 border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Brush & Tools */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  soundFX.playPop();
                  setShowDrawingLetterGuide(!showDrawingLetterGuide);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition-all ${
                  showDrawingLetterGuide
                    ? "bg-pink-600 text-white border-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                    : "bg-purple-950/60 text-pink-300 border-pink-500/30"
                }`}
                title="Bật/tắt mẫu chữ HP001 để tập tô"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showDrawingLetterGuide ? `Mẫu Chữ "${guideLetterChar}": BẬT` : "Mẫu Chữ: TẮT"}</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playPop();
                  setShowGrid(!showGrid);
                }}
                className={`px-2 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 ${
                  showGrid
                    ? "bg-blue-600 text-white border-blue-300"
                    : "bg-purple-950/60 text-pink-300 border-pink-500/30"
                }`}
                title="Bật/tắt ô ly tập viết"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{showGrid ? "Ô Ly: BẬT" : "Ô Ly: TẮT"}</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playPop();
                  setIsEraser(!isEraser);
                  setSelectedSticker(null);
                }}
                className={`px-2 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 ${
                  isEraser
                    ? "bg-rose-600 text-white border-rose-300"
                    : "bg-purple-950/60 text-pink-300 border-pink-500/30"
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Tẩy</span>
              </button>

              <button
                onClick={clearCanvas}
                className="px-2 py-1 rounded-xl bg-purple-950/60 hover:bg-pink-900/40 text-pink-200 border border-pink-500/30 text-[11px] font-bold flex items-center gap-1 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa Bảng</span>
              </button>

              <button
                onClick={downloadDrawing}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#ff31b9] to-pink-600 text-white border border-pink-300 text-[11px] font-bold flex items-center gap-1 shadow active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Lưu Tranh</span>
              </button>
            </div>
          </div>

          {/* Canvas Board with Notebook Grid and Guide Overlay */}
          <div
            className={`relative flex-1 rounded-2xl border-2 border-pink-500/50 overflow-hidden shadow-inner flex items-center justify-center ${
              showGrid ? "bg-oly-4hang" : "bg-[#fcf9f2]"
            }`}
          >
            {/* Background SVG HP001 Guide Letter */}
            {showDrawingLetterGuide && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                {(() => {
                  const model = getHP001LetterModel(guideLetterChar);
                  return (
                    <svg
                      viewBox={model.viewBox}
                      className="w-full h-full max-h-[380px] max-w-xl opacity-80"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Guide letter faint background */}
                      <path
                        d={model.allLowerPath}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Guide letter dashed stroke */}
                      <path
                        d={model.allLowerPath}
                        fill="none"
                        stroke="#ec4899"
                        strokeWidth="6"
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Start Point */}
                      <circle
                        cx={model.startPoint.x}
                        cy={model.startPoint.y}
                        r="7"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      {/* End Point */}
                      <circle
                        cx={model.endPoint.x}
                        cy={model.endPoint.y}
                        r="6"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </svg>
                  );
                })()}
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="relative z-10 w-full h-full cursor-crosshair touch-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
