"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ImageOff } from "lucide-react";
import { RarityBadge } from "./RarityBadge";

// Flexible card type that works with both formats
interface CardModalCard {
  name: string;
  rarity: string;
  game: string;
  quantity?: number;
  imageUrl?: string | null;
  image_url?: string | null;
}

interface CardModalProps {
  card: CardModalCard | null;
  isOpen: boolean;
  onClose: () => void;
}

function CardImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  if (!src) {
    return (
      <div className="w-full aspect-[3/4] flex items-center justify-center bg-zinc-900 rounded-xl">
        <ImageOff className="h-12 w-12 text-zinc-700" />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden bg-zinc-900">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  // Track if we're mounted (for portal)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const getGameColor = (game: string) => {
    switch (game) {
      case "Pokemon":
        return "from-red-500/20 to-orange-600/20";
      case "Yu-Gi-Oh!":
        return "from-blue-400/20 to-indigo-600/20";
      case "Magic":
        return "from-amber-500/20 to-purple-700/20";
      default:
        return "from-zinc-600/20 to-zinc-800/20";
    }
  };

  const getGameGradient = (game: string) => {
    switch (game) {
      case "Pokemon":
        return "from-red-600 to-orange-500";
      case "Yu-Gi-Oh!":
        return "from-blue-500 to-indigo-600";
      case "Magic":
        return "from-amber-500 to-purple-600";
      default:
        return "from-zinc-600 to-zinc-700";
    }
  };

  // Get image URL from either format
  const imageUrl = card?.imageUrl || card?.image_url || null;

  // Modal content
  const modalContent = (
    <AnimatePresence>
      {isOpen && card && (
        <>
          {/* Backdrop - fixed to viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
          />

          {/* Slide Panel - fixed to viewport */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[9999] w-full max-w-md bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header - fixed at top */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-zinc-950 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Detalles de Carta</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - scrollable area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Card Image */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getGameColor(card.game)} blur-3xl scale-110 opacity-60`} />
                  
                  {/* Card */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                    <CardImage src={imageUrl} alt={card.name} />
                  </div>
                </motion.div>

                {/* Card Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <h3 className="text-2xl font-bold text-white">{card.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <RarityBadge rarity={card.rarity} size="md" />
                      <span className="text-sm text-zinc-400">{card.game}</span>
                    </div>
                  </div>

                  {/* Quantity */}
                  {card.quantity && card.quantity > 1 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-zinc-400">Cantidad:</span>
                      <span className="text-lg font-bold text-amber-400">{card.quantity}</span>
                    </div>
                  )}

                  {/* Game Badge */}
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${getGameGradient(card.game)} bg-opacity-20`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <span className="text-xl">
                          {card.game === "Pokemon" ? "🎴" : card.game === "Yu-Gi-Oh!" ? "⚔️" : "🔮"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Juego</p>
                        <p className="font-semibold text-white">{card.game}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rarity Info */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-zinc-400 mb-1">Rareza</p>
                    <RarityBadge rarity={card.rarity} size="lg" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render using portal to escape container stacking context
  if (!mounted) return null;
  
  return createPortal(modalContent, document.body);
}