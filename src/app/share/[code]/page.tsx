"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Badge } from "@/components/ui/Badge";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { Layers, Clock, User, ImageOff, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface SharedCard {
  id: string;
  cardId: string;
  name: string;
  type: string;
  rarity: string;
  imageUrl: string;
  game: string;
  quantity: number;
  setName: string;
  series: string;
}

interface SharedCollection {
  success: boolean;
  owner: string;
  expiresAt: string;
  stats: {
    totalCards: number;
    totalGames: number;
    totalQuantity: number;
  };
  collection: SharedCard[];
}

function CardImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
        <ImageOff className="h-8 w-8 text-zinc-700" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
      className="object-contain group-hover:scale-105 transition-transform duration-700"
      unoptimized
      onError={() => setError(true)}
    />
  );
}

export default function SharedCollectionPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [data, setData] = useState<SharedCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const res = await fetch(`/api/share/${code}`);
        const json = await res.json();
        
        if (!res.ok) {
          setError(json.error || "Error al cargar la colección");
        } else {
          setData(json);
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [code]);

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

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando colección...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        <GlassPanel className="p-8 max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-zinc-400">{error}</p>
        </GlassPanel>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <GlassPanel className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                <Layers className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Colección Compartida</h1>
                <div className="flex items-center gap-2 text-zinc-400 mt-1">
                  <User className="h-4 w-4" />
                  <span>{data.owner}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Clock className="h-4 w-4" />
                <span>Expira: {formatExpiry(data.expiresAt)}</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="red">{data.stats.totalCards} cartas únicas</Badge>
                <Badge variant="zinc">{data.stats.totalQuantity} total</Badge>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Grid */}
        {data.collection.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.collection.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="group relative aspect-[2.5/3.5] rounded-2xl overflow-hidden cursor-pointer"
              >
                <CardImage src={card.imageUrl} alt={card.name} />
                <div className="absolute inset-0 border-2 border-white/10 rounded-2xl group-hover:border-white/30 transition-colors duration-300" />
                <div className="absolute inset-0 p-3 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                  {card.quantity && card.quantity > 1 && (
                    <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-amber-500/90 flex items-center justify-center">
                      <span className="text-xs font-bold text-black">{card.quantity}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Badge variant={getBadgeVariant(card.game)} className="text-[10px] px-2 py-0">
                      {card.game}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight mb-1 group-hover:text-red-400 transition-colors">
                      {card.name}
                    </h3>
                    <RarityBadge rarity={card.rarity} size="sm" />
                    {card.setName && (
                      <p className="text-[10px] text-zinc-500 mt-1 truncate">{card.setName}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassPanel className="p-8 text-center">
            <p className="text-zinc-400">Esta colección está vacía.</p>
          </GlassPanel>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-zinc-600 text-sm">
          <p>StreetTCG - Colección compartida</p>
        </div>
      </div>
    </div>
  );
}
