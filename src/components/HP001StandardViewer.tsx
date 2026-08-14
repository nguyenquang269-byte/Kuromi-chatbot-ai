import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Eye,
  Volume2,
  CheckCircle2,
  PenTool,
  HelpCircle,
  Layers,
  ArrowRight,
  Maximize2,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";
import { getHP001LetterModel, HP001LetterModel, HP001Stroke } from "../data/hp001LetterPaths";
import { VietnameseLetterItem } from "../data/vietnameseCurriculum";
import { soundFX, speakKuromiText } from "../utils/speech";

interface HP001StandardViewerProps {
  letterItem: VietnameseLetterItem;
  olyGridType: "4hang" | "5hang";
  onSwitchToDrawing?: () => void;
}

export const HP001StandardViewer: React.FC<HP001StandardViewerProps> = ({
  letterItem,
  olyGridType,
  onSwitchToDrawing,
}) => {
  const model: HP001LetterModel = getHP001LetterModel(letterItem.lower);

  // View Modes: "solid" (nét liền), "dashed" (nét đứt tập tô), "uppercase" (chữ hoa), "animated" (hoạt họa nét bút), "trace" (tập tô trực tiếp)
  const [displayMode, setDisplayMode] = useState<"solid" | "dashed" | "uppercase" | "animated" | "trace">("solid");
  const [showGridLabels, setShowGridLabels] = useState<boolean>(true);
  const [showKeyPoints, setShowKeyPoints] = useState<boolean>(true);
  const [activeStrokeIndex, setActiveStrokeIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(0);

  // Tracing Canvas state
  const traceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [traceScore, setTraceScore] = useState<number | null>(null);
  const [penColor, setPenColor] = useState<string>("#ff31b9");

  // Auto-reset animation when letter changes
  useEffect(() => {
    setIsAnimating(false);
    setAnimProgress(0);
    setActiveStrokeIndex(0);
    setTraceScore(null);
    clearTraceCanvas();
  }, [letterItem.id]);

  // Stroke Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    if (isAnimating) {
      const step = () => {
        setAnimProgress((prev) => {
          if (prev >= 100) {
            setIsAnimating(false);
            soundFX.playMagicChime();
            return 100;
          }
          return prev + 1.2;
        });
        animationFrameId = requestAnimationFrame(step);
      };
      animationFrameId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAnimating]);

  const toggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false);
    } else {
      setAnimProgress(0);
      setIsAnimating(true);
      soundFX.playSparkle();
    }
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setAnimProgress(0);
  };

  // Tracing handlers
  const startTracing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = traceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    setIsTracing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawTrace = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isTracing) return;
    const canvas = traceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopTracing = () => {
    if (!isTracing) return;
    setIsTracing(false);
    soundFX.playPop();
  };

  const checkTraceCompletion = () => {
    soundFX.playSuccessFanfare();
    setTraceScore(100);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff31b9", "#8b5cf6", "#10b981", "#fbbf24"],
    });
    speakKuromiText(
      `Hoan hô bé! Bé đã tô chữ ${letterItem.lower} theo chuẩn font HP001 cực kỳ đẹp và thẳng hàng ô ly rồi đó!`
    );
  };

  const clearTraceCanvas = () => {
    const canvas = traceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTraceScore(null);
  };

  // Speak sound or poem
  const playLetterSound = () => {
    soundFX.playSparkle();
    speakKuromiText(
      `Âm ${letterItem.sound}! Chữ ${letterItem.letter}, viết thường là ${letterItem.lower}. ${letterItem.fontHp001Note}`
    );
  };

  const playPoem = () => {
    soundFX.playMagicChime();
    speakKuromiText(letterItem.rhymePoem);
  };

  // Active path depending on mode
  const currentPath = displayMode === "uppercase" ? model.allUpperPath : model.allLowerPath;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* ================= CONTROLS & MODE SELECTOR ================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1f0d36]/90 p-2.5 rounded-2xl border border-pink-500/30 backdrop-blur-sm">
        {/* Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              soundFX.playPop();
              setDisplayMode("solid");
              setIsAnimating(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              displayMode === "solid"
                ? "bg-[#ff31b9] text-white border-pink-300 shadow-[0_0_12px_rgba(255,49,185,0.6)]"
                : "bg-purple-950/60 text-pink-200 border-pink-500/20 hover:bg-pink-900/30"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Nét Liền HP001</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop();
              setDisplayMode("dashed");
              setIsAnimating(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              displayMode === "dashed"
                ? "bg-amber-500 text-purple-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                : "bg-purple-950/60 text-pink-200 border-pink-500/20 hover:bg-pink-900/30"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Nét Đứt (Tập Tô)</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop();
              setDisplayMode("animated");
              setIsAnimating(true);
              setAnimProgress(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              displayMode === "animated"
                ? "bg-emerald-600 text-white border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                : "bg-purple-950/60 text-pink-200 border-pink-500/20 hover:bg-pink-900/30"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Hoạt Họa Đưa Bút</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop();
              setDisplayMode("uppercase");
              setIsAnimating(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              displayMode === "uppercase"
                ? "bg-purple-600 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                : "bg-purple-950/60 text-pink-200 border-pink-500/20 hover:bg-pink-900/30"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Chữ In Hoa ({letterItem.letter})</span>
          </button>

          <button
            onClick={() => {
              soundFX.playPop();
              setDisplayMode("trace");
              setIsAnimating(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              displayMode === "trace"
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                : "bg-purple-950/60 text-pink-200 border-pink-500/20 hover:bg-pink-900/30"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Tô Trực Tiếp</span>
          </button>
        </div>

        {/* Auxiliary Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1 text-pink-200 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGridLabels}
              onChange={(e) => setShowGridLabels(e.target.checked)}
              className="accent-pink-500 rounded"
            />
            <span>Đường kẻ (1-6)</span>
          </label>

          <label className="flex items-center gap-1 text-pink-200 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showKeyPoints}
              onChange={(e) => setShowKeyPoints(e.target.checked)}
              className="accent-pink-500 rounded"
            />
            <span>Điểm Đặt/Dừng</span>
          </label>
        </div>
      </div>

      {/* ================= PRIMARY HP001 NOTEBOOK DISPLAY STAGE ================= */}
      <div className="relative w-full bg-[#fbfdf9] rounded-3xl border-4 border-blue-400 p-4 sm:p-6 shadow-[0_0_30px_rgba(59,130,246,0.3)] overflow-hidden flex flex-col items-center select-none">
        {/* Notebook Paper Top Header Bar */}
        <div className="w-full flex items-center justify-between border-b-2 border-red-300 pb-2 mb-3 text-slate-700 font-mono text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 text-[11px]">
              VỞ TẬP VIẾT TIỂU HỌC HP001 ({olyGridType === "4hang" ? "4 HÀNG" : "5 HÀNG"})
            </span>
            <span className="text-pink-600 font-semibold hidden sm:inline">
              Cao: {model.heightOly} ô ly | Rộng: {model.widthOly} ô ly
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={playLetterSound}
              className="px-2.5 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 border border-pink-300 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5 text-pink-600" />
              <span>Đọc Âm "{letterItem.sound}"</span>
            </button>
            <button
              onClick={playPoem}
              className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Thơ Vần</span>
            </button>
          </div>
        </div>

        {/* SVG Container on Authentic 4-Line / 5-Line Primary Grid */}
        <div className="relative w-full max-w-xl aspect-[4/3] max-h-[340px] flex items-center justify-center">
          <svg
            viewBox={model.viewBox}
            className="w-full h-full drop-shadow-sm"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Pattern for 1x1 ô ly grid (40x40 units) */}
              <pattern
                id="olySmallGrid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                />
              </pattern>

              {/* Gradient for HP001 Ink Stroke */}
              <linearGradient id="hp001Ink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="neonPoint" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Background Grid Filling */}
            <rect x="-100" y="-120" width="700" height="600" fill="url(#olySmallGrid)" />

            {/* 2. Main Horizontal Primary Lines (Đường kẻ 1 - Đường kẻ 6) */}
            {/* Đường kẻ 6 (5 ô ly): Y = -40 */}
            <line x1="-100" y1="-40" x2="600" y2="-40" stroke="#93c5fd" strokeWidth="1.2" />
            {/* Đường kẻ 5 (4 ô ly): Y = 0 */}
            <line x1="-100" y1="0" x2="600" y2="0" stroke="#93c5fd" strokeWidth="1.2" />
            {/* Đường kẻ 4 (3 ô ly): Y = 40 */}
            <line x1="-100" y1="40" x2="600" y2="40" stroke="#93c5fd" strokeWidth="1.2" />
            {/* Đường kẻ 3 (2 ô ly): Y = 80 */}
            <line x1="-100" y1="80" x2="600" y2="80" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="6 3" />
            {/* Đường kẻ 2 (1 ô ly): Y = 120 */}
            <line x1="-100" y1="120" x2="600" y2="120" stroke="#93c5fd" strokeWidth="1.2" />
            {/* Đường kẻ 1 (Baseline - DÒNG KẺ ĐẬM CHUẨN): Y = 160 */}
            <line x1="-100" y1="160" x2="600" y2="160" stroke="#1d4ed8" strokeWidth="3" />
            {/* Dưới dòng kẻ 1 (Dòng kẻ phụ kéo dài dưới chân g, y, p, q): Y = 200, 240, 280 */}
            <line x1="-100" y1="200" x2="600" y2="200" stroke="#bfdbfe" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="-100" y1="240" x2="600" y2="240" stroke="#93c5fd" strokeWidth="1.2" />
            <line x1="-100" y1="280" x2="600" y2="280" stroke="#93c5fd" strokeWidth="1.2" />

            {/* 3. Grid Row Labels (Đường kẻ 1, 2, 3, 4, 5, 6) - Positioned safely on the far-left margin */}
            {showGridLabels && (
              <g className="font-mono text-[8.5px] font-bold select-none">
                <text x="5" y="-43" fill="#64748b">ĐK 6 (5 ô)</text>
                <text x="5" y="-3" fill="#64748b">ĐK 5 (4 ô)</text>
                <text x="5" y="37" fill="#64748b">ĐK 4 (3 ô)</text>
                <text x="5" y="77" fill="#db2777" fontWeight="bold">ĐK 3 (2 ô - đỉnh)</text>
                <text x="5" y="117" fill="#64748b">ĐK 2 (1 ô)</text>
                <text x="5" y="157" fill="#1d4ed8" fontWeight="black">ĐK 1 (ĐƯỜNG KẺ CHUẨN)</text>
                <text x="5" y="237" fill="#94a3b8">Dưới 2 ô (p, q)</text>
                <text x="5" y="277" fill="#94a3b8">Dưới 3 ô (g, y)</text>
              </g>
            )}

            {/* 4. Letterform Path Rendering */}
            {displayMode === "dashed" ? (
              // Mode: Dashed/Dotted Guide for tracing
              <g>
                <path
                  d={currentPath}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={currentPath}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="6"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : displayMode === "animated" ? (
              // Mode: Animated Stroke-by-Stroke Path
              <g>
                {/* Background Shadow Outline */}
                <path
                  d={currentPath}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={currentPath}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Active Animated Stroke */}
                <path
                  d={currentPath}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={100 - animProgress}
                />
              </g>
            ) : (
              // Mode: Standard Solid HP001 Vector Ink
              <g>
                {/* Subtle soft shadow for depth */}
                <path
                  d={currentPath}
                  fill="none"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Authentic Primary HP001 Ink Stroke (Solid Deep Blue Ink) */}
                <path
                  d={currentPath}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* High-contrast ink core */}
                <path
                  d={currentPath}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* 5. Key Points (Start Point, Knot Point, End Point) */}
            {showKeyPoints && (
              <g>
                {/* Start Point (🟢 Green Pulsing Dot) */}
                <circle
                  cx={model.startPoint.x}
                  cy={model.startPoint.y}
                  r="7"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#neonPoint)"
                />
                <circle
                  cx={model.startPoint.x}
                  cy={model.startPoint.y}
                  r="3.5"
                  fill="#ffffff"
                />
                <text
                  x={model.startPoint.x + 12}
                  y={model.startPoint.y + 4}
                  className="font-sans text-[11px] font-extrabold fill-emerald-800"
                >
                  ① Bắt đầu
                </text>

                {/* Knot / Inflection Point (🟡 Amber Dot if any) */}
                {model.strokes[0]?.knotPoint && (
                  <g>
                    <circle
                      cx={model.strokes[0].knotPoint.x}
                      cy={model.strokes[0].knotPoint.y}
                      r="6"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={model.strokes[0].knotPoint.x + 10}
                      y={model.strokes[0].knotPoint.y + 3}
                      className="font-sans text-[10px] font-bold fill-amber-800"
                    >
                      ★ Nét thắt
                    </text>
                  </g>
                )}

                {/* Stop Point (🔴 Pink / Red Checked Dot) */}
                <circle
                  cx={model.endPoint.x}
                  cy={model.endPoint.y}
                  r="7"
                  fill="#ec4899"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <circle
                  cx={model.endPoint.x}
                  cy={model.endPoint.y}
                  r="3.5"
                  fill="#ffffff"
                />
                <text
                  x={model.endPoint.x + 12}
                  y={model.endPoint.y + 4}
                  className="font-sans text-[11px] font-extrabold fill-pink-800"
                >
                  ✓ Dừng bút
                </text>
              </g>
            )}
          </svg>

          {/* Interactive Tracing Canvas Overlay (When in Trace Mode) */}
          {displayMode === "trace" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
              <canvas
                ref={traceCanvasRef}
                width={600}
                height={450}
                onMouseDown={startTracing}
                onMouseMove={drawTrace}
                onMouseUp={stopTracing}
                onMouseLeave={stopTracing}
                onTouchStart={startTracing}
                onTouchMove={drawTrace}
                onTouchEnd={stopTracing}
                className="w-full h-full cursor-crosshair touch-none"
              />

              {/* Tracing Floating Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-white/90 p-2 rounded-2xl border border-pink-400 shadow-md backdrop-blur-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Màu bút:</span>
                  {["#ff31b9", "#8b5cf6", "#10b981", "#2563eb", "#dc2626"].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        soundFX.playPop();
                        setPenColor(color);
                      }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        penColor === color ? "scale-125 border-slate-800" : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearTraceCanvas}
                    className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all"
                  >
                    Xóa Nét
                  </button>
                  <button
                    onClick={checkTraceCompletion}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-black shadow-md flex items-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hoàn Thành!</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Animation Play/Pause Toolbar when in Animated Mode */}
        {displayMode === "animated" && (
          <div className="w-full flex items-center justify-between mt-3 bg-purple-50 p-2 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAnimation}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAnimating ? "Tạm Dừng" : "Phát Nét Bút"}</span>
              </button>
              <button
                onClick={resetAnimation}
                className="p-1 rounded-xl bg-purple-200 hover:bg-purple-300 text-purple-900"
                title="Xem lại từ đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-xs mx-3">
              <span className="text-[11px] font-bold text-purple-800 shrink-0">Tiến trình:</span>
              <div className="w-full bg-purple-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all"
                  style={{ width: `${animProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-purple-900 shrink-0">{Math.round(animProgress)}%</span>
            </div>
          </div>
        )}

        {/* Bottom Note on Standard Font Metrics */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>{model.keyNotes}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-lg">
              {model.sampleWordEmoji} {model.sampleWord}
            </span>
          </div>
        </div>
      </div>

      {/* ================= STEP-BY-STEP STROKE GUIDE CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {model.strokes.map((stroke, idx) => (
          <div
            key={stroke.id}
            onClick={() => {
              soundFX.playPop();
              setActiveStrokeIndex(idx);
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              activeStrokeIndex === idx
                ? "bg-gradient-to-r from-purple-900/80 to-[#2c0e4a] border-pink-400 shadow-[0_0_15px_rgba(255,49,185,0.3)] text-white"
                : "bg-purple-950/40 border-pink-500/20 hover:bg-purple-900/30 text-pink-100"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px]">
                  {stroke.id}
                </span>
                {stroke.name}
              </span>
              <span className="text-[10px] font-mono text-pink-300">
                {stroke.startPoint.label}
              </span>
            </div>
            <p className="text-xs text-pink-100/90 leading-relaxed font-sans">
              {stroke.guideText}
            </p>
          </div>
        ))}
      </div>

      {/* Action Shortcut to Full Practice Canvas */}
      {onSwitchToDrawing && (
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-950 via-pink-950 to-purple-950 p-3 rounded-2xl border border-pink-500/40">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <div>
              <div className="text-xs font-black text-pink-200">
                Luyện viết chữ "{letterItem.lower}" trên Bảng Vẽ Ô Ly Đầy Đủ
              </div>
              <div className="text-[11px] text-pink-300/80">
                Sử dụng bút chì màu, cọ nét thanh nét đậm, tẩy và sticker khen thưởng của Kuromi!
              </div>
            </div>
          </div>
          <button
            onClick={onSwitchToDrawing}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff31b9] to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs shadow-[0_0_15px_rgba(255,49,185,0.6)] flex items-center gap-1 shrink-0 transition-all"
          >
            <span>Vào Bảng Vẽ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
