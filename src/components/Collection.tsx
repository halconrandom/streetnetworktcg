"use client";

import { useState } from "react";
import Image from "next/image";
import { GlassPanel } from "./ui/GlassPanel";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { RarityBadge } from "./ui/RarityBadge";
import { CardModal } from "./ui/CardModal";
import { Search, Filter, Layers, ImageOff, Copy, Check, IdCard } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/lib/types";

function CardImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
        <ImageOff className="h-6 w-6 sm:h-8 sm:w-8 text-zinc-700" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 400px) 50vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
      className="object-contain group-hover:scale-110 transition-transform duration-500"
      unoptimized
      onError={() => setError(true)}
    />
  );
}

interface CollectionProps {
  collection: Card[];
}

export function Collection({ collection }: CollectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCardModal = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const closeCardModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCard(null), 200);
  };

  const copyToClipboard = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const filteredCards = collection.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCardColor = (game: string) => {
    switch (game) {
      case "Pokemon":
        return "from-red-500 to-orange-600";
      case "Yu-Gi-Oh!":
        return "from-blue-400 to-indigo-600";
      case "Magic":
        return "from-amber-500 to-purple-700";
      default:
        return "from-zinc-600 to-zinc-800";
    }
  };

  const getBadgeVariant = (game: string): "red" | "amber" | "zinc" => {
    switch (game) {
      case "Pokemon":
        return "red";
      case "Yu-Gi-Oh!":
        return "amber";
      default:
        return "zinc";
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-6">
      {/* Header & Controls */}
      <GlassPanel className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">Mi Colección</h2>
            <p className="text-xs sm:text-sm text-zinc-400">{collection.length} Cartas en Total</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar cartas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all touch-target"
            />
          </div>
          <Button variant="glass" size="icon" className="rounded-full shrink-0 touch-target">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </GlassPanel>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 pb-4">
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openCardModal(card)}
                className="group relative aspect-[2.5/3.5] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer touch-manipulation"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getCardColor(card.game)} opacity-10 group-hover:opacity-25 transition-opacity duration-300`} />
                
                {/* Card Image */}
                <CardImage src={card.imageUrl} alt={card.name} />

                {/* Card Border/Glass */}
                <div className="absolute inset-0 border-2 border-white/10 rounded-xl sm:rounded-2xl group-hover:border-white/40 group-hover:shadow-lg group-hover:shadow-white/5 transition-all duration-300" />

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-t ${getCardColor(card.game)} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl sm:rounded-2xl`} />

                {/* Content */}
                <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  {/* Quantity Badge - Top Left */}
                  {card.quantity && card.quantity > 1 && (
                    <motion.div 
                      className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-amber-500/90 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="text-[10px] sm:text-xs font-bold text-black">{card.quantity}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-end gap-1">
                    <Badge variant={getBadgeVariant(card.game)} className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0">
                      {card.game}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mb-0.5 sm:mb-1 group-hover:text-amber-400 transition-colors line-clamp-2">{card.name}</h3>
                    <RarityBadge rarity={card.rarity} size="sm" />
                    
                    {/* Copy ID Button - Hidden on very small screens */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(card.id);
                      }}
                      className="mt-1 sm:mt-2 hidden sm:flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      title="Copiar ID para Discord"
                    >
                      <IdCard className="h-3 w-3" />
                      <span className="font-mono truncate max-w-[100px]">{card.id.slice(0, 8)}...</span>
                      {copiedId === card.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
            <Search className="h-12 w-12 opacity-20" />
            <p>No se encontraron cartas con ese criterio.</p>
          </div>
        )}
      </div>

      {/* Card Modal */}
      <CardModal
        card={selectedCard ? {
          name: selectedCard.name,
          rarity: selectedCard.rarity,
          game: selectedCard.game,
          imageUrl: selectedCard.imageUrl,
          quantity: selectedCard.quantity
        } : null}
        isOpen={isModalOpen}
        onClose={closeCardModal}
      />
    </div>
  );
}