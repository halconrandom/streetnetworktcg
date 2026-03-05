"use client";

import { motion } from "motion/react";
import { Gamepad2, Library, PackageOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewType = 'dashboard' | 'collection' | 'packs' | 'catalog';

const navItems: { id: ViewType; label: string; icon: typeof Gamepad2 }[] = [
  { id: "dashboard", label: "Inicio", icon: Gamepad2 },
  { id: "collection", label: "Colección", icon: Library },
  { id: "packs", label: "Sobres", icon: PackageOpen },
  { id: "catalog", label: "Catálogo", icon: Layers },
];

interface MobileNavProps {
  activeTab: ViewType;
  setActiveTab: (id: ViewType) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors touch-target",
                  isActive ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-red-600/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="h-5 w-5 relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}