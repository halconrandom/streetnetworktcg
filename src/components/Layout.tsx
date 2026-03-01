"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { motion, AnimatePresence } from "motion/react";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (id: string) => void;
  username?: string;
  balance?: number;
}

export function Layout({ children, activeTab, setActiveTab, username, balance }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans selection:bg-red-600/30 selection:text-red-200 flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col w-full max-w-[1600px] mx-auto">
        <TopNav activeTab={activeTab} setActiveTab={setActiveTab} username={username} balance={balance} />
        
        <main className="flex-1 px-8 pb-8 flex flex-col relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
