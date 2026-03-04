"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ImageOff } from "lucide-react";
import { RarityBadge } from "./RarityBadge";
import { Card } from "@/lib/types";

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
}

function CardImage({ src, alt, size }: { src: string | null | undefined; alt: string; size: "modal" | "full" }) {
  const sizeClasses = size === "modal" 
    ? "w-[320px] h-[450px] md:w-[380px] md:h-[530px]" 
    : "w-full h-full";

  if (!src) {
    return (
      <div className={`${sizeClasses} flex items-center justify-center bg-zinc-900 rounded-2xl`}>
        <ImageOff className="h-16 w-16 text-zinc-700" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} relative rounded-2xl overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 320px, 380px"
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

export function CardModal({ card, isOpen, onClose }: CardModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 z-20 w-10 h-10 rounded-full bg-zinc-800/90 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Card Image */}
            <div className="relative">
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getGameColor(card.game)} blur-2xl scale-110 opacity-50`} />
              
              {/* Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <CardImage src={card.imageUrl} alt={card.name} size="modal" />
              </div>
            </div>

            {/* Card Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center max-w-[380px]"
            >
              <h3 className="text-2xl font-bold text-white mb-2">{card.name}</h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <RarityBadge rarity={card.rarity} size="md" />
                <span className="text-sm text-zinc-400">{card.game}</span>
              </div>
              {card.quantity && card.quantity > 1 && (
                <p className="text-sm text-zinc-500">Cantidad: {card.quantity}</p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}