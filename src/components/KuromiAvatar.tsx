import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KuromiMood, KuromiWardrobeState } from "../types";
import { soundFX, speakKuromiText } from "../utils/speech";
import { getStoredWardrobe, DEFAULT_WARDROBE } from "../utils/storage";
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
  wardrobe?: KuromiWardrobeState;
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
  wardrobe: propWardrobe,
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

  // Active Wardrobe State
  const activeWardrobe = propWardrobe || getStoredWardrobe() || DEFAULT_WARDROBE;

  // Autonomous behavior states
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
  const [walkDirection, setWalkDirection] = useState<1 | -1>(1);
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
        const maxBound = 60;

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

  // ================= 30-GIÂY IDLE GIGGLE ENGINE =================
  useEffect(() => {
    const idleGiggleInterval = setInterval(() => {
      const timeSinceLastAction = Date.now() - lastInteractionTimeRef.current;
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

  // ================= 1. KUROMI TỰ HÀNH ĐỘNG =================
  useEffect(() => {
    if (!isAutonomousMode) return;

    const idleInterval = setInterval(() => {
      const timeSinceLastAction = Date.now() - lastInteractionTimeRef.current;
      if (timeSinceLastAction < 10000 || isSpeaking || isListening || isDragging || isLaughing) {
        return;
      }

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

    if (movement.type === "spin") {
      setRotationAngle((prev) => (prev + 360) % 360);
    } else if (movement.type === "walk") {
      setIsWalking(true);
      setTimeout(() => {
        setIsWalking(false);
      }, 4000);
    } else if (movement.type === "wink") {
      setIsWinking(true);
      setTimeout(() => setIsWinking(false), 1200);
    }

    if (movement.sound === "magic") soundFX.playMagicChime();
    else if (movement.sound === "giggle") soundFX.playCuteKuromiGiggle();
    else soundFX.playPop();

    setTimeout(() => {
      setActiveAnim(null);
      setActiveAutonomousMovement(null);
    }, 3500);
  };

  // Touch body part interaction
  const triggerBodyPartTouch = (part: KuromiBodyPart) => {
    lastInteractionTimeRef.current = Date.now();
    const reactions = KUROMI_BODY_REACTIONS[part];
    if (!reactions || reactions.length === 0) return;

    const randomIdx = Math.floor(Math.random() * reactions.length);
    const reaction = reactions[randomIdx];

    setTouchedPart(part);
    setActiveReaction(reaction);
    setActiveAutonomousMovement(null);
    setIsTapped(true);
    setActiveAnim(reaction.anim);

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
    stage: "w-44 h-52 sm:w-56 sm:h-64 md:w-60 md:h-72",
  }[size];

  // Normalized rotation 0-360
  const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
  // If angle is in the back half (90° to 270°), render the Back View
  const isBackView = normalizedAngle > 90 && normalizedAngle < 270;

  // Volumetric perspective angle calculation (prevents 0-width flat squishing / dẹp lép)
  const angleRad = (normalizedAngle * Math.PI) / 180;
  // Smooth horizontal parallax offset for facial features and ears
  const parallaxX = Math.sin(angleRad) * 8;
  // Clamped horizontal aspect to ensure Kuromi always maintains rounded plush proportions
  const visualScaleX = Math.max(0.85, Math.abs(Math.cos(angleRad)));
  // Subtle 3D tilt
  const tiltYDeg = Math.sin(angleRad) * 28;

  return (
    <div
      className="relative flex flex-col items-center select-none w-full max-w-[280px] mx-auto aspect-[240/280] justify-center"
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
        className="relative flex items-center justify-center transition-transform duration-75 w-full h-full"
        style={{
          transform: `translateX(${walkX}px) scaleX(${isWalking ? walkDirection : 1})`,
        }}
      >
        {/* Main 3D Rotatable Body */}
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
          className={`${containerSizes} relative cursor-grab active:cursor-grabbing filter drop-shadow-[0_15px_25px_rgba(147,51,234,0.45)] transition-transform shrink-0`}
          style={{
            perspective: 1000,
          }}
          title="Chạm vào Đầu, Má, Tay, Bụng, Chân hoặc Đuôi của Kuromi!"
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

          {/* Sparkles Particles */}
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

          {/* Volumetric Rotated Character Layer (Anti-Squish / Không bao giờ dẹp lép) */}
          <div
            className="w-full h-full relative z-10 transition-transform duration-75 flex items-center justify-center"
            style={{
              transform: `rotateY(${tiltYDeg}deg) scaleX(${visualScaleX})`,
              transformStyle: "preserve-3d",
            }}
          >
            <svg
              viewBox="0 0 240 280"
              className="w-full h-full object-contain"
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

                {/* Biker Leather Gradient */}
                <linearGradient id="bikerLeatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#27272a" />
                  <stop offset="50%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#09090b" />
                </linearGradient>

                {/* Chef Apron Gradient */}
                <linearGradient id="chefApronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#fdf2f8" />
                  <stop offset="100%" stopColor="#fbcfe8" />
                </linearGradient>

                {/* Romantic Dress Gradient */}
                <linearGradient id="romanticDressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#db2777" />
                  <stop offset="100%" stopColor="#9d174d" />
                </linearGradient>

                {/* Kimono Floral Gradient */}
                <linearGradient id="kimonoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="50%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#581c87" />
                </linearGradient>

                {/* Astronaut Suit Gradient */}
                <linearGradient id="astronautSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#bae6fd" />
                </linearGradient>

                {/* Fairy Wings/Dress Gradient */}
                <linearGradient id="fairyDressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>

                {/* Detective Tweed Gradient */}
                <linearGradient id="detectiveTweedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b45309" />
                  <stop offset="50%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>

                {/* Punk Rocker Gradient */}
                <linearGradient id="punkRockerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#701a75" />
                  <stop offset="100%" stopColor="#18181b" />
                </linearGradient>

                {/* Magical Girl Gradient */}
                <linearGradient id="magicalGirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#6b21a8" />
                </linearGradient>

                {/* Mermaid Scale Gradient */}
                <linearGradient id="mermaidScaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>

                {/* Doctor Blouse Gradient */}
                <linearGradient id="doctorBlouseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#f0fdfa" />
                  <stop offset="100%" stopColor="#99f6e4" />
                </linearGradient>

                {/* Artist Smock Gradient */}
                <linearGradient id="artistSmockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="50%" stopColor="#fde047" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>

                {/* Superhero Armor Gradient */}
                <linearGradient id="heroArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="50%" stopColor="#7e22ce" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>

                {/* Pajama Soft Gradient */}
                <linearGradient id="pajamaSoftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e9d5ff" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>

                {/* Sailor Uniform Gradient */}
                <linearGradient id="sailorUniformGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>

                {/* Winter Snow Coat Gradient */}
                <linearGradient id="winterCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e0f2fe" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>

                {/* Ninja Shinobi Gradient */}
                <linearGradient id="ninjaShinobiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b0764" />
                  <stop offset="50%" stopColor="#18181b" />
                  <stop offset="100%" stopColor="#09090b" />
                </linearGradient>

                {/* Sports Jersey Gradient */}
                <linearGradient id="sportsJerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#7c2d12" />
                </linearGradient>

                {/* Circus Ringmaster Gradient */}
                <linearGradient id="ringmasterCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="50%" stopColor="#991b1b" />
                  <stop offset="100%" stopColor="#450a0a" />
                </linearGradient>

                {/* Flower Fairy Gradient */}
                <linearGradient id="flowerFairyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>

                {/* Cyberpunk Gradient */}
                <linearGradient id="cyberpunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* Baker Apron Gradient */}
                <linearGradient id="bakerApronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#ffe4e6" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>

                {/* Royal Queen Velvet Gradient */}
                <linearGradient id="royalQueenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7e22ce" />
                  <stop offset="50%" stopColor="#581c87" />
                  <stop offset="100%" stopColor="#2e1065" />
                </linearGradient>

                {/* Rainbow Gradient */}
                <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="20%" stopColor="#fb923c" />
                  <stop offset="40%" stopColor="#facc15" />
                  <stop offset="60%" stopColor="#4ade80" />
                  <stop offset="80%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>

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
                  BACK VIEW: Rendered when 90° < angle < 270°
                  ======================================================== */}
              {isBackView ? (
                <g id="kuromi-3d-back-view">
                  {/* 1. DEVIL TAIL (FIRMLY ROOTED INTO LOWER BACK) */}
                  <g
                    id="devil-tail-target-back"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("tail");
                    }}
                  >
                    {/* Tail Root Joint attached to spine */}
                    <circle cx="120" cy="206" r="6" fill="#130324" />
                    <motion.g
                      animate={{
                        rotate:
                          activeAnim === "tail_flick"
                            ? [-25, 30, -25, 30, -10, 0]
                            : [0, 15, -15, 0],
                        originX: "120px",
                        originY: "206px",
                      }}
                      transition={{
                        repeat: activeAnim === "tail_flick" ? 0 : Infinity,
                        duration: activeAnim === "tail_flick" ? 0.6 : 1.8,
                        ease: "easeInOut",
                      }}
                      filter={touchedPart === "tail" ? "url(#touchGlow)" : undefined}
                    >
                      {/* Seamless Tail Curve rooted at lower spine */}
                      <path
                        d="M 120 206 Q 165 215 185 185 Q 200 160 180 140 Q 165 125 178 110"
                        stroke="#130324"
                        strokeWidth="7"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Devil Arrow Spade */}
                      <polygon
                        points="178,100 162,118 194,118"
                        fill="url(#pink3DGrad)"
                        stroke="#831843"
                        strokeWidth="1.5"
                        filter="url(#soft3DShadow)"
                      />
                    </motion.g>
                  </g>

                  {/* 2. BACK FEET & LEGS */}
                  <g
                    id="back-feet-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("feet");
                    }}
                  >
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

                  {/* 3. BACK OF BODY & OUTFIT */}
                  <g
                    id="back-body-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("belly");
                    }}
                  >
                    {/* Back Torso Base */}
                    <path
                      d="M 85 160 Q 75 225 120 228 Q 165 225 155 160 Z"
                      fill="url(#kuromi3DPurple)"
                      stroke="#240747"
                      strokeWidth="3"
                    />

                    {/* Back Outfit Customization */}
                    {activeWardrobe.outfit === "biker_leader" && (
                      <g>
                        <path d="M 86 162 Q 78 220 120 224 Q 162 220 154 162 Z" fill="url(#bikerLeatherGrad)" stroke="#ff31b9" strokeWidth="2" />
                        <text x="120" y="195" textAnchor="middle" fill="#ff31b9" fontSize="11" fontWeight="bold" fontFamily="sans-serif">K5</text>
                        <circle cx="120" cy="180" r="4" fill="#ffffff" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "master_chef" && (
                      <g>
                        <path d="M 90 165 Q 85 220 120 222 Q 155 220 150 165 Z" fill="url(#chefApronGrad)" stroke="#f472b6" strokeWidth="1.5" />
                        <line x1="95" y1="175" x2="145" y2="175" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "romantic_lady" && (
                      <g>
                        <path d="M 84 165 Q 70 230 120 232 Q 170 230 156 165 Z" fill="url(#romanticDressGrad)" stroke="#fda4af" strokeWidth="2" />
                        <circle cx="120" cy="195" r="6" fill="#f43f5e" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "smart_sensei" && (
                      <g>
                        <path d="M 82 162 Q 120 185 158 162 L 154 212 Q 120 222 86 212 Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                        <polygon points="120,188 122,194 128,194 123,198 125,204 120,200 115,204 117,198 112,194 118,194" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="0.8" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "sakura_kimono" && (
                      <g>
                        <path d="M 85 160 Q 72 226 120 228 Q 168 226 155 160 Z" fill="url(#kimonoGrad)" stroke="#fbcfe8" strokeWidth="2" />
                        <rect x="94" y="180" width="52" height="18" rx="4" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="1.5" />
                        <circle cx="120" cy="189" r="6" fill="#ec4899" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "space_astronaut" && (
                      <g>
                        <path d="M 85 162 Q 74 224 120 226 Q 166 224 155 162 Z" fill="url(#astronautSuitGrad)" stroke="#38bdf8" strokeWidth="2" />
                        {/* Oxygen Tank on Back */}
                        <rect x="100" y="172" width="40" height="42" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                        <circle cx="112" cy="182" r="3" fill="#a78bfa" />
                        <circle cx="128" cy="182" r="3" fill="#a78bfa" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "fairy_princess" && (
                      <g>
                        <path d="M 84 164 Q 68 230 120 234 Q 172 230 156 164 Z" fill="url(#fairyDressGrad)" stroke="#f472b6" strokeWidth="2" />
                        {/* Fairy Wings on Back */}
                        <path d="M 120 175 Q 80 145 65 170 Q 80 195 120 185" fill="#f472b6" fillOpacity="0.75" stroke="#ffffff" strokeWidth="1.5" />
                        <path d="M 120 175 Q 160 145 175 170 Q 160 195 120 185" fill="#f472b6" fillOpacity="0.75" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "detective_sherlock" && (
                      <g>
                        <path d="M 82 162 Q 70 228 120 230 Q 170 228 158 162 Z" fill="url(#detectiveTweedGrad)" stroke="#d97706" strokeWidth="2" />
                        <line x1="120" y1="165" x2="120" y2="225" stroke="#451a03" strokeWidth="2" strokeDasharray="3,3" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "punk_rocker" && (
                      <g>
                        <path d="M 85 162 Q 76 222 120 226 Q 164 222 155 162 Z" fill="url(#punkRockerGrad)" stroke="#ff31b9" strokeWidth="2" />
                        <text x="120" y="196" textAnchor="middle" fill="#ff77cf" fontSize="13" fontWeight="900" fontFamily="sans-serif">ROCK</text>
                      </g>
                    )}
                    {activeWardrobe.outfit === "magical_girl" && (
                      <g>
                        <path d="M 84 162 Q 68 230 120 234 Q 172 230 156 162 Z" fill="url(#magicalGirlGrad)" stroke="#f43f5e" strokeWidth="2" />
                        <circle cx="120" cy="190" r="7" fill="#fbcfe8" stroke="#f43f5e" strokeWidth="1.5" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "ocean_mermaid" && (
                      <g>
                        <path d="M 88 165 Q 80 225 120 228 Q 160 225 152 165 Z" fill="url(#mermaidScaleGrad)" stroke="#2dd4bf" strokeWidth="2" />
                        <circle cx="120" cy="195" r="5" fill="#f0fdfa" stroke="#2dd4bf" strokeWidth="1" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "doctor_nurse" && (
                      <g>
                        <path d="M 85 162 Q 76 224 120 226 Q 164 224 155 162 Z" fill="url(#doctorBlouseGrad)" stroke="#38bdf8" strokeWidth="2" />
                        {/* Red Cross / Heart Badge on back */}
                        <circle cx="120" cy="192" r="7" fill="#ef4444" />
                        <line x1="120" y1="188" x2="120" y2="196" stroke="#ffffff" strokeWidth="2" />
                        <line x1="116" y1="192" x2="124" y2="192" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "artist_painter" && (
                      <g>
                        <path d="M 88 165 Q 80 224 120 226 Q 160 224 152 165 Z" fill="url(#artistSmockGrad)" stroke="#f97316" strokeWidth="2" />
                        <circle cx="108" cy="195" r="4" fill="#3b82f6" />
                        <circle cx="128" cy="190" r="4.5" fill="#ec4899" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "super_heroine" && (
                      <g>
                        <path d="M 85 162 Q 76 224 120 226 Q 164 224 155 162 Z" fill="url(#heroArmorGrad)" stroke="#fbbf24" strokeWidth="2" />
                        {/* Superhero Hero Cape on Back */}
                        <path d="M 92 165 Q 120 175 148 165 L 155 228 Q 120 236 85 228 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="1.5" />
                        <polygon points="120,188 123,195 130,195 125,199 127,206 120,202 113,206 115,199 110,195 117,195" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "cosy_pajamas" && (
                      <g>
                        <path d="M 84 162 Q 74 226 120 228 Q 166 226 156 162 Z" fill="url(#pajamaSoftGrad)" stroke="#c084fc" strokeWidth="2" />
                        <path d="M 115 185 A 8 8 0 0 0 125 198 A 10 10 0 0 1 115 185 Z" fill="#facc15" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "sailor_school" && (
                      <g>
                        <path d="M 85 160 Q 75 225 120 228 Q 165 225 155 160 Z" fill="url(#sailorUniformGrad)" stroke="#60a5fa" strokeWidth="2" />
                        {/* Sailor Back Flap */}
                        <rect x="94" y="162" width="52" height="24" rx="2" fill="#1e40af" stroke="#ffffff" strokeWidth="1.5" />
                        <line x1="97" y1="182" x2="143" y2="182" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "winter_snow" && (
                      <g>
                        <path d="M 82 162 Q 70 230 120 234 Q 170 230 158 162 Z" fill="url(#winterCoatGrad)" stroke="#bae6fd" strokeWidth="2" />
                        <rect x="80" y="222" width="80" height="12" rx="4" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.5" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "ninja_shadow" && (
                      <g>
                        <path d="M 85 160 Q 76 225 120 226 Q 164 225 155 160 Z" fill="url(#ninjaShinobiGrad)" stroke="#a855f7" strokeWidth="2" />
                        <line x1="90" y1="190" x2="150" y2="190" stroke="#ff31b9" strokeWidth="2.5" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "sports_champion" && (
                      <g>
                        <path d="M 85 162 Q 76 224 120 226 Q 164 224 155 162 Z" fill="url(#sportsJerseyGrad)" stroke="#f97316" strokeWidth="2" />
                        <text x="120" y="200" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="sans-serif">10</text>
                      </g>
                    )}
                    {activeWardrobe.outfit === "circus_ringmaster" && (
                      <g>
                        <path d="M 84 162 Q 70 230 120 232 Q 170 230 156 162 Z" fill="url(#ringmasterCoatGrad)" stroke="#facc15" strokeWidth="2" />
                        <line x1="120" y1="165" x2="120" y2="230" stroke="#facc15" strokeWidth="2" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "flower_fairy" && (
                      <g>
                        <path d="M 84 162 Q 68 230 120 234 Q 172 230 156 162 Z" fill="url(#flowerFairyGrad)" stroke="#f472b6" strokeWidth="2" />
                        <circle cx="120" cy="195" r="6" fill="#f43f5e" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "cyber_punk2077" && (
                      <g>
                        <path d="M 85 162 Q 76 224 120 226 Q 164 224 155 162 Z" fill="url(#cyberpunkGrad)" stroke="#10b981" strokeWidth="2" />
                        <line x1="90" y1="185" x2="150" y2="185" stroke="#06b6d4" strokeWidth="2" />
                        <line x1="120" y1="165" x2="120" y2="225" stroke="#10b981" strokeWidth="2" strokeDasharray="4,2" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "baker_pastry" && (
                      <g>
                        <path d="M 90 165 Q 82 222 120 224 Q 158 222 150 165 Z" fill="url(#bakerApronGrad)" stroke="#f43f5e" strokeWidth="1.5" />
                        <circle cx="110" cy="195" r="3" fill="#3b82f6" />
                        <circle cx="130" cy="195" r="3" fill="#facc15" />
                        <circle cx="120" cy="185" r="3.5" fill="#ec4899" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "royal_queen" && (
                      <g>
                        <path d="M 82 162 Q 66 230 120 234 Q 174 230 158 162 Z" fill="url(#royalQueenGrad)" stroke="#facc15" strokeWidth="2" />
                        {/* Royal Cape Trim */}
                        <path d="M 80 162 L 160 162" stroke="#ffffff" strokeWidth="4" />
                        <polygon points="120,188 123,195 130,195 125,199 127,206 120,202 113,206 115,199 110,195 117,195" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="0.8" />
                      </g>
                    )}
                    {activeWardrobe.outfit === "rainbow_unicorn" && (
                      <g>
                        <path d="M 84 162 Q 68 230 120 234 Q 172 230 156 162 Z" fill="url(#rainbowGrad)" stroke="#ffffff" strokeWidth="2" />
                        <polygon points="120,188 123,195 130,195 125,199 127,206 120,202 113,206 115,199 110,195 117,195" fill="#ffffff" stroke="#f472b6" strokeWidth="0.8" />
                      </g>
                    )}

                    {/* Back Arms */}
                    <path d="M 82 168 Q 62 176 56 186" stroke="url(#kuromi3DPurple)" strokeWidth="11" strokeLinecap="round" fill="none" />
                    <circle cx="54" cy="188" r="8" fill="#ffffff" stroke="#240747" strokeWidth="2" />
                    <path d="M 158 168 Q 178 176 184 186" stroke="url(#kuromi3DPurple)" strokeWidth="11" strokeLinecap="round" fill="none" />
                    <circle cx="186" cy="188" r="8" fill="#ffffff" stroke="#240747" strokeWidth="2" />
                  </g>

                  {/* 4. BACK OF HEAD & EARS */}
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
                  {/* 1. FRONT DEVIL TAIL (FIRMLY ROOTED INTO LOWER BODY HIP) */}
                  <g
                    id="front-tail-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("tail");
                    }}
                  >
                    {/* Root connector behind right hip */}
                    <circle cx="136" cy="202" r="6" fill="#130324" />
                    <motion.g
                      animate={{
                        rotate:
                          activeAnim === "tail_flick"
                            ? [-25, 30, -25, 30, -10, 0]
                            : [0, 15, -15, 0],
                        originX: "136px",
                        originY: "202px",
                      }}
                      transition={{
                        repeat: activeAnim === "tail_flick" ? 0 : Infinity,
                        duration: activeAnim === "tail_flick" ? 0.6 : 1.8,
                        ease: "easeInOut",
                      }}
                      filter={touchedPart === "tail" ? "url(#touchGlow)" : undefined}
                    >
                      {/* Tail path tightly anchored to body */}
                      <path
                        d="M 136 202 Q 175 210 195 185 Q 210 160 192 140 Q 182 128 194 112"
                        stroke="#130324"
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <polygon
                        points="194,102 180,120 208,120"
                        fill="url(#pink3DGrad)"
                        stroke="#831843"
                        strokeWidth="1.5"
                        filter="url(#soft3DShadow)"
                      />
                    </motion.g>
                  </g>

                  {/* 2. FEET & SHOES */}
                  <g
                    id="front-feet-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("feet");
                    }}
                  >
                    {/* Left Leg */}
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
                    </motion.g>

                    {/* Right Leg */}
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
                    </motion.g>
                  </g>

                  {/* 3. TORSO & BELLY */}
                  <g
                    id="front-belly-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("belly");
                    }}
                  >
                    {/* Base Body Torso */}
                    <path
                      d="M 85 160 Q 75 225 120 228 Q 165 225 155 160 Z"
                      fill="url(#kuromi3DPurple)"
                      stroke="#240747"
                      strokeWidth="3"
                    />

                    {/* White Porcelain Belly Oval */}
                    <ellipse
                      cx="120"
                      cy="198"
                      rx="26"
                      ry="22"
                      fill="url(#face3DGrad)"
                      stroke="#c084fc"
                      strokeWidth="1.5"
                      filter={touchedPart === "belly" ? "url(#touchGlow)" : undefined}
                    />

                    {/* Custom Wardrobe Outfits */}
                    {activeWardrobe.outfit === "biker_leader" && (
                      <g>
                        <path d="M 86 162 Q 78 220 120 224 Q 162 220 154 162 Z" fill="url(#bikerLeatherGrad)" stroke="#ff31b9" strokeWidth="2" />
                        {/* Silver Zipper */}
                        <line x1="120" y1="165" x2="120" y2="220" stroke="#e4e4e7" strokeWidth="2.5" strokeDasharray="3,2" />
                        {/* Silver Studs */}
                        <circle cx="95" cy="180" r="2.5" fill="#ffffff" stroke="#71717a" strokeWidth="1" />
                        <circle cx="145" cy="180" r="2.5" fill="#ffffff" stroke="#71717a" strokeWidth="1" />
                        <circle cx="98" cy="205" r="2.5" fill="#ffffff" stroke="#71717a" strokeWidth="1" />
                        <circle cx="142" cy="205" r="2.5" fill="#ffffff" stroke="#71717a" strokeWidth="1" />
                        <path d="M 104 165 L 120 180 L 136 165" stroke="#ff31b9" strokeWidth="2.5" fill="none" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "master_chef" && (
                      <g>
                        {/* White/Pink Chef Apron */}
                        <path d="M 94 165 L 146 165 L 148 222 Q 120 226 92 222 Z" fill="url(#chefApronGrad)" stroke="#f472b6" strokeWidth="2" />
                        {/* Apron Pocket */}
                        <rect x="106" y="195" width="28" height="20" rx="3" fill="#ffffff" stroke="#f43f5e" strokeWidth="1.5" />
                        {/* Mini Skillet / Heart Badge */}
                        <circle cx="120" cy="203" r="4" fill="#fb7185" />
                        <line x1="120" y1="203" x2="125" y2="199" stroke="#881337" strokeWidth="1.5" strokeLinecap="round" />
                        {/* Chef Red Scarf Necktie */}
                        <polygon points="120,165 114,178 126,178" fill="#f43f5e" stroke="#881337" strokeWidth="1" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "romantic_lady" && (
                      <g>
                        {/* Tiered Frilly Victorian Dress */}
                        <path d="M 84 165 Q 68 230 120 234 Q 172 230 156 165 Z" fill="url(#romanticDressGrad)" stroke="#fda4af" strokeWidth="2" />
                        {/* Frill Waves */}
                        <path d="M 76 215 Q 98 225 120 215 Q 142 225 164 215" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <path d="M 82 228 Q 101 236 120 228 Q 139 236 158 228" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        {/* Red Rose Corsage */}
                        <circle cx="120" cy="178" r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="120" cy="178" r="2.5" fill="#fda4af" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "smart_sensei" && (
                      <g>
                        {/* Academic Scholar Capelet */}
                        <path d="M 80 162 Q 120 185 160 162 L 155 210 Q 120 220 85 210 Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                        {/* Scholar Golden Star Medallion */}
                        <polygon points="120,188 122,194 128,194 123,198 125,204 120,200 115,204 117,198 112,194 118,194" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="0.8" />
                        {/* Necktie */}
                        <polygon points="120,165 116,182 124,182" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "sakura_kimono" && (
                      <g>
                        {/* Kimono Robe */}
                        <path d="M 84 160 Q 72 226 120 228 Q 168 226 156 160 Z" fill="url(#kimonoGrad)" stroke="#fbcfe8" strokeWidth="2" />
                        {/* Cross Collar Wrap */}
                        <path d="M 95 160 L 120 185 L 145 160" stroke="#fbcfe8" strokeWidth="3" fill="none" />
                        {/* Golden Obi Sash */}
                        <rect x="92" y="186" width="56" height="18" rx="3" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="1.5" />
                        <line x1="92" y1="195" x2="148" y2="195" stroke="#be185d" strokeWidth="2" />
                        <circle cx="120" cy="195" r="4" fill="#f43f5e" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "space_astronaut" && (
                      <g>
                        <path d="M 84 162 Q 74 224 120 226 Q 166 224 156 162 Z" fill="url(#astronautSuitGrad)" stroke="#38bdf8" strokeWidth="2" />
                        <rect x="104" y="180" width="32" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                        <circle cx="112" cy="192" r="3" fill="#22c55e" />
                        <circle cx="120" cy="192" r="3" fill="#eab308" />
                        <circle cx="128" cy="192" r="3" fill="#ef4444" />
                        <line x1="90" y1="172" x2="150" y2="172" stroke="#a855f7" strokeWidth="2.5" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "fairy_princess" && (
                      <g>
                        <path d="M 84 164 Q 68 230 120 234 Q 172 230 156 164 Z" fill="url(#fairyDressGrad)" stroke="#f472b6" strokeWidth="2" />
                        {/* Translucent Wings */}
                        <path d="M 84 175 Q 50 145 35 170 Q 55 195 85 185" fill="#f472b6" fillOpacity="0.8" stroke="#ffffff" strokeWidth="1.5" />
                        <path d="M 156 175 Q 190 145 205 170 Q 185 195 155 185" fill="#f472b6" fillOpacity="0.8" stroke="#ffffff" strokeWidth="1.5" />
                        {/* Glitter Hem */}
                        <path d="M 76 218 Q 98 226 120 218 Q 142 226 164 218" stroke="#fef08a" strokeWidth="3" strokeDasharray="4,2" fill="none" />
                        <polygon points="120,174 122,180 128,180 123,184 125,190 120,186 115,190 117,184 112,180 118,180" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "detective_sherlock" && (
                      <g>
                        <path d="M 82 162 Q 70 228 120 230 Q 170 228 158 162 Z" fill="url(#detectiveTweedGrad)" stroke="#d97706" strokeWidth="2" />
                        {/* Plaid Grid Pattern Lines */}
                        <line x1="88" y1="185" x2="152" y2="185" stroke="#fde68a" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="84" y1="205" x2="156" y2="205" stroke="#fde68a" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="105" y1="165" x2="105" y2="225" stroke="#fde68a" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="135" y1="165" x2="135" y2="225" stroke="#fde68a" strokeWidth="1" strokeDasharray="3,3" />
                        {/* Lapels */}
                        <polygon points="100,162 120,185 106,192" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                        <polygon points="140,162 120,185 134,192" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                        {/* Sherlock Pipe / Buttons */}
                        <circle cx="120" cy="200" r="3" fill="#fde68a" stroke="#78350f" strokeWidth="1" />
                        <circle cx="120" cy="214" r="3" fill="#fde68a" stroke="#78350f" strokeWidth="1" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "punk_rocker" && (
                      <g>
                        <path d="M 85 162 Q 76 222 120 226 Q 164 222 155 162 Z" fill="url(#punkRockerGrad)" stroke="#ff31b9" strokeWidth="2" />
                        <path d="M 98 175 L 142 195" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="2,2" />
                        <polygon points="120,172 124,182 135,182 126,188 130,198 120,192 110,198 114,188 105,182 116,182" fill="#ff31b9" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="95" cy="190" r="3" fill="#e4e4e7" />
                        <circle cx="145" cy="190" r="3" fill="#e4e4e7" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "magical_girl" && (
                      <g>
                        <path d="M 84 162 Q 68 230 120 234 Q 172 230 156 162 Z" fill="url(#magicalGirlGrad)" stroke="#f43f5e" strokeWidth="2" />
                        {/* Big Magenta Bow */}
                        <polygon points="120,175 102,168 108,185" fill="#f43f5e" stroke="#881337" strokeWidth="1" />
                        <polygon points="120,175 138,168 132,185" fill="#f43f5e" stroke="#881337" strokeWidth="1" />
                        <circle cx="120" cy="175" r="5" fill="#fde047" stroke="#b45309" strokeWidth="1" />
                        <path d="M 78 220 Q 120 236 162 220" stroke="#fbcfe8" strokeWidth="3" fill="none" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "ocean_mermaid" && (
                      <g>
                        <path d="M 86 165 Q 78 226 120 230 Q 162 226 154 165 Z" fill="url(#mermaidScaleGrad)" stroke="#2dd4bf" strokeWidth="2" />
                        {/* Seashell Bra & Pearls */}
                        <path d="M 104 175 C 98 170 94 185 106 185 C 114 185 110 170 104 175 Z" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
                        <path d="M 136 175 C 130 170 126 185 138 185 C 146 185 142 170 136 175 Z" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
                        {/* Shimmering scales */}
                        <path d="M 100 200 Q 110 206 120 200 Q 130 206 140 200" stroke="#ccfbf1" strokeWidth="2" fill="none" />
                        <path d="M 105 214 Q 120 220 135 214" stroke="#ccfbf1" strokeWidth="2" fill="none" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "doctor_nurse" && (
                      <g>
                        <path d="M 85 162 Q 76 224 120 226 Q 164 224 155 162 Z" fill="url(#doctorBlouseGrad)" stroke="#38bdf8" strokeWidth="2" />
                        {/* Lapel & Stethoscope */}
                        <path d="M 100 162 Q 108 190 120 190 Q 132 190 140 162" stroke="#64748b" strokeWidth="2.5" fill="none" />
                        <circle cx="120" cy="195" r="5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
                        {/* Red Heart Cross Badge */}
                        <rect x="94" y="196" width="16" height="14" rx="2" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />
                        <line x1="102" y1="198" x2="102" y2="208" stroke="#ef4444" strokeWidth="2" />
                        <line x1="97" y1="203" x2="107" y2="203" stroke="#ef4444" strokeWidth="2" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "artist_painter" && (
                      <g>
                        <path d="M 88 165 Q 80 224 120 226 Q 160 224 152 165 Z" fill="url(#artistSmockGrad)" stroke="#f97316" strokeWidth="2" />
                        {/* Big Front Smock Pocket with Brushes */}
                        <rect x="100" y="195" width="40" height="22" rx="3" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
                        {/* Colorful Paint Splatters */}
                        <circle cx="106" cy="178" r="3.5" fill="#3b82f6" />
                        <circle cx="132" cy="176" r="4" fill="#ef4444" />
                        <circle cx="112" cy="206" r="3" fill="#22c55e" />
                        <circle cx="128" cy="205" r="3.5" fill="#ec4899" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "super_heroine" && (
                      <g>
                        <path d="M 85 162 Q 76 224 120 226 Q 164 224 155 162 Z" fill="url(#heroArmorGrad)" stroke="#fbbf24" strokeWidth="2" />
                        {/* Superhero Lightning Emblem */}
                        <polygon points="122,175 112,192 119,192 115,206 128,188 121,188" fill="#fde047" stroke="#b45309" strokeWidth="1" />
                        {/* Golden Hero Belt */}
                        <rect x="92" y="210" width="56" height="8" rx="2" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="1" />
                        <circle cx="120" cy="214" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "cosy_pajamas" && (
                      <g>
                        <path d="M 84 162 Q 74 226 120 228 Q 166 226 156 162 Z" fill="url(#pajamaSoftGrad)" stroke="#c084fc" strokeWidth="2" />
                        {/* Crescent Moon Emblem */}
                        <path d="M 116 182 A 7 7 0 0 0 124 195 A 9 9 0 0 1 116 182 Z" fill="#facc15" stroke="#eab308" strokeWidth="0.8" />
                        {/* Fluffy Clouds & Buttons */}
                        <circle cx="120" cy="204" r="3" fill="#ffffff" stroke="#c084fc" strokeWidth="1" />
                        <circle cx="120" cy="216" r="3" fill="#ffffff" stroke="#c084fc" strokeWidth="1" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "sailor_school" && (
                      <g>
                        <path d="M 85 160 Q 75 225 120 228 Q 165 225 155 160 Z" fill="url(#sailorUniformGrad)" stroke="#60a5fa" strokeWidth="2" />
                        {/* White Sailor V-Collar */}
                        <polygon points="120,195 94,162 146,162" fill="#ffffff" stroke="#1e40af" strokeWidth="1.5" />
                        {/* Red Sailor Bow */}
                        <polygon points="120,185 110,196 130,196" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
                        <circle cx="120" cy="186" r="3.5" fill="#facc15" />
                        {/* Pleated Skirt Trim */}
                        <line x1="84" y1="220" x2="156" y2="220" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "winter_snow" && (
                      <g>
                        <path d="M 82 162 Q 70 230 120 234 Q 170 230 158 162 Z" fill="url(#winterCoatGrad)" stroke="#bae6fd" strokeWidth="2" />
                        {/* White Fur Collar & Hem */}
                        <rect x="90" y="160" width="60" height="12" rx="6" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.5" />
                        <rect x="80" y="222" width="80" height="12" rx="4" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.5" />
                        {/* Snowflake buttons */}
                        <circle cx="120" cy="186" r="3.5" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                        <circle cx="120" cy="204" r="3.5" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "ninja_shadow" && (
                      <g>
                        <path d="M 85 160 Q 76 225 120 226 Q 164 225 155 160 Z" fill="url(#ninjaShinobiGrad)" stroke="#a855f7" strokeWidth="2" />
                        {/* Cross Sash */}
                        <line x1="90" y1="162" x2="150" y2="220" stroke="#ff31b9" strokeWidth="3" />
                        <line x1="150" y1="162" x2="90" y2="220" stroke="#ff31b9" strokeWidth="3" />
                        {/* Shuriken Star Badge */}
                        <polygon points="120,184 123,191 130,191 124,195 127,202 120,197 113,202 116,195 110,191 117,191" fill="#e4e4e7" stroke="#71717a" strokeWidth="0.8" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "sports_champion" && (
                      <g>
                        <path d="M 85 162 Q 76 224 120 226 Q 164 224 155 162 Z" fill="url(#sportsJerseyGrad)" stroke="#f97316" strokeWidth="2" />
                        {/* Athletic Stripes & Number 10 */}
                        <line x1="90" y1="172" x2="150" y2="172" stroke="#ffffff" strokeWidth="2.5" />
                        <text x="120" y="205" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="sans-serif">10</text>
                      </g>
                    )}

                    {activeWardrobe.outfit === "circus_ringmaster" && (
                      <g>
                        <path d="M 84 162 Q 70 230 120 232 Q 170 230 156 162 Z" fill="url(#ringmasterCoatGrad)" stroke="#facc15" strokeWidth="2" />
                        {/* Gold Frogging Embroidery */}
                        <line x1="100" y1="180" x2="140" y2="180" stroke="#facc15" strokeWidth="2.5" />
                        <line x1="98" y1="195" x2="142" y2="195" stroke="#facc15" strokeWidth="2.5" />
                        <line x1="100" y1="210" x2="140" y2="210" stroke="#facc15" strokeWidth="2.5" />
                        <circle cx="102" cy="180" r="3" fill="#fef08a" />
                        <circle cx="138" cy="180" r="3" fill="#fef08a" />
                        <circle cx="100" cy="195" r="3" fill="#fef08a" />
                        <circle cx="140" cy="195" r="3" fill="#fef08a" />
                        <circle cx="102" cy="210" r="3" fill="#fef08a" />
                        <circle cx="138" cy="210" r="3" fill="#fef08a" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "flower_fairy" && (
                      <g>
                        <path d="M 84 162 Q 68 230 120 234 Q 172 230 156 162 Z" fill="url(#flowerFairyGrad)" stroke="#f472b6" strokeWidth="2" />
                        {/* Tulip Petals Pattern */}
                        <path d="M 105 180 Q 120 168 135 180 Q 120 195 105 180 Z" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="120" cy="182" r="3" fill="#fde047" />
                        <path d="M 76 220 Q 98 228 120 220 Q 142 228 164 220" stroke="#86efac" strokeWidth="3" fill="none" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "cyber_punk2077" && (
                      <g>
                        <path d="M 85 162 Q 76 224 120 226 Q 164 224 155 162 Z" fill="url(#cyberpunkGrad)" stroke="#10b981" strokeWidth="2" />
                        {/* Cyber Glowing Circuits */}
                        <polyline points="94,175 110,175 116,192 135,192" fill="none" stroke="#06b6d4" strokeWidth="2" />
                        <polyline points="146,175 130,175 124,192 105,192" fill="none" stroke="#10b981" strokeWidth="2" />
                        <circle cx="120" cy="208" r="4" fill="#a855f7" stroke="#06b6d4" strokeWidth="1" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "baker_pastry" && (
                      <g>
                        <path d="M 90 165 Q 82 222 120 224 Q 158 222 150 165 Z" fill="url(#bakerApronGrad)" stroke="#f43f5e" strokeWidth="1.5" />
                        {/* Cupcake Emblem on pocket */}
                        <rect x="104" y="194" width="32" height="20" rx="3" fill="#ffffff" stroke="#f472b6" strokeWidth="1" />
                        <path d="M 112 205 L 128 205 L 125 211 L 115 211 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
                        <path d="M 110 205 Q 120 196 130 205 Z" fill="#ec4899" />
                        <circle cx="120" cy="198" r="2" fill="#ef4444" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "royal_queen" && (
                      <g>
                        <path d="M 82 162 Q 66 230 120 234 Q 174 230 158 162 Z" fill="url(#royalQueenGrad)" stroke="#facc15" strokeWidth="2" />
                        {/* Ermine Fur Collar & Royal Gem */}
                        <rect x="88" y="160" width="64" height="12" rx="4" fill="#ffffff" stroke="#facc15" strokeWidth="1.5" />
                        <polygon points="120,185 124,193 133,193 126,198 129,206 120,201 111,206 114,198 107,193 116,193" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="0.8" />
                        <circle cx="120" cy="194" r="3" fill="#ef4444" />
                      </g>
                    )}

                    {activeWardrobe.outfit === "rainbow_unicorn" && (
                      <g>
                        <path d="M 84 162 Q 68 230 120 234 Q 172 230 156 162 Z" fill="url(#rainbowGrad)" stroke="#ffffff" strokeWidth="2" />
                        {/* Rainbow Magic Star */}
                        <polygon points="120,176 123,184 132,184 125,189 128,197 120,192 112,197 115,189 108,184 117,184" fill="#ffffff" stroke="#ec4899" strokeWidth="1" />
                        <path d="M 76 220 Q 98 228 120 220 Q 142 228 164 220" stroke="#ffffff" strokeWidth="3" fill="none" />
                      </g>
                    )}
                  </g>

                  {/* 4. HEAD, EARS & JESTER HOOD */}
                  <g
                    id="front-head-target"
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
                    <circle cx="30" cy="18" r="2" fill="#ffffff" />

                    {/* Right Ear */}
                    <path
                      d="M 155 95 C 175 65 210 45 208 20 C 190 18 155 45 138 75 Z"
                      fill="url(#ear3DGrad)"
                      stroke="#240747"
                      strokeWidth="3"
                      filter={touchedPart === "head" ? "url(#touchGlow)" : undefined}
                    />
                    <circle cx="208" cy="20" r="7" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />
                    <circle cx="206" cy="18" r="2" fill="#ffffff" />

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

                    {/* Custom Headwear Rendering */}
                    {activeWardrobe.headwear === "pink_skull" && (
                      <g id="forehead-pink-skull">
                        <circle cx="120" cy="80" r="9" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.2" />
                        <path d="M 115 85 L 115 88 L 125 88 L 125 85 Z" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1" />
                        <circle cx="117" cy="80" r="2" fill="#240747" />
                        <circle cx="123" cy="80" r="2" fill="#240747" />
                        <ellipse cx="120" cy="83" rx="1.2" ry="1" fill="#240747" />
                        <line x1="118" y1="86" x2="118" y2="88" stroke="#831843" strokeWidth="1" />
                        <line x1="122" y1="86" x2="122" y2="88" stroke="#831843" strokeWidth="1" />
                      </g>
                    )}

                    {activeWardrobe.headwear === "giant_pink_bow" && (
                      <g id="giant-pink-bow" transform="translate(120, 72) scale(1.1) translate(-120, -72)">
                        {/* Bow wings */}
                        <path d="M 120 72 C 100 55 90 70 102 85 C 112 88 118 78 120 75 Z" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />
                        <path d="M 120 72 C 140 55 150 70 138 85 C 128 88 122 78 120 75 Z" fill="url(#pink3DGrad)" stroke="#831843" strokeWidth="1.5" />
                        {/* Center knot */}
                        <circle cx="120" cy="74" r="5.5" fill="#ffffff" stroke="#831843" strokeWidth="1.5" />
                        <circle cx="120" cy="74" r="3" fill="#ff31b9" />
                      </g>
                    )}

                    {activeWardrobe.headwear === "witch_hat" && (
                      <g id="witch-hat" transform="translate(120, 68) scale(0.9) translate(-120, -68)">
                        {/* Brim */}
                        <ellipse cx="120" cy="72" rx="34" ry="9" fill="#18052e" stroke="#c084fc" strokeWidth="2" />
                        {/* Cone */}
                        <path d="M 98 70 Q 120 22 138 18 Q 132 38 142 70 Z" fill="#2e1065" stroke="#c084fc" strokeWidth="2" />
                        {/* Hat belt & buckle */}
                        <path d="M 103 66 Q 120 72 137 66 L 138 70 Q 120 76 102 70 Z" fill="#ff31b9" />
                        <rect x="115" y="66" width="10" height="7" rx="1.5" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="1" />
                      </g>
                    )}

                    {activeWardrobe.headwear === "sakura_flower" && (
                      <g id="sakura-flower" transform="translate(80, 72)">
                        <circle cx="0" cy="0" r="5" fill="#fda4af" stroke="#e11d48" strokeWidth="1" />
                        <circle cx="-6" cy="-4" r="5" fill="#fbcfe8" stroke="#e11d48" strokeWidth="1" />
                        <circle cx="6" cy="-4" r="5" fill="#fbcfe8" stroke="#e11d48" strokeWidth="1" />
                        <circle cx="-5" cy="5" r="5" fill="#fbcfe8" stroke="#e11d48" strokeWidth="1" />
                        <circle cx="5" cy="5" r="5" fill="#fbcfe8" stroke="#e11d48" strokeWidth="1" />
                        <circle cx="0" cy="0" r="3" fill="url(#gold3DGrad)" />
                      </g>
                    )}

                    {activeWardrobe.headwear === "biker_bandana" && (
                      <g id="biker-bandana">
                        <path d="M 75 80 Q 120 95 165 80 L 163 90 Q 120 105 77 90 Z" fill="#09090b" stroke="#ff31b9" strokeWidth="2" />
                        <text x="120" y="93" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">KUROMI 5</text>
                      </g>
                    )}

                    {activeWardrobe.accessory === "punk_crown" && (
                      <g id="punk-crown" transform="translate(120, 58) scale(0.9) translate(-120, -58)">
                        <polygon points="100,64 106,46 113,56 120,40 127,56 134,46 140,64" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="1.5" />
                        <circle cx="120" cy="42" r="3" fill="#ff31b9" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="106" cy="48" r="2" fill="#c084fc" />
                        <circle cx="134" cy="48" r="2" fill="#c084fc" />
                      </g>
                    )}
                  </g>

                  {/* 5. FACE (CLICKABLE FACE TARGET) */}
                  <g
                    id="front-face-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("face");
                    }}
                  >
                    {/* White Face Base */}
                    <ellipse
                      cx={120 + parallaxX}
                      cy="124"
                      rx="44"
                      ry="36"
                      fill="url(#face3DGrad)"
                      stroke="#c084fc"
                      strokeWidth="2"
                      filter={touchedPart === "face" ? "url(#touchGlow)" : undefined}
                    />

                    {/* Left Eye */}
                    <g id="left-eye">
                      {blink ? (
                        <path d="M 94 116 Q 104 122 112 116" stroke="#240747" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                      ) : (
                        <>
                          <ellipse cx="103" cy="115" rx="7.5" ry="11" fill="#130324" />
                          <ellipse cx="103" cy="116" rx="6" ry="9" fill="#ff31b9" />
                          <ellipse cx="103" cy="117" rx="4.5" ry="7" fill="#130324" />
                          <circle cx="101" cy="111" r="3" fill="#ffffff" />
                          <circle cx="105" cy="119" r="1.5" fill="#ffffff" />
                          <path d="M 94 108 L 91 103" stroke="#240747" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M 96 105 L 94 100" stroke="#240747" strokeWidth="2.5" strokeLinecap="round" />
                        </>
                      )}
                    </g>

                    {/* Right Eye */}
                    <g id="right-eye">
                      {blink || isWinking ? (
                        <path d="M 128 116 Q 136 122 146 116" stroke="#240747" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                      ) : (
                        <>
                          <ellipse cx="137" cy="115" rx="7.5" ry="11" fill="#130324" />
                          <ellipse cx="137" cy="116" rx="6" ry="9" fill="#ff31b9" />
                          <ellipse cx="137" cy="117" rx="4.5" ry="7" fill="#130324" />
                          <circle cx="135" cy="111" r="3" fill="#ffffff" />
                          <circle cx="139" cy="119" r="1.5" fill="#ffffff" />
                          <path d="M 146 108 L 149 103" stroke="#240747" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M 144 105 L 146 100" stroke="#240747" strokeWidth="2.5" strokeLinecap="round" />
                        </>
                      )}
                    </g>

                    {/* Rocker Sunglasses Overlay */}
                    {activeWardrobe.accessory === "rocker_sunglasses" && (
                      <g id="rocker-sunglasses">
                        <polygon points="103,103 107,112 116,112 109,118 112,127 103,122 94,127 97,118 90,112 99,112" fill="#09090b" stroke="#ff31b9" strokeWidth="1.8" />
                        <polygon points="137,103 141,112 150,112 143,118 146,127 137,122 128,127 131,118 124,112 133,112" fill="#09090b" stroke="#ff31b9" strokeWidth="1.8" />
                        <line x1="116" y1="114" x2="124" y2="114" stroke="#ff31b9" strokeWidth="2.5" />
                      </g>
                    )}

                    {/* Cute Nose */}
                    <ellipse cx="120" cy="124" rx="2" ry="1.5" fill="#ff31b9" stroke="#831843" strokeWidth="0.5" />

                    {/* Blushing Cheeks */}
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

                  {/* 7. ARMS & HANDS (HELD ACCESSORIES) */}
                  <g
                    id="front-hands-target"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBodyPartTouch("hands");
                    }}
                  >
                    {/* Left Arm */}
                    <circle cx="82" cy="168" r="8" fill="url(#kuromi3DPurple)" stroke="#240747" strokeWidth="2.5" />
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
                            : [0, 5, 0],
                      }}
                      transition={{
                        repeat: activeAnim === "wave" ? 0 : Infinity,
                        duration: activeAnim === "wave" ? 0.8 : isWalking ? 0.4 : isSpeaking ? 0.8 : 2.5,
                        ease: "easeInOut",
                      }}
                    >
                      <path d="M 82 168 Q 62 176 56 186" stroke="url(#kuromi3DPurple)" strokeWidth="11" strokeLinecap="round" fill="none" />
                      <path d="M 82 168 Q 62 176 56 186" stroke="#240747" strokeWidth="2.5" strokeLinecap="round" fill="none" />
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

                      {/* Electric Guitar slung across */}
                      {activeWardrobe.accessory === "electric_guitar" && (
                        <g id="electric-guitar" transform="translate(68, 175) rotate(-25)">
                          {/* Body */}
                          <path d="M 0 10 C -15 25 -5 45 15 45 C 35 45 40 25 30 10 C 25 0 5 0 0 10 Z" fill="#ff31b9" stroke="#831843" strokeWidth="2" />
                          <circle cx="15" cy="25" r="7" fill="#09090b" />
                          {/* Neck & Headstock */}
                          <rect x="12" y="-35" width="6" height="45" fill="#ffffff" stroke="#240747" strokeWidth="1" />
                          <polygon points="10,-35 20,-35 22,-45 8,-45" fill="#ff31b9" stroke="#831843" strokeWidth="1" />
                        </g>
                      )}
                    </motion.g>

                    {/* Right Arm */}
                    <circle cx="158" cy="168" r="8" fill="url(#kuromi3DPurple)" stroke="#240747" strokeWidth="2.5" />
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
                            : [0, -5, 0],
                      }}
                      transition={{
                        repeat: activeAnim === "wave" ? 0 : Infinity,
                        duration: activeAnim === "wave" ? 0.8 : isWalking ? 0.4 : isSpeaking ? 0.75 : 2.5,
                        ease: "easeInOut",
                      }}
                    >
                      <path d="M 158 168 Q 178 176 184 186" stroke="url(#kuromi3DPurple)" strokeWidth="11" strokeLinecap="round" fill="none" />
                      <path d="M 158 168 Q 178 176 184 186" stroke="#240747" strokeWidth="2.5" strokeLinecap="round" fill="none" />
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

                      {/* 📖 Kuromi Note Diary held in hand */}
                      {activeWardrobe.accessory === "kuromi_note" && (
                        <g id="kuromi-note-held" transform="translate(182, 172) rotate(15)">
                          {/* Diary Cover */}
                          <rect x="-4" y="-12" width="22" height="30" rx="3" fill="#ff31b9" stroke="#831843" strokeWidth="2" filter="url(#soft3DShadow)" />
                          {/* Black Spine */}
                          <rect x="-4" y="-12" width="5" height="30" rx="1" fill="#18052e" />
                          {/* Skull Stamp on Diary */}
                          <circle cx="7" cy="0" r="3.5" fill="#18052e" />
                          <circle cx="6" cy="-1" r="0.8" fill="#ffffff" />
                          <circle cx="8" cy="-1" r="0.8" fill="#ffffff" />
                          <text x="7" y="12" textAnchor="middle" fill="#ffffff" fontSize="4.5" fontWeight="bold">NOTE</text>
                        </g>
                      )}

                      {/* 🧅 Shallots & Meat Plate held in hand */}
                      {activeWardrobe.accessory === "shallots_skewer" && (
                        <g id="shallots-plate-held" transform="translate(182, 180) rotate(5)">
                          {/* Golden Plate */}
                          <ellipse cx="8" cy="8" rx="14" ry="6" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="1.2" />
                          {/* Chopped Purple Shallots */}
                          <circle cx="3" cy="7" r="2.5" fill="#c084fc" stroke="#7e22ce" strokeWidth="0.8" />
                          <circle cx="7" cy="6" r="2.2" fill="#e9d5ff" stroke="#7e22ce" strokeWidth="0.8" />
                          <circle cx="11" cy="7" r="2.5" fill="#a855f7" stroke="#7e22ce" strokeWidth="0.8" />
                          {/* Skewer Stick */}
                          <line x1="-4" y1="4" x2="22" y2="4" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
                          {/* Grilled Meat cubes */}
                          <rect x="0" y="2" width="4" height="4" rx="1" fill="#b45309" />
                          <rect x="6" y="2" width="4" height="4" rx="1" fill="#78350f" />
                          <rect x="12" y="2" width="4" height="4" rx="1" fill="#9a3412" />
                        </g>
                      )}

                      {/* 🪄 Crescent Moon Magic Wand held in hand */}
                      {activeWardrobe.accessory === "magic_wand" && (
                        <g id="magic-wand-held" transform="translate(186, 180) rotate(-30)">
                          <line x1="0" y1="26" x2="0" y2="-8" stroke="#ff31b9" strokeWidth="3" strokeLinecap="round" />
                          {/* Crescent Moon */}
                          <path d="M -4 -12 A 8 8 0 1 0 6 -4 A 6 6 0 1 1 -4 -12 Z" fill="url(#gold3DGrad)" stroke="#b45309" strokeWidth="1" />
                          {/* Bat Wings */}
                          <path d="M 0 -8 Q 8 -16 12 -8 Q 6 -6 0 -8" fill="#18052e" />
                          <path d="M 0 -8 Q -8 -16 -12 -8 Q -6 -6 0 -8" fill="#18052e" />
                          <circle cx="0" cy="-8" r="2" fill="#ff31b9" />
                        </g>
                      )}
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
export default Kuromi3D;
