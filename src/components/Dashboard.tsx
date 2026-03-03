"use client";

import { GlassPanel } from "./ui/GlassPanel";
import { Package, TrendingUp, Library } from "lucide-react";

type ViewType = 'dashboard' | 'collection' | 'packs';

interface DashboardProps {
  onNavigate?: (tab: ViewType) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      {/* Hero Section */}
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Street <span className="text-red-600">TCG</span> <span className="text-amber-500">Zone</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Colecciona e intercambia cartas en tu servidor de GTA V roleplay
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Open Packs */}
        <GlassPanel className="p-6 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => onNavigate?.("packs")}>
          <div className="h-16 w-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
            <Package className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Abrir Sobres</h3>
            <p className="text-sm text-zinc-500">Abre tus sobres de cartas</p>
          </div>
        </GlassPanel>

        {/* Collection */}
        <GlassPanel className="p-6 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => onNavigate?.("collection")}>
          <div className="h-16 w-16 rounded-2xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center group-hover:bg-amber-600/20 transition-colors">
            <Library className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Colección</h3>
            <p className="text-sm text-zinc-500">Ver tus cartas</p>
          </div>
        </GlassPanel>

        {/* Stats */}
        <GlassPanel className="p-6 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => onNavigate?.("collection")}>
          <div className="h-16 w-16 rounded-2xl bg-zinc-600/10 border border-zinc-600/20 flex items-center justify-center group-hover:bg-zinc-600/20 transition-colors">
            <TrendingUp className="h-8 w-8 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Estadísticas</h3>
            <p className="text-sm text-zinc-500">Tu progreso</p>
          </div>
        </GlassPanel>
      </div>

      {/* Info */}
      <div className="text-center text-zinc-500 text-sm max-w-md">
        <p>Pide sobres a un administrador para empezar</p>
      </div>
    </div>
  );
}