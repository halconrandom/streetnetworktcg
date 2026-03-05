"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GlassPanel } from "./ui/GlassPanel";
import { Badge } from "./ui/Badge";
import { PackageOpen, Layers } from "lucide-react";
import { motion } from "motion/react";

interface Pack {
  id: string;
  name: string;
  game: string;
  cardCount?: number;
  imageUrl?: string | null;
  setLogoUrl?: string | null;
  setName?: string;
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

const getGameEmoji = (game: string) => {
  switch (game) {
    case "Pokemon":
      return "⚡";
    case "Yu-Gi-Oh!":
      return "🔮";
    case "Magic":
      return "🌀";
    default:
      return "🃏";
  }
};

export function PacksCatalog() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchPacks() {
      try {
        const res = await fetch("/api/packs");
        if (res.ok) {
          setPacks(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPacks();
  }, []);

  const filteredPacks = filter === "all" 
    ? packs 
    : packs.filter(p => p.game === filter);

  const games = [...new Set(packs.map(p => p.game))];

  if (loading) {
    return (
      <div className="flex flex-col h-full gap-4 sm:gap-6">
        <GlassPanel className="p-4 sm:p-6">
          <div className="animate-pulse flex gap-4">
            <div className="h-10 w-24 bg-white/5 rounded-full" />
            <div className="h-10 w-24 bg-white/5 rounded-full" />
            <div className="h-10 w-24 bg-white/5 rounded-full" />
          </div>
        </GlassPanel>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2.5/3.5] bg-white/5 rounded-xl sm:rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-6">
      {/* Header */}
      <GlassPanel className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-600/20 border border-amber-600/30 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">Catálogo de Sobres</h2>
            <p className="text-xs sm:text-sm text-zinc-400">{packs.length} sobres disponibles</p>
          </div>
        </div>

        {/* Filters - Scrollable on mobile */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-target ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            Todos
          </button>
          {games.map((game) => (
            <button
              key={game}
              onClick={() => setFilter(game)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-target ${
                filter === game
                  ? "bg-red-600 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {getGameEmoji(game)} {game}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Packs Grid */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 pb-4">
        {filteredPacks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredPacks.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
                className="group relative aspect-[2.5/3.5] rounded-xl sm:rounded-2xl overflow-hidden touch-manipulation"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getPackColor(pack.game)} opacity-20`} />
                
                {/* Card Image or Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {pack.imageUrl || pack.setLogoUrl ? (
                    <Image
                      src={pack.imageUrl || pack.setLogoUrl || ""}
                      alt={pack.name}
                      fill
                      sizes="(max-width: 400px) 50vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-contain p-3 sm:p-4"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <PackageOpen className="h-10 w-10 sm:h-12 sm:w-12 text-white/20" />
                    </div>
                  )}
                </div>

                {/* Border */}
                <div className="absolute inset-0 border-2 border-white/10 rounded-xl sm:rounded-2xl group-hover:border-white/30 transition-colors" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  {/* Game Badge */}
                  <div className="flex justify-end">
                    <Badge 
                      variant={pack.game === "Pokemon" ? "red" : pack.game === "Yu-Gi-Oh!" ? "amber" : "zinc"}
                      className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0"
                    >
                      {getGameEmoji(pack.game)} {pack.game}
                    </Badge>
                  </div>

                  {/* Pack Info */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight mb-0.5 sm:mb-1 group-hover:text-amber-400 transition-colors line-clamp-2">
                      {pack.name}
                    </h3>
                    {pack.cardCount && (
                      <p className="text-[9px] sm:text-[10px] text-zinc-500">
                        {pack.cardCount} cartas por sobre
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
            <PackageOpen className="h-12 w-12 opacity-20" />
            <p>No hay sobres disponibles en esta categoría.</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="text-center text-zinc-600 text-[10px] sm:text-xs px-4">
        <p>Los sobres mostrados están disponibles para compra en tienda.</p>
        <p className="mt-1">Street Games & Books - tcgzone.tmstreet.network</p>
      </div>
    </div>
  );
}