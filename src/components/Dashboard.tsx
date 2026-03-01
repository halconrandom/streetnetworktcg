"use client";

import { GlassPanel } from "./ui/GlassPanel";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Play, TrendingUp, Package, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Featured Section */}
        <GlassPanel className="p-6 flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex items-center justify-between relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-500" />
              Featured Drop
            </h2>
            <div className="flex gap-2">
              <Badge variant="red">Mythic</Badge>
              <Badge variant="zinc">Ends in 24h</Badge>
            </div>
          </div>

          <div className="relative h-[280px] rounded-2xl overflow-hidden mt-2">
            <img 
              src="https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=2069&auto=format&fit=crop" 
              alt="Featured Pack"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black text-white mb-1">Legends of Los Santos</h3>
                <p className="text-zinc-300 font-medium">Exclusive GTA RP crossover set</p>
              </div>
              <Button variant="primary" size="lg" className="rounded-full shadow-red-600/30" onClick={() => onNavigate?.("packs")}>
                <Play className="h-5 w-5 mr-2 fill-current" />
                Open Now
              </Button>
            </div>
          </div>
        </GlassPanel>

        {/* Bottom Row - Trends & Packs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Recent Pulls / Trends */}
          <GlassPanel className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                Recent Pulls
              </h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            
            <div className="flex-1 relative bg-white/[0.02] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1)_0%,transparent_70%)]" />
               <div className="text-center z-10">
                 <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                   142
                 </span>
                 <p className="text-sm text-zinc-400 mt-2 font-medium uppercase tracking-wider">Cards Collected Today</p>
               </div>
               
               {/* Floating Cards Simulation */}
               <motion.div 
                 animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="absolute top-4 left-4 w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg border border-white/20"
               />
               <motion.div 
                 animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }} 
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                 className="absolute bottom-6 right-8 w-14 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-lg border border-white/20"
               />
            </div>
          </GlassPanel>

          {/* Available Packs */}
          <GlassPanel className="p-6 flex flex-col gap-4">
             <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-zinc-400" />
                Your Packs
              </h3>
              <Badge variant="amber">3 Unopened</Badge>
            </div>

            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Package className="h-6 w-6 text-zinc-400 group-hover:text-red-400 transition-colors relative z-10" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">Base Set Booster</h4>
                    <p className="text-xs text-zinc-500">Contains 10 cards</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={() => onNavigate?.("packs")}>
                    <Play className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Right Column - Stats & Notifications */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Collection Stats */}
        <GlassPanel className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Collection Value</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center py-6 relative">
            {/* Simulated Donut Chart */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                <circle cx="96" cy="96" r="80" fill="none" stroke="#dc2626" strokeWidth="16" strokeDasharray="502" strokeDashoffset="150" className="drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                <circle cx="96" cy="96" r="80" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="502" strokeDashoffset="400" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm text-zinc-400 font-medium">Est. Value</span>
                <span className="text-3xl font-black text-white mt-1">$4,250</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-red-600" />
                Pokemon
              </div>
              <span className="text-lg font-bold text-white">65%</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Yugioh
              </div>
              <span className="text-lg font-bold text-white">35%</span>
            </div>
          </div>
          
          <Button variant="glass" className="w-full">Detailed Analysis</Button>
        </GlassPanel>

        {/* Notifications */}
        <GlassPanel className="p-6 flex-1 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <AlertCircle className="w-48 h-48 text-red-500" />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-lg font-bold text-white">Alerts (2)</h3>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-900/20 border border-red-500/30">
              <h4 className="font-bold text-red-400 mb-1">Admin Gift Received!</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">
                You have received 2x "Legend of Blue Eyes" packs from the server admin for your recent purchase.
              </p>
              <Button variant="primary" size="sm" className="mt-3 w-full">Claim Packs</Button>
            </div>
            
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <h4 className="font-bold text-white mb-1">Server Event</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Double pull rates for Mythic cards this weekend. Don&apos;t miss out!
              </p>
            </div>
          </div>
        </GlassPanel>

      </div>
    </div>
  );
}
