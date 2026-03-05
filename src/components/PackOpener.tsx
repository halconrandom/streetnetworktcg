"use client";

import { useState } from "react";
import Image from "next/image";
import { GlassPanel } from "./ui/GlassPanel";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { RarityBadge } from "./ui/RarityBadge";
import { CardModal } from "./ui/CardModal";
import { PackageOpen, Sparkles, ImageOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card, UserProfile } from "@/lib/types";
import { isHitRarity } from "@/lib/rarity-utils";

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
      sizes="(max-width: 640px) 160px, 192px"
      className="object-contain"
      unoptimized
      onError={() => setError(true)}
    />
  );
}


interface PackOpenerProps {
  user: UserProfile;
  onOpen: (packId: string) => Promise<Card[] | null>;
}

const getPackColor = (game: string) => {
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

export function PackOpener({ user, onOpen }: PackOpenerProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [openingPackId, setOpeningPackId] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
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

  const handleSelectPack = async (packId: string) => {
    setIsOpening(true);
    setOpeningPackId(packId);
    const cards = await onOpen(packId);
    if (cards) {
      setTimeout(() => {
        setRevealedCards(cards);
        setIsOpening(false);
      }, 1200);
    } else {
      setIsOpening(false);
      setOpeningPackId(null);
    }
  };

  const reset = () => {
    setRevealedCards([]);
    setOpeningPackId(null);
  };

  const selectedPack = user.inventory.find(i => i.packId === openingPackId);

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-6 relative">
      <GlassPanel className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] flex-1 relative overflow-hidden">

        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />

        <AnimatePresence mode="wait">
          {!openingPackId && revealedCards.length === 0 && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-4 sm:gap-8 w-full max-w-4xl"
            >
              <div className="text-center px-4">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Tus Sobres</h2>
                <p className="text-sm sm:text-base text-zinc-400">Tienes {user.inventory.reduce((acc, i) => acc + i.count, 0)} sobres sin abrir. ¡Toca para abrir!</p>
              </div>

              {/* Packs Grid - Scrollable on mobile */}
              <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-4 sm:grid sm:grid-cols-2 md:sm:grid-cols-3 min-w-max sm:min-w-0 sm:w-full pb-2 sm:pb-0">
                  {user.inventory.map((item) => (
                    <div
                      key={item.packId}
                      onClick={() => item.count > 0 && handleSelectPack(item.packId)}
                      className={`relative group rounded-2xl sm:rounded-3xl p-1 transition-all duration-300 shrink-0 w-40 sm:w-auto sm:shrink ${item.count > 0 ? 'cursor-pointer hover:scale-105 active:scale-95 touch-manipulation' : 'opacity-50 grayscale cursor-not-allowed'}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${getPackColor(item.game || 'Magic')} rounded-2xl sm:rounded-3xl blur-md opacity-20 group-hover:opacity-50 transition-opacity`} />
                      <div className="relative h-full bg-[#080808] border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-4">
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                          <Badge variant={item.count > 0 ? "red" : "zinc"} className="text-xs">x{item.count}</Badge>
                        </div>

                        <div className="w-24 h-36 sm:w-32 sm:h-48 rounded-lg sm:rounded-xl overflow-hidden relative mt-2 sm:mt-4 shadow-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name || item.packId}
                              fill
                              sizes="(max-width: 640px) 96px, 128px"
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <>
                              <div className={`absolute inset-0 bg-gradient-to-br ${getPackColor(item.game || 'Magic')} opacity-40`} />
                              <PackageOpen className="h-8 w-8 sm:h-12 sm:w-12 text-white/30" />
                            </>
                          )}
                          <div className="absolute inset-0 border-2 border-white/20 rounded-lg sm:rounded-xl" />
                        </div>

                        <div className="text-center mt-1 sm:mt-2">
                          <h3 className="text-sm sm:text-lg font-bold text-white line-clamp-1">{item.name || item.packId}</h3>
                          <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">{item.game || 'Magic'}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {user.inventory.length === 0 && (
                    <div className="col-span-2 md:col-span-3 py-8 sm:py-12 text-center border border-dashed border-white/10 rounded-2xl sm:rounded-3xl">
                      <p className="text-sm sm:text-base text-zinc-500">No tienes sobres. Pide a un administrador que te asigne algunos.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {openingPackId && isOpening && (
            <motion.div
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 sm:gap-6"
            >
              <div className="w-36 h-52 sm:w-48 sm:h-72 rounded-xl sm:rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(220,38,38,0.3)] animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                {selectedPack?.imageUrl ? (
                  <Image
                    src={selectedPack.imageUrl}
                    alt={selectedPack?.name || openingPackId}
                    fill
                    sizes="(max-width: 640px) 144px, 192px"
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${getPackColor(selectedPack?.game || 'Magic')} opacity-40`} />
                    <PackageOpen className="h-12 w-12 sm:h-16 sm:w-16 text-white/30" />
                  </>
                )}
                <div className="absolute inset-0 border-4 border-white/20 rounded-xl sm:rounded-2xl" />
              </div>
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 animate-spin" />
              <h2 className="text-xl sm:text-2xl font-bold text-white animate-pulse">Revelando cartas...</h2>
            </motion.div>
          )}

          {revealedCards.length > 0 && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-6 sm:gap-12 w-full"
            >
              <div className="text-center px-4">
                <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 mb-2">¡Sobre Abierto!</h2>
                <p className="text-sm sm:text-base text-zinc-400">Cartas añadidas a tu colección.</p>
              </div>

              {/* Cards - Scrollable on mobile */}
              <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-4 justify-start sm:justify-center sm:flex-wrap pb-2 sm:pb-0">
                  {revealedCards.map((card, index) => {
                    const isHit = isHitRarity(card.rarity);
                    return (
                      <motion.div
                        key={`${card.id}-${index}`}
                        initial={{ opacity: 0, y: 50, scale: 0.8, rotateY: 90 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                        transition={{ delay: index * 0.2, type: "spring", bounce: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openCardModal(card)}
                        className={`relative w-36 h-52 sm:w-48 sm:h-72 rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer shrink-0 touch-manipulation ${isHit ? 'ring-2 ring-amber-400/50' : ''}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${getPackColor(card.game)} opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <CardImage src={card.imageUrl} alt={card.name} />
                        <div className="absolute inset-0 border-2 border-white/20 rounded-xl sm:rounded-2xl group-hover:border-white/50 group-hover:shadow-lg group-hover:shadow-white/10 transition-all" />

                        {/* Hover Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${getPackColor(card.game)} opacity-0 group-hover:opacity-30 transition-opacity rounded-xl sm:rounded-2xl`} />

                        <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                          <div className="flex justify-end">
                            <RarityBadge rarity={card.rarity} size="sm" />
                          </div>
                          <h3 className="text-sm sm:text-lg font-bold text-white leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">{card.name}</h3>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <Button variant="glass" onClick={reset} className="mt-2 sm:mt-4 touch-target">
                Abrir Otro Sobre
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>

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