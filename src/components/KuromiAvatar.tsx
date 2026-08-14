import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KuromiMood } from "../types";
import { soundFX, speakKuromiText } from "../utils/speech";
import {
  RotateCw,
  Footprints,
  Sparkles,
  Zap,
  Volume2,
  Trophy,
  Smile,
  Heart,
  Music,
} from "lucide-react";
import {
  KUROMI_BODY_REACTIONS,
  KUROMI_AUTONOMOUS_MOVEMENTS,
  KuromiBodyPart,
  BodyPartReaction,
  AutonomousMovement,
} from "../data/kuromiInteractions";

interface Kuromi3DProps {
  mood?: KuromiMood;
  isSpeaking?: boolean;
  isListening?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "stage";
  onTap?: () => void;
  showSpeechBubble?: boolean;
  currentSpeechText?: string;
  enableWalkByDefault?: boolean;
}

export const Kuromi3D: React.FC<Kuromi3DProps> = ({
  mood = "playful",
  isSpeaking = false,
  isListening = false,
  size = "stage",
  onTap,
  showSpeechBubble = false,
  currentSpeechText,
  enableWalkByDefault = false,
}) => {
  const [isTapped, setIsTapped] = useState(false);
  const [activeReaction, setActiveReaction] = useState<BodyPartReaction | null>(null);
  const [activeAutonomousMovement, setActiveAutonomousMovement] = useState<AutonomousMovement | null>(null);
  const [touchedPart, setTouchedPart] = useState<KuromiBodyPart | null>(null);
  const [activeAnim, setActiveAnim] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [isBlushing, setIsBlushing] = useState(false);
  const [isLaughing, setIsLaughing] = useState(false);
  const [idleGiggleBubble, setIdleGiggleBubble] = useState<string | null>(null);

  // Explored 50 reactions tracker
  const [exploredReactions, setExploredReactions] = useState<Set<string>>(() => new Set());

  // Autonomous behavior states (Physical routines: Walk, Spin, Dance, Jump - no random speech!)
  const [isAutonomousMode, setIsAutonomousMode] = useState<boolean>(true);
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // 360-degree rotation states
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const initialAngleRef = useRef<number>(0);

  // Walking back-and-forth states
  const [isWalking, setIsWalking] = useState(enableWalkByDefault);
  const [walkDirection, setWalkDirection] = useState<1 | -1>(1); // 1 = moving right, -1 = moving left
  const [walkX, setWalkX] = useState(0);

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3200 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // 360 Auto-spinning loop
  useEffect(() => {
    if (!isAutoSpinning) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoSpinning]);

  // Walking back and forth engine
  useEffect(() => {
    if (!isWalking) {
      setWalkX(0);
      return;
    }

    const walkInterval = setInterval(() => {
      setWalkX((prev) => {
        const speed = 1.2;
        const nextX = prev + speed * walkDirection;
        const maxBound = 65; // pixels left & right bound

        if (nextX >= maxBound) {
          setWalkDirection(-1);
          return maxBound;
        } else if (nextX <= -maxBound) {
          setWalkDirection(1);
          return -maxBound;
        }
        return nextX;
      });
    }, 30);

    return () => clearInterval(walkInterval);
  }, [isWalking, walkDirection]);

  // ================= 30-GIÂY IDLE GIGGLE ENGINE (Ở chế độ không làm gì, thỉnh thoảng 30 giây Kuromi cười 1 tiếng) =================
  useEffect(() => {
    const idleGiggleInterval = setInterval(() => {
      const timeSinceLastAction = Date.now() - lastInteractionTimeRef.current;
      // Khi không thao tác khoảng 25-35s và không đang nói/nghe/kéo chuột
      if (timeSinceLastAction >= 25000 && !isSpeaking && !isListening && !isDragging) {
        lastInteractionTimeRef.current = Date.now();
        triggerKuromiGiggle();
      }
    }, 5000);

    return () => clearInterval(idleGiggleInterval);
  }, [isSpeaking, isListening, isDragging]);

  const triggerKuromiGiggle = (customPhrase?: string) => {
    setIsLaughing(true);
    setIsBlushing(true);
    setActiveAnim("jump");

    const cuteLaughPhrases = [
      "Hi hi hi~ ✨",
      "Hí hí! Vui quá à! 💖",
      "He he he~ 🎀",
      "Hi hi~ bạn nhỏ ơi! 🌸",
      "Hí hí hí! Nhí nhảnh ghê! ✨",
      "Hi hi~ Kuromi thích bạn nhỏ nhất! 💜",
      "Hehe! Cười một cái cho tươi vui nè! 🌟",
    ];
    const phrase = customPhrase || cuteLaughPhrases[Math.floor(Math.random() * cuteLaughPhrases.length)];
    setIdleGiggleBubble(phrase);

    // Kích hoạt tiếng cười nhí nhảnh âm thanh tổng hợp
    soundFX.playCuteKuromiGiggle();

    setTimeout(() => {
      setIsLaughing(false);
      setIsBlushing(false);
      setActiveAnim(null);
    }, 2400);

    setTimeout(() => {
      setIdleGiggleBubble(null);
    }, 3200);
  };

  // ================= 1. KUROMI TỰ HÀNH ĐỘNG (PHYSICAL ROUTINES: Đi lại, Xoay, Múa, Nhảy - KHÔNG NÓI NHẢM) =================
  useEffect(() => {
    if (!isAutonomousMode) return;

    const idleInterval = setInterval(() => {
      // If user recently interacted or Kuromi is currently speaking/listening, don't trigger
      const timeSinceLastAction = Date.now() - lastInteractionTimeRef.current;
      if (timeSinceLastAction < 10000 || isSpeaking || isListening || isDragging || isLaughing) {
        return;
      }

      // Pick a random physical movement routine
      const randomMovement =
        KUROMI_AUTONOMOUS_MOVEMENTS[
          Math.floor(Math.random() * KUROMI_AUTONOMOUS_MOVEMENTS.length)
        ];
      triggerAutonomousMovement(randomMovement);
    }, 12000);

    return () => clearInterval(idleInterval);
  }, [isAutonomousMode, isSpeaking, isListening, isDragging, isLaughing]);

  const triggerAutonomousMovement = (movement: AutonomousMovement) => {
    lastInteractionTimeRef.current = Date.now();
    setActiveAutonomousMovement(movement);
    setActiveReaction(null);
    setTouchedPart(null);
    setActiveAnim(movement.anim);

    // Physical movement behaviors
    if (movement.type === "spin") {
      setRotationAngle((prev) => (prev + 360) % 360);
    } else if (movement.type === "walk") {
      setIsWalking(true);
      setTimeout(() => {
        setIsWalking(false);
      }, 4000);
    } else if (movement.type === "wink") {
      setIsWinking(true);
      setTimeout(() => setIsWinking(false), 1500);
    } else if (movement.type === "dance") {
      setIsBlushing(true);
      setTimeout(() => setIsBlushing(false), 2500);
    }

    // Gentle sound FX for physical movements
    if (movement.sound === "magic") soundFX.playMagicChime();
    else if (movement.sound === "fanfare") soundFX.playSuccessFanfare();
    else if (movement.sound === "giggle") {
      soundFX.playCuteKuromiGiggle();
      setIsLaughing(true);
      setTimeout(() => setIsLaughing(false), 2000);
    } else {
      soundFX.playPop();
    }

    setTimeout(() => {
      setActiveAnim(null);
    }, 2500);

    setTimeout(() => {
      setActiveAutonomousMovement(null);
    }, 3500);
  };

  // ================= 2. CHẠM VÀO CÁC VỊ TRÍ TRÊN CƠ THỂ (50+ PHẢN HỒI RIÊNG BIỆT & CƯỜI NHIỀU HƠN) =================
  const triggerBodyPartTouch = (part: KuromiBodyPart) => {
    if (isDragging) return;
    lastInteractionTimeRef.current = Date.now();

    const reactionsList = KUROMI_BODY_REACTIONS[part];
    if (!reactionsList || reactionsList.length === 0) return;

    // Pick random reaction from the 10 available for this specific body part
    const reaction = reactionsList[Math.floor(Math.random() * reactionsList.length)];

    setTouchedPart(part);
    setActiveReaction(reaction);
    setActiveAutonomousMovement(null);
    setIsTapped(true);
    setActiveAnim(reaction.anim);

    // Record explored reaction
    setExploredReactions((prev) => {
      const next = new Set(prev);
      next.add(reaction.id);
      return next;
    });

    // Special animation helpers
    if (reaction.anim === "wink") {
      setIsWinking(true);
      setTimeout(() => setIsWinking(false), 1200);
    }
    if (reaction.anim === "blush") {
      setIsBlushing(true);
      setTimeout(() => setIsBlushing(false), 2500);
    }
    if (reaction.anim === "spin") {
      setRotationAngle((prev) => (prev + 180) % 360);
    }

    // Kuromi cười nhiều hơn khi bé chạm vào cơ thể
    if (reaction.sound === "giggle" || Math.random() < 0.55) {
      setIsLaughing(true);
      soundFX.playCuteKuromiGiggle();
      setTimeout(() => setIsLaughing(false), 2200);
    } else if (reaction.sound === "fanfare") {
      soundFX.playSuccessFanfare();
    } else if (reaction.sound === "magic") {
      soundFX.playMagicChime();
    } else {
      soundFX.playPop();
    }

    // Speak Kuromi's exact reaction voice with sweet cute female pitch
    speakKuromiText(reaction.text, { rate: 1.08, pitch: 1.50 });

    setTimeout(() => {
      setIsTapped(false);
      setActiveAnim(null);
    }, 1200);

    setTimeout(() => {
      setActiveReaction((curr) => (curr?.id === reaction.id ? null : curr));
      setTouchedPart((curr) => (curr === part ? null : curr));
    }, 5000);

    if (onTap) onTap();
  };

  // Drag to rotate handlers
  const handlePointerDown = (clientX: number) => {
    setIsDragging(true);
    setIsAutoSpinning(false);
    dragStartXRef.current = clientX;
    initialAngleRef.current = rotationAngle;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartXRef.current;
    const sensitivity = 0.8;
    let newAngle = (initialAngleRef.current + deltaX * sensitivity) % 360;
    if (newAngle < 0) newAngle += 360;
    setRotationAngle(Math.round(newAngle));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const containerSizes = {
    sm: "w-20 h-24",
    md: "w-32 h-40",
    lg: "w-44 h-52",
    xl: "w-56 h-64",
    stage: "w-44 h-52 sm:w-56 sm:h-64 md:w-64 md:h-72",
  }[size];

  // Normalized rotation 0-360
  const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
  // If angle is in the back half (75° to 285°), we render the 3D Back View
  const isBackView = normalizedAngle > 75 && normalizedAngle < 285;

  return (
    <div
      className="relative flex flex-col items-center select-none w-full"
      id="kuromi-3d-character-stage"
      onMouseMove={(e) => isDragging && handlePointerMove(e.clientX)}
      onMouseUp={handlePointerUp}
      onTouchMove={(e) => isDragging && handlePointerMove(e.touches[0].clientX)}
      onTouchEnd={handlePointerUp}
    >
      {/* Speech Bubble when Kuromi is speaking in chat */}
      <AnimatePresence>
        {showSpeechBubble && currentSpeechText ? (
          <motion.div
            key="chat-bubble"
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute -top-14 sm:-top-20 z-30 px-3.5 py-2 max-w-[280px] sm:max-w-sm bg-gradient-to-r from-[#240c3d]/95 to-[#3b1259]/95 border-2 border-[#ff31b9] rounded-2xl shadow-[0_0_25px_rgba(255,49,185,0.5)] text-pink-100 text-xs sm:text-sm font-medium text-center backdrop-blur-md"
          >
            <span className="leading-snug block">{currentSpeechText}</span>
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#ff31b9]" />
          </motion.div>
        ) : idleGiggleBubble ? (
          <motion.div
            key="giggle-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.7 }}
            animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.7 }}
            transition={{ y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }}
            className="absolute -top-12 sm:-top-16 z-30 px-3 py-1.5 bg-gradient-to-r from-[#ff31b9]/90 to-[#9333ea]/90 border-2 border-pink-200 rounded-full shadow-[0_0_20px_rgba(255,49,185,0.6)] text-white text-xs sm:text-sm font-bold text-center backdrop-blur-md flex items-center gap-1.5 animate-pulse"
          >
            <span>🎀</span>
            <span>{idleGiggleBubble}</span>
            <span>✨</span>
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-[#ff31b9]" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Walking Horizontal Wrapper */}
      <div
        className="relative flex items-center justify-center transition-transform duration-75"
        style={{
          transform: `translateX(${walkX}px) scaleX(${isWalking ? walkDirection : 1})`,
        }}
      >
        {/* Main 3D Rotatable Body with 3D Perspective */}
        <motion.div
          animate={{
            y:
              activeAnim === "jump" || isLaughing
                ? [0, -22, 0, -14, 0]
                : activeAnim === "dance"
                ? [0, -12, 0, -12, 0]
                : isWalking
                ? [0, -7, 0, -7, 0]
                : isSpeaking
                ? [0, -10, 0, -8, 0]
                : isListening
                ? [0, -4, 0]
                : [0, -5, 0],
            rotate:
              activeAnim === "shake"
                ? [0, -14, 14, -10, 10, -5, 5, 0]
                : activeAnim === "dance" || isLaughing
                ? [0, -8, 8, -8, 8, -4, 4, 0]
                : activeAnim === "tickle"
                ? [0, -8, 8, -8, 8, -4, 4, 0]
                : isTapped
                ? [0, -10, 10, -5, 5, 0]
                : isSpeaking
                ? [0, -2, 2, -1, 0]
                : isWalking
                ? [0, -2, 2, -2, 0]
                : 0,
            scale:
              activeAnim === "tickle" || isLaughing
                ? [1, 1.08, 0.95, 1.06, 1]
                : activeAnim === "blush"
                ? [1, 1.05, 1]
                : activeAnim === "dance"
                ? [1, 1.04, 0.98, 1.03, 1]
                : 1,
          }}
          transition={{
            y: {
              repeat: activeAnim === "jump" ? 0 : isLaughing ? 2 : Infinity,
              duration:
                activeAnim === "jump" || isLaughing
                  ? 0.65
                  : activeAnim === "dance"
                  ? 0.8
                  : isWalking
                  ? 0.6
                  : isSpeaking
                  ? 0.8
                  : isListening
                  ? 1.2
                  : 2.5,
              ease: "easeInOut",
            },
            rotate: {
              duration:
                activeAnim === "shake" || activeAnim === "tickle" || isLaughing
                  ? 0.6
                  : activeAnim === "dance"
                  ? 0.8
                  : isTapped
                  ? 0.7
                  : isWalking
                  ? 0.6
                  : 1.2,
              repeat: isSpeaking || isWalking || activeAnim === "dance" || isLaughing ? Infinity : 0,
            },
          }}
          onMouseDown={(e) => handlePointerDown(e.clientX)}
          onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
          className={`${containerSizes} relative cursor-grab active:cursor-grabbing filter drop-shadow-[0_15px_25px_rgba(147,51,234,0.45)] transition-transform`}
          style={{
            perspective: 800,
            transformStyle: "preserve-3d",
          }}
          title="Chạm vào Đầu, Má, Tay, Bụng, Chân hoặc Đuôi của Kuromi để khám phá 50 phản hồi!"
        >
          {/* Magic Aura Backlight */}
          <div
            className={`absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${
              isLaughing
                ? "bg-gradient-to-tr from-[#ff31b9]/70 via-pink-400/50 to-purple-600/60 scale-140 animate-pulse"
                : touchedPart
                ? "bg-gradient-to-tr from-[#ff31b9]/60 via-amber-400/40 to-purple-600/50 scale-130 animate-pulse"
                : activeAutonomousMovement
                ? "bg-gradient-to-tr from-amber-400/50 via-pink-500/40 to-purple-600/50 scale-125 animate-pulse"
                : isSpeaking
                ? "bg-gradient-to-tr from-[#ff31b9]/40 via-purple-600/40 to-pink-500/30 scale-125"
                : isWalking
                ? "bg-gradient-to-tr from-amber-400/30 via-purple-600/40 to-[#ff31b9]/30 scale-115 animate-pulse"
                : isListening
                ? "bg-gradient-to-tr from-emerald-500/30 via-purple-600/40 to-[#ff31b9]/30 scale-110 animate-pulse"
                : "bg-gradient-to-tr from-purple-800/30 to-[#ff31b9]/20"
            }`}
          />

          {/* Sparkles / Footsteps / Laughter Particles */}
          {(isWalking || activeAnim || isLaughing) && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.25, 0.9] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-amber-300 pointer-events-none"
            >
              <span>{isLaughing ? "💖" : "✨"}</span>
              <span className="text-pink-400">{isLaughing ? "🌸" : activeAnim ? "💖" : "🐾"}</span>
              <span>{isLaughing ? "✨" : "✨"}</span>
            </motion.div>
          )}

          {/* 3D Rotated Character Layer */}
          <div
            className="w-full h-full relative z-10 transition-transform duration-75"
            style={{
              transform: `rotateY(${rotationAngle}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* SVG DEFINITIONS FOR BOTH FRONT AND BACK */}
            <svg
              viewBox="0 0 240 280"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 3D Purple Jester Hood & Body Gradient */}
                <radialGradient id="kuromi3DPurple" cx="40%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="45%" stopColor="#4c1d95" />
                  <stop offset="85%" stopColor="#240747" />
                  <stop offset="100%" stopColor="#130324" />
                </radialGradient>

                {/* 3D Ear Velvet Purple Gradient */}
                <linearGradient id="ear3DGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="40%" stopColor="#581c87" />
                  <stop offset="85%" stopColor="#2e1065" />
                  <stop offset="100%" stopColor="#0f051d" />
                </linearGradient>

                {/* 3D White Porcelain Face Gradient */}
                <radialGradient id="face3DGrad" cx="45%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#fdf4ff" />
                  <stop offset="95%" stopColor="#ebd4f7" />
                  <stop offset="100%" stopColor="#c084fc" />
                </radialGradient>

                {/* 3D Neon Pink Skull & Pom-pom Ball Gradient */}
                <radialGradient id="pink3DGrad" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ff77cf" />
                  <stop offset="40%" stopColor="#ff31b9" />
                  <stop offset="80%" stopColor="#db2777" />
                  <stop offset="100%" stopColor="#831843" />
                </radialGradient>

                {/* 3D Gold Accent Gradient */}
                <radialGradient id="gold3DGrad" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </radialGradient>

                {/* Highlight Glow Filter when touched */}
                <filter id="touchGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff31b9" floodOpacity="0.9" />
                </filter>

                {/* Drop Shadow filter for 3D realism */}
                <filter id="soft3DShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* ========================================================
                  BACK VIEW: Rendered when 75° < angle < 285°
                  Features the Devil Tail, Back of Jester Hood, Pom-poms
                  ======================================================== */}
              {isBackView ? (
                <g id="kuromi-3d-back-view">
                  {/* 1. DEVIL TAIL (CLICKABLE TAIL TARGET) */}
                  <g
                    id="devil-tail-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("tail");
                    }}
                  >
                    <motion.g
                      animate={{
                        rotate:
                          activeAnim === "tail_flick"
                            ? [-25, 30, -25, 30, -10, 0]
                            : [0, 15, -15, 0],
                        originX: "120px",
                        originY: "215px",
                      }}
                      transition={{
                        repeat: activeAnim === "tail_flick" ? 0 : Infinity,
                        duration: activeAnim === "tail_flick" ? 0.6 : 1.8,
                        ease: "easeInOut",
                      }}
                      filter={touchedPart === "tail" ? "url(#touchGlow)" : undefined}
                    >
                      {/* Tail Curve */}
                      <path
                        d="M 120 215 Q 165 225 185 195 Q 200 170 180 150 Q 165 135 178 120"
                        stroke="#240747"
                        strokeWidth="7"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Tail Arrow Head */}
                      <polygon
                        points="178,110 162,128 194,128"
                        fill="url(#pink3DGrad)"
                        stroke="#831843"
                        strokeWidth="1.5"
                        filter="url(#soft3DShadow)"
                      />
                    </motion.g>
                  </g>

                  {/* 2. BACK FEET & LEGS (CLICKABLE FEET TARGET) */}
                  <g
                    id="back-feet-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("feet");
                    }}
                  >
                    {/* Left Back Leg */}
                    <path d="M 90 220 L 90 240 L 102 240 L 102 220 Z" fill="url(#kuromi3DPurple)" stroke="#240747" strokeWidth="2.5" />
                    <ellipse
                      cx="95"
                      cy="242"
                      rx="14"
                      ry="8"
                      fill="url(#pink3DGrad)"
                      stroke="#831843"
                      strokeWidth="2"
                      filter={touchedPart === "feet" ? "url(#touchGlow)" : undefined}
                    />
                    {/* Right Back Leg */}
                    <path d="M 138 220 L 138 240 L 150 240 L 150 220 Z" fill="url(#kuromi3DPurple)" stroke="#240747" strokeWidth="2.5" />
                    <ellipse
                      cx="145"
                      cy="242"
                      rx="14"
                      ry="8"
                      fill="url(#pink3DGrad)"
                      stroke="#831843"
                      strokeWidth="2"
                      filter={touchedPart === "feet" ? "url(#touchGlow)" : undefined}
                    />
                  </g>

                  {/* 3. BACK OF BODY, ARMS & DRESS */}
                  <g
                    id="back-body-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("belly");
                    }}
                  >
                    {/* Left Back Arm */}
                    <path d="M 82 168 Q 62 176 56 186" stroke="url(#kuromi3DPurple)" strokeWidth="11" strokeLinecap="round" fill="none" />
                    <circle cx="54" cy="188" r="8" fill="#ffffff" stroke="#240747" strokeWidth="2" />
                    {/* Right Back Arm */}
                    <path d="M 158 168 Q 178 176 184 186" stroke="url(#kuromi3DPurple)" strokeWidth="11" strokeLinecap="round" fill="none" />
                    <circle cx="186" cy="188" r="8" fill="#ffffff" stroke="#240747" strokeWidth="2" />

                    <path
                      d="M 85 160 Q 75 225 120 228 Q 165 225 155 160 Z"
                      fill="url(#kuromi3DPurple)"
                      stroke="#240747"
                      strokeWidth="3"
                    />
                  </g>

                  {/* 4. BACK OF JESTER HOOD & EARS (CLICKABLE HEAD TARGET) */}
                  <g
                    id="back-head-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("head");
                    }}
                  >
                    {/* Left Ear */}
                    <path
                      d="M 85 95 C 65 65 30 45 32 20 C 50 18 85 45 102 75 Z"
                      fill="url(#ear3DGrad)"
                      stroke="#240747"
                      strokeWidth="3"
                      filter={touchedPart === "head" ? "url(#touchGlow)" : undefined}
                    />
                    <circle cx="32" cy="20" r="7" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />

                    {/* Right Ear */}
                    <path
                      d="M 155 95 C 175 65 210 45 208 20 C 190 18 155 45 138 75 Z"
                      fill="url(#ear3DGrad)"
                      stroke="#240747"
                      strokeWidth="3"
                      filter={touchedPart === "head" ? "url(#touchGlow)" : undefined}
                    />
                    <circle cx="208" cy="20" r="7" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />

                    {/* Back of Head Dome */}
                    <circle
                      cx="120"
                      cy="115"
                      r="58"
                      fill="url(#kuromi3DPurple)"
                      stroke="#240747"
                      strokeWidth="3.5"
                      filter="url(#soft3DShadow)"
                    />
                  </g>
                </g>
              ) : (
                /* ========================================================
                   FRONT VIEW: Standard Front 3D Presentation
                   ======================================================== */
                <g id="kuromi-3d-front-view">
                  {/* 1. FRONT DEVIL TAIL (CLICKABLE TAIL TARGET) */}
                  <g
                    id="front-tail-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("tail");
                    }}
                  >
                    <motion.g
                      animate={{
                        rotate:
                          activeAnim === "tail_flick"
                            ? [-25, 30, -25, 30, -10, 0]
                            : [0, 15, -15, 0],
                        originX: "155px",
                        originY: "215px",
                      }}
                      transition={{
                        repeat: activeAnim === "tail_flick" ? 0 : Infinity,
                        duration: activeAnim === "tail_flick" ? 0.6 : 1.8,
                        ease: "easeInOut",
                      }}
                      filter={touchedPart === "tail" ? "url(#touchGlow)" : undefined}
                    >
                      <path
                        d="M 150 215 Q 185 220 200 190 Q 212 165 195 145 Q 185 135 195 120"
                        stroke="#240747"
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <polygon
                        points="195,110 180,128 210,128"
                        fill="url(#pink3DGrad)"
                        stroke="#831843"
                        strokeWidth="1.5"
                        filter="url(#soft3DShadow)"
                      />
                    </motion.g>
                  </g>

                  {/* 2. FEET & LEGS (CLICKABLE FEET TARGET) */}
                  <g
                    id="front-feet-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("feet");
                    }}
                  >
                    {/* Left Leg & Foot */}
                    <motion.g
                      animate={{
                        y:
                          activeAnim === "jump"
                            ? [0, -12, 0]
                            : activeAnim === "dance"
                            ? [0, -4, 0]
                            : isWalking
                            ? [0, -4, 0]
                            : 0,
                      }}
                      transition={{
                        repeat: isWalking || activeAnim === "dance" ? Infinity : 0,
                        duration: 0.35,
                      }}
                    >
                      {/* Left Leg Upper Joint */}
                      <path
                        d="M 90 220 L 90 240 L 102 240 L 102 220 Z"
                        fill="url(#kuromi3DPurple)"
                        stroke="#240747"
                        strokeWidth="2.5"
                      />
                      {/* Left Shoe */}
                      <ellipse
                        cx="95"
                        cy="242"
                        rx="14"
                        ry="8"
                        fill="url(#pink3DGrad)"
                        stroke="#831843"
                        strokeWidth="2"
                        filter={touchedPart === "feet" ? "url(#touchGlow)" : undefined}
                      />
                    </motion.g>

                    {/* Right Leg & Foot */}
                    <motion.g
                      animate={{
                        y:
                          activeAnim === "jump"
                            ? [0, -12, 0]
                            : activeAnim === "dance"
                            ? [0, -4, 0]
                            : isWalking
                            ? [-4, 0, -4]
                            : 0,
                      }}
                      transition={{
                        repeat: isWalking || activeAnim === "dance" ? Infinity : 0,
                        duration: 0.35,
                      }}
                    >
                      {/* Right Leg Upper Joint */}
                      <path
                        d="M 138 220 L 138 240 L 150 240 L 150 220 Z"
                        fill="url(#kuromi3DPurple)"
                        stroke="#240747"
                        strokeWidth="2.5"
                      />
                      {/* Right Shoe */}
                      <ellipse
                        cx="145"
                        cy="242"
                        rx="14"
                        ry="8"
                        fill="url(#pink3DGrad)"
                        stroke="#831843"
                        strokeWidth="2"
                        filter={touchedPart === "feet" ? "url(#touchGlow)" : undefined}
                      />
                    </motion.g>
                  </g>

                  {/* 3. TORSO & BELLY (CLICKABLE BELLY TARGET) */}
                  <g
                    id="front-belly-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("belly");
                    }}
                  >
                    <path
                      d="M 85 160 Q 75 225 120 228 Q 165 225 155 160 Z"
                      fill="url(#kuromi3DPurple)"
                      stroke="#240747"
                      strokeWidth="3"
                    />
                    {/* White Belly Oval */}
                    <ellipse
                      cx="120"
                      cy="195"
                      rx="22"
                      ry="24"
                      fill="#ffffff"
                      stroke="#240747"
                      strokeWidth="2"
                      filter={touchedPart === "belly" ? "url(#touchGlow)" : undefined}
                    />
                  </g>

                  {/* 4. JESTER HOOD & EARS (CLICKABLE HEAD TARGET) */}
                  <g
                    id="front-head-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("head");
                    }}
                  >
                    {/* Left Ear */}
                    <motion.g
                      animate={{
                        rotate:
                          activeAnim === "shake"
                            ? [-8, 8, -8]
                            : [0, 3, -3, 0],
                        originX: "90px",
                        originY: "85px",
                      }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    >
                      <path
                        d="M 85 95 C 65 65 30 45 32 20 C 50 18 85 45 102 75 Z"
                        fill="url(#ear3DGrad)"
                        stroke="#240747"
                        strokeWidth="3"
                        filter={touchedPart === "head" ? "url(#touchGlow)" : undefined}
                      />
                      <circle cx="32" cy="20" r="7" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />
                    </motion.g>

                    {/* Right Ear */}
                    <motion.g
                      animate={{
                        rotate:
                          activeAnim === "shake"
                            ? [8, -8, 8]
                            : [0, -3, 3, 0],
                        originX: "150px",
                        originY: "85px",
                      }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    >
                      <path
                        d="M 155 95 C 175 65 210 45 208 20 C 190 18 155 45 138 75 Z"
                        fill="url(#ear3DGrad)"
                        stroke="#240747"
                        strokeWidth="3"
                        filter={touchedPart === "head" ? "url(#touchGlow)" : undefined}
                      />
                      <circle cx="208" cy="20" r="7" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />
                    </motion.g>

                    {/* Head Dome */}
                    <circle
                      cx="120"
                      cy="115"
                      r="58"
                      fill="url(#kuromi3DPurple)"
                      stroke="#240747"
                      strokeWidth="3.5"
                      filter="url(#soft3DShadow)"
                    />
                  </g>

                  {/* 5. WHITE FACE & FACIAL EXPRESSIONS (CLICKABLE FACE TARGET) */}
                  <g
                    id="front-face-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("face");
                    }}
                  >
                    {/* Face Oval */}
                    <ellipse
                      cx="120"
                      cy="125"
                      rx="48"
                      ry="40"
                      fill="url(#face3DGrad)"
                      stroke="#240747"
                      strokeWidth="3"
                      filter={touchedPart === "face" ? "url(#touchGlow)" : undefined}
                    />

                    {/* Pink Skull on Forehead */}
                    <g id="forehead-skull" filter="url(#soft3DShadow)">
                      <ellipse cx="120" cy="88" rx="10" ry="8" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />
                      <rect x="114" y="93" width="12" height="6" rx="2" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />
                      <circle cx="116.5" cy="87" r="2.2" fill="#240747" />
                      <circle cx="123.5" cy="87" r="2.2" fill="#240747" />
                      <ellipse cx="120" cy="90" rx="1" ry="1.5" fill="#240747" />
                    </g>

                    {/* Left Eye */}
                    <g id="left-eye">
                      {isLaughing ? (
                        <>
                          <path d="M 94 123 Q 102 113 110 123" stroke="#240747" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                          <path d="M 95 114 L 90 111" stroke="#240747" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 94 117 L 88 117" stroke="#240747" strokeWidth="2" strokeLinecap="round" />
                        </>
                      ) : blink ? (
                        <path d="M 94 122 Q 102 126 110 122" stroke="#240747" strokeWidth="3" strokeLinecap="round" fill="none" />
                      ) : mood === "sleepy" ? (
                        <path d="M 94 124 Q 102 118 110 124" stroke="#240747" strokeWidth="3" strokeLinecap="round" fill="none" />
                      ) : (
                        <>
                          <ellipse cx="102" cy="120" rx="6" ry="9" fill="#240747" />
                          <circle cx="100" cy="117" r="2.5" fill="#ffffff" />
                          <circle cx="103.5" cy="123" r="1.2" fill="#ffffff" />
                          <path d="M 95 113 L 90 110" stroke="#240747" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 94 116 L 88 116" stroke="#240747" strokeWidth="2" strokeLinecap="round" />
                        </>
                      )}
                    </g>

                    {/* Right Eye (Supports Wink and Laugh) */}
                    <g id="right-eye">
                      {isLaughing ? (
                        <>
                          <path d="M 130 123 Q 138 113 146 123" stroke="#240747" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                          <path d="M 145 114 L 150 111" stroke="#240747" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 146 117 L 152 117" stroke="#240747" strokeWidth="2" strokeLinecap="round" />
                        </>
                      ) : blink || isWinking ? (
                        <path d="M 130 122 Q 138 126 146 122" stroke="#240747" strokeWidth="3" strokeLinecap="round" fill="none" />
                      ) : mood === "sleepy" ? (
                        <path d="M 130 124 Q 138 118 146 124" stroke="#240747" strokeWidth="3" strokeLinecap="round" fill="none" />
                      ) : (
                        <>
                          <ellipse cx="138" cy="120" rx="6" ry="9" fill="#240747" />
                          <circle cx="136" cy="117" r="2.5" fill="#ffffff" />
                          <circle cx="139.5" cy="123" r="1.2" fill="#ffffff" />
                          <path d="M 145 113 L 150 110" stroke="#240747" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 146 116 L 152 116" stroke="#240747" strokeWidth="2" strokeLinecap="round" />
                        </>
                      )}
                    </g>

                    {/* Cute Nose */}
                    <ellipse cx="120" cy="124" rx="2" ry="1.5" fill="#ff31b9" stroke="#831843" strokeWidth="0.5" />

                    {/* Cheeks (Blushing) */}
                    <ellipse
                      cx="90"
                      cy="128"
                      rx="7"
                      ry="4.5"
                      fill="#ff31b9"
                      opacity={isBlushing || isLaughing || mood === "caring" || mood === "happy" ? 0.85 : 0.35}
                    />
                    <ellipse
                      cx="150"
                      cy="128"
                      rx="7"
                      ry="4.5"
                      fill="#ff31b9"
                      opacity={isBlushing || isLaughing || mood === "caring" || mood === "happy" ? 0.85 : 0.35}
                    />

                    {/* Mouth */}
                    {isSpeaking ? (
                      <motion.g
                        animate={{
                          scaleY: [0.6, 1.4, 0.8, 1.3, 0.6],
                          originY: "133px",
                        }}
                        transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut" }}
                      >
                        <ellipse cx="120" cy="133" rx="9" ry="7" fill="#831843" stroke="#240747" strokeWidth="2" />
                        <path d="M 114 129 Q 120 131 126 129" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="120" cy="136" rx="5" ry="3" fill="#ff31b9" />
                      </motion.g>
                    ) : isLaughing ? (
                      <motion.g
                        animate={{
                          scaleY: [1, 1.25, 0.95, 1.2, 1],
                          scaleX: [1, 1.08, 0.98, 1.05, 1],
                          originY: "133px",
                        }}
                        transition={{ repeat: Infinity, duration: 0.38, ease: "easeInOut" }}
                      >
                        <ellipse cx="120" cy="133" rx="10" ry="7.5" fill="#831843" stroke="#240747" strokeWidth="2" />
                        <path d="M 113 129 Q 120 131 127 129" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="120" cy="136" rx="6" ry="3.5" fill="#ff31b9" />
                      </motion.g>
                    ) : mood === "sassy" ? (
                      <path
                        d="M 112 131 Q 122 138 130 130"
                        stroke="#240747"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                      />
                    ) : mood === "playful" || mood === "happy" || activeAnim === "tickle" || activeAnim === "dance" ? (
                      <path
                        d="M 112 130 Q 120 140 128 130 Z"
                        fill="#ff31b9"
                        stroke="#240747"
                        strokeWidth="2"
                      />
                    ) : (
                      <path
                        d="M 114 131 Q 120 136 126 131"
                        stroke="#240747"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}
                  </g>

                  {/* 6. JESTER COLLAR */}
                  <g id="jester-collar" filter="url(#soft3DShadow)">
                    <path
                      d="M 72 155 Q 90 175 104 158 Q 120 178 136 158 Q 150 175 168 155 Q 155 178 120 178 Q 85 178 72 155 Z"
                      fill="#1b0533"
                      stroke="#ff31b9"
                      strokeWidth="2"
                    />
                    <circle cx="90" cy="172" r="5" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1" />
                    <circle cx="88" cy="170" r="1.5" fill="#ffffff" />
                    <circle cx="120" cy="175" r="6" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1" />
                    <circle cx="118" cy="173" r="2" fill="#ffffff" />
                    <circle cx="150" cy="172" r="5" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1" />
                    <circle cx="148" cy="170" r="1.5" fill="#ffffff" />
                  </g>

                  {/* 7. ARMS & HANDS (CLICKABLE HANDS TARGET) - FIRMLY ANCHORED TO SHOULDERS */}
                  <g
                    id="front-hands-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("hands");
                    }}
                  >
                    {/* Left Shoulder Base Anchor */}
                    <circle cx="82" cy="168" r="8" fill="url(#kuromi3DPurple)" stroke="#240747" strokeWidth="2.5" />

                    {/* Left Arm & Hand */}
                    <motion.g
                      style={{ transformOrigin: "82px 168px" }}
                      animate={{
                        rotate:
                          activeAnim === "wave"
                            ? [-10, 25, -10, 25, 0]
                            : activeAnim === "dance"
                            ? [-8, 15, -8]
                            : isWalking
                            ? [12, -12, 12]
                            : isSpeaking
                            ? [-6, 12, -6]
                            : isListening
                            ? [4, -4, 4]
                            : [0, 5, 0],
                      }}
                      transition={{
                        repeat: activeAnim === "wave" ? 0 : Infinity,
                        duration: activeAnim === "wave" ? 0.8 : isWalking ? 0.4 : isSpeaking ? 0.8 : 2.5,
                        ease: "easeInOut",
                      }}
                    >
                      {/* Left Arm Limb */}
                      <path
                        d="M 82 168 Q 62 176 56 186"
                        stroke="url(#kuromi3DPurple)"
                        strokeWidth="11"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M 82 168 Q 62 176 56 186"
                        stroke="#240747"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Left White Hand / Glove */}
                      <circle
                        cx="54"
                        cy="188"
                        r="8"
                        fill="#ffffff"
                        stroke="#240747"
                        strokeWidth="2"
                        filter={touchedPart === "hands" ? "url(#touchGlow)" : undefined}
                      />
                      <circle cx="58" cy="184" r="3.5" fill="#ffffff" stroke="#240747" strokeWidth="1.5" />

                      {mood === "teaching" && !isWalking && (
                        <g transform="translate(48, 178) rotate(-35)">
                          <line x1="0" y1="28" x2="0" y2="0" stroke="#ff31b9" strokeWidth="3.5" strokeLinecap="round" />
                          <polygon points="0,-8 2.5,-2 8,-2 3.5,2 5.5,7 0,4 -5.5,7 -3.5,2 -8,-2 -2.5,-2" fill="url(#gold3DGrad)" />
                        </g>
                      )}
                    </motion.g>

                    {/* Right Shoulder Base Anchor */}
                    <circle cx="158" cy="168" r="8" fill="url(#kuromi3DPurple)" stroke="#240747" strokeWidth="2.5" />

                    {/* Right Arm & Hand */}
                    <motion.g
                      style={{ transformOrigin: "158px 168px" }}
                      animate={{
                        rotate:
                          activeAnim === "wave"
                            ? [15, -25, 15, -25, 0]
                            : activeAnim === "dance"
                            ? [8, -15, 8]
                            : isWalking
                            ? [-12, 12, -12]
                            : isSpeaking
                            ? [10, -8, 10]
                            : isListening
                            ? [-4, 6, -4]
                            : [0, -5, 0],
                      }}
                      transition={{
                        repeat: activeAnim === "wave" ? 0 : Infinity,
                        duration: activeAnim === "wave" ? 0.8 : isWalking ? 0.4 : isSpeaking ? 0.75 : 2.5,
                        ease: "easeInOut",
                      }}
                    >
                      {/* Right Arm Limb */}
                      <path
                        d="M 158 168 Q 178 176 184 186"
                        stroke="url(#kuromi3DPurple)"
                        strokeWidth="11"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M 158 168 Q 178 176 184 186"
                        stroke="#240747"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Right White Hand / Glove */}
                      <circle
                        cx="186"
                        cy="188"
                        r="8"
                        fill="#ffffff"
                        stroke="#240747"
                        strokeWidth="2"
                        filter={touchedPart === "hands" ? "url(#touchGlow)" : undefined}
                      />
                      <circle cx="182" cy="184" r="3.5" fill="#ffffff" stroke="#240747" strokeWidth="1.5" />
                    </motion.g>
                  </g>
                </g>
              )}
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const KuromiAvatar = Kuromi3D;
