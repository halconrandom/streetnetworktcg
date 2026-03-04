"use client";

import { GlassPanel } from "./ui/GlassPanel";
import { Package, TrendingUp, Library, Layers } from "lucide-react";
import { motion } from "motion/react";

type ViewType = 'dashboard' | 'collection' | 'packs' | 'catalog';

interface DashboardProps {
  onNavigate?: (tab: ViewType) => void;
}

// Floating card component for background
function FloatingCard({ delay, duration, x, y, rotate, color }: {
  delay: number;
  duration: number;
  x: string;
  y: string;
  rotate: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      animate={{
        opacity: [0, 0.3, 0.3, 0],
        y: [0, -100, -200, -300],
        rotate: [0, rotate / 2, rotate],
        x: [0, 20, -20, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut"
      }}
      className={`absolute ${x} ${y} w-16 h-22 rounded-lg ${color} border border-white/10 shadow-lg pointer-events-none`}
      style={{ aspectRatio: '2.5/3.5' }}
    />
  );
}

// Animated orb
function AnimatedOrb({ color, size, x, y, delay }: {
  color: string;
  size: number;
  x: string;
  y: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`absolute ${x} ${y} rounded-full ${color} blur-3xl pointer-events-none`}
      style={{ width: size, height: size }}
    />
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-full gap-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <AnimatedOrb color="bg-red-600" size={400} x="left-[-10%]" y="top-[-10%]" delay={0} />
        <AnimatedOrb color="bg-amber-500" size={350} x="right-[-5%]" y="bottom-[-5%]" delay={1} />
        <AnimatedOrb color="bg-red-500" size={250} x="right-[20%]" y="top-[10%]" delay={2} />
        <AnimatedOrb color="bg-orange-500" size={200} x="left-[15%]" y="bottom-[20%]" delay={1.5} />

        {/* Floating cards */}
        <FloatingCard delay={0} duration={8} x="left-[5%]" y="top-[60%]" rotate={15} color="bg-gradient-to-br from-red-500/20 to-red-600/20" />
        <FloatingCard delay={1} duration={10} x="left-[15%]" y="top-[70%]" rotate={-20} color="bg-gradient-to-br from-amber-500/20 to-orange-500/20" />
        <FloatingCard delay={2} duration={9} x="right-[10%]" y="top-[50%]" rotate={25} color="bg-gradient-to-br from-red-600/20 to-pink-500/20" />
        <FloatingCard delay={3} duration={11} x="right-[20%]" y="top-[80%]" rotate={-15} color="bg-gradient-to-br from-orange-500/20 to-amber-500/20" />
        <FloatingCard delay={4} duration={8} x="left-[40%]" y="top-[90%]" rotate={10} color="bg-gradient-to-br from-red-400/20 to-red-500/20" />
        <FloatingCard delay={5} duration={12} x="right-[35%]" y="top-[65%]" rotate={-25} color="bg-gradient-to-br from-amber-400/20 to-red-500/20" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#080808_70%)]" />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl relative z-10"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-5xl font-black text-white mb-4"
        >
          Street <span className="text-red-600">TCG</span> <span className="text-amber-500">Zone</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-zinc-400 text-lg"
        >
          Colecciona e intercambia cartas en tu servidor de GTA V roleplay
        </motion.p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl relative z-10"
      >
        {/* Open Packs */}
        <GlassPanel
          className="p-6 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-red-600/10"
          onClick={() => onNavigate?.("packs")}
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
            className="h-16 w-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center group-hover:bg-red-600/20 transition-colors"
          >
            <Package className="h-8 w-8 text-red-500" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Abrir Sobres</h3>
            <p className="text-sm text-zinc-500">Abre tus sobres de cartas</p>
          </div>
        </GlassPanel>

        {/* Collection */}
        <GlassPanel
          className="p-6 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-amber-600/10"
          onClick={() => onNavigate?.("collection")}
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
            className="h-16 w-16 rounded-2xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center group-hover:bg-amber-600/20 transition-colors"
          >
            <Library className="h-8 w-8 text-amber-500" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Colección</h3>
            <p className="text-sm text-zinc-500">Ver tus cartas</p>
          </div>
        </GlassPanel>

        {/* Stats */}
        <GlassPanel
          className="p-6 flex flex-col items-center gap-4 text-center group hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-zinc-600/10"
          onClick={() => onNavigate?.("catalog")}
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
            className="h-16 w-16 rounded-2xl bg-zinc-600/10 border border-zinc-600/20 flex items-center justify-center group-hover:bg-zinc-600/20 transition-colors"
          >
            <Layers className="h-8 w-8 text-zinc-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Catálogo</h3>
            <p className="text-sm text-zinc-500">Ver sobres disponibles</p>
          </div>
        </GlassPanel>
      </motion.div>

      {/* Info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center text-zinc-500 text-sm max-w-md relative z-10"
      >
        Pide sobres a un administrador para empezar
      </motion.p>
    </div>
  );
}