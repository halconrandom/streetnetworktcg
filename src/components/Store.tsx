"use client";

import { GlassPanel } from "./ui/GlassPanel";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ShoppingCart, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Pack } from "@/lib/types";

interface StoreProps {
  onBuy: (pack: Pack) => void;
  balance: number;
}

const storeItems: Pack[] = [
  { id: "pk-p1", name: "Base Set Booster", game: "Pokemon", price: 500 },
  { id: "pk-y1", name: "Legend of Blue Eyes", game: "Yu-Gi-Oh!", price: 750 },
  { id: "pk-m1", name: "Alpha Edition", game: "Magic", price: 1200 },
];

const getPackColor = (game: string) => {
  switch (game) {
    case "Pokemon":
      return "from-red-500 to-orange-600";
    case "Yu-Gi-Oh!":
      return "from-blue-400 to-indigo-600";
    case "Magic":
      return "from-zinc-700 to-black";
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

export function Store({ onBuy, balance }: StoreProps) {
  return (
    <div className="flex flex-col h-full gap-6">
      <GlassPanel className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <ShoppingCart className="h-7 w-7 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Card Shop</h2>
            <p className="text-sm text-amber-500/80 font-medium">Spend your credits here</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Balance</span>
            <span className="text-xl font-black text-amber-500">{balance.toLocaleString()} CR</span>
          </div>
          <Button variant="accent" size="sm">Get Credits</Button>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 overflow-y-auto pb-4 pr-2">
        {storeItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative flex flex-col rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden hover:bg-white/[0.04] transition-colors"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${getPackColor(item.game)} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            
            <div className="relative aspect-[4/3] overflow-hidden p-6 flex items-center justify-center">
              <div className={`absolute inset-0 bg-gradient-to-br ${getPackColor(item.game)} opacity-20`} />
              <div className="w-32 h-48 rounded-xl shadow-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <ShoppingCart className="h-12 w-12 text-white/20" />
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant={getBadgeVariant(item.game)} className="text-[10px] px-2 py-0">
                  {item.game}
                </Badge>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-4 relative z-10 border-t border-white/5">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{item.name}</h3>
                <p className="text-sm text-zinc-500">Contains 10 random cards</p>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-amber-500 font-black text-xl">
                  <Zap className="h-5 w-5 fill-current" />
                  {item.price}
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="rounded-full px-6 shadow-red-600/20"
                  onClick={() => onBuy(item)}
                  disabled={balance < item.price}
                >
                  Buy
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
