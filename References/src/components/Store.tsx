import { GlassPanel } from "./ui/GlassPanel";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ShoppingCart, Star, Zap } from "lucide-react";
import { motion } from "motion/react";

const storeItems = [
  { id: 1, name: "Base Set Booster", game: "Pokemon", price: 500, type: "Pack", image: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=400&auto=format&fit=crop", color: "from-red-500 to-orange-600" },
  { id: 2, name: "Legend of Blue Eyes", game: "Yugioh", price: 750, type: "Pack", image: "https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=400&auto=format&fit=crop", color: "from-blue-400 to-indigo-600" },
  { id: 3, name: "Alpha Edition", game: "Magic", price: 1200, type: "Pack", image: "https://images.unsplash.com/photo-1633511090164-b424381e8b4c?q=80&w=400&auto=format&fit=crop", color: "from-zinc-700 to-black" },
  { id: 4, name: "Mythic Box", game: "Mixed", price: 5000, type: "Bundle", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop", color: "from-purple-500 to-fuchsia-700" },
];

export function Store() {
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
            <span className="text-xl font-black text-amber-500">1,250 CR</span>
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
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            
            <div className="relative aspect-[4/3] overflow-hidden p-6 flex items-center justify-center">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-20`} />
              <img src={item.image} alt={item.name} className="w-32 h-48 object-cover rounded-xl shadow-2xl group-hover:scale-110 transition-transform duration-700 mix-blend-overlay" />
              <div className="absolute top-4 left-4">
                <Badge variant={item.type === "Bundle" ? "amber" : "zinc"}>{item.type}</Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant={item.game === "Pokemon" ? "red" : item.game === "Yugioh" ? "amber" : "zinc"} className="text-[10px] px-2 py-0">
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
                <Button variant="primary" size="sm" className="rounded-full px-6 shadow-red-600/20">Buy</Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
