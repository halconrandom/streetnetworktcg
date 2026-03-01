import { useState } from "react";
import { GlassPanel } from "./ui/GlassPanel";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { PackageOpen, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const availablePacks = [
  { id: 1, name: "Base Set Booster", game: "Pokemon", count: 3, image: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=400&auto=format&fit=crop", color: "from-red-500 to-orange-600" },
  { id: 2, name: "Legend of Blue Eyes", game: "Yugioh", count: 1, image: "https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=400&auto=format&fit=crop", color: "from-blue-400 to-indigo-600" },
  { id: 3, name: "Alpha Edition", game: "Magic", count: 0, image: "https://images.unsplash.com/photo-1633511090164-b424381e8b4c?q=80&w=400&auto=format&fit=crop", color: "from-zinc-700 to-black" },
];

export function PackOpener() {
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<any[]>([]);

  const handleOpen = () => {
    setIsOpening(true);
    // Simulate opening delay and fetching cards
    setTimeout(() => {
      setRevealedCards([
        { id: 101, name: "Holo Charizard", rarity: "Mythic Rare", color: "from-red-500 to-orange-600" },
        { id: 102, name: "Pikachu", rarity: "Common", color: "from-yellow-400 to-amber-500" },
        { id: 103, name: "Squirtle", rarity: "Common", color: "from-blue-400 to-cyan-500" },
      ]);
      setIsOpening(false);
    }, 2000);
  };

  const reset = () => {
    setRevealedCards([]);
    setSelectedPack(null);
  };

  return (
    <div className="flex flex-col h-full gap-6 relative">
      <GlassPanel className="p-6 flex flex-col items-center justify-center min-h-[400px] flex-1 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />

        <AnimatePresence mode="wait">
          {!selectedPack && revealedCards.length === 0 && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-8 w-full max-w-4xl"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black text-white mb-2">Select a Pack to Open</h2>
                <p className="text-zinc-400">You have 4 unopened packs in your inventory.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {availablePacks.map((pack) => (
                  <div 
                    key={pack.id}
                    onClick={() => pack.count > 0 && setSelectedPack(pack.id)}
                    className={`relative group rounded-3xl p-1 transition-all duration-300 ${pack.count > 0 ? 'cursor-pointer hover:scale-105' : 'opacity-50 grayscale cursor-not-allowed'}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${pack.color} rounded-3xl blur-md opacity-20 group-hover:opacity-50 transition-opacity`} />
                    <div className="relative h-full bg-[#080808] border border-white/10 rounded-3xl p-4 flex flex-col items-center gap-4">
                      <div className="absolute top-4 right-4">
                        <Badge variant={pack.count > 0 ? "red" : "zinc"}>x{pack.count}</Badge>
                      </div>
                      
                      <div className="w-32 h-48 rounded-xl overflow-hidden relative mt-4 shadow-2xl">
                        <div className={`absolute inset-0 bg-gradient-to-br ${pack.color} opacity-40`} />
                        <img src={pack.image} alt={pack.name} className="w-full h-full object-cover mix-blend-overlay" />
                        <div className="absolute inset-0 border-2 border-white/20 rounded-xl" />
                      </div>

                      <div className="text-center mt-2">
                        <h3 className="text-lg font-bold text-white">{pack.name}</h3>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">{pack.game}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedPack && !isOpening && revealedCards.length === 0 && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              className="flex flex-col items-center gap-8"
            >
              <div className="w-48 h-72 rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(220,38,38,0.3)] animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 opacity-40" />
                <img src={availablePacks.find(p => p.id === selectedPack)?.image} alt="Pack" className="w-full h-full object-cover mix-blend-overlay" />
                <div className="absolute inset-0 border-4 border-white/20 rounded-2xl" />
              </div>
              
              <div className="flex gap-4">
                <Button variant="ghost" onClick={() => setSelectedPack(null)}>Cancel</Button>
                <Button variant="primary" size="lg" onClick={handleOpen} className="px-12 text-lg">
                  <PackageOpen className="mr-2 h-5 w-5" />
                  Tear Open
                </Button>
              </div>
            </motion.div>
          )}

          {isOpening && (
            <motion.div
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6"
            >
              <Sparkles className="h-16 w-16 text-red-500 animate-spin-slow" />
              <h2 className="text-2xl font-bold text-white animate-pulse">Revealing Cards...</h2>
            </motion.div>
          )}

          {revealedCards.length > 0 && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-12 w-full"
            >
              <div className="text-center">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 mb-2">Pack Opened!</h2>
                <p className="text-zinc-400">Cards added to your collection.</p>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                {revealedCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 50, scale: 0.8, rotateY: 90 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                    transition={{ delay: index * 0.2, type: "spring", bounce: 0.4 }}
                    className="relative w-48 h-72 rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                    <div className="absolute inset-0 border-2 border-white/20 rounded-2xl group-hover:border-white/50 transition-colors" />
                    
                    <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                      <div className="flex justify-end">
                        <Badge variant={card.rarity === "Mythic Rare" ? "red" : "zinc"} className="text-[10px]">
                          {card.rarity}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight">{card.name}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button variant="glass" onClick={reset} className="mt-4">
                Open Another Pack
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </div>
  );
}
