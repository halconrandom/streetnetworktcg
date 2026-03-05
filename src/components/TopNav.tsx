"use client";

import { motion, AnimatePresence } from "motion/react";
import { Gamepad2, Library, PackageOpen, Layers, Search, Bell, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

type ViewType = 'dashboard' | 'collection' | 'packs' | 'catalog';

const navItems: { id: ViewType; label: string; icon: typeof Gamepad2 }[] = [
  { id: "dashboard", label: "Inicio", icon: Gamepad2 },
  { id: "collection", label: "Colección", icon: Library },
  { id: "packs", label: "Sobres", icon: PackageOpen },
  { id: "catalog", label: "Catálogo", icon: Layers },
];

interface TopNavProps {
  activeTab: ViewType;
  setActiveTab: (id: ViewType) => void;
  username?: string;
  role?: string;
}

export function TopNav({ activeTab, setActiveTab, username = "Player", role = "user" }: TopNavProps) {
  const isAdmin = role === 'admin' || role === 'mod';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden md:flex items-center justify-between px-8 py-6">
        {/* Logo Area */}
        <div className="flex items-center gap-3 text-red-600">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-600/20">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden lg:block">
            Street <span className="text-red-600">Games</span> & <span className="text-amber-500">Books</span>
          </span>
        </div>

        {/* Center Navigation */}
        <div className="relative flex items-center rounded-full bg-white/[0.03] border border-white/5 p-1.5 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors touch-target",
                  isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-full bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10 hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Admin Link - Solo para admin/mod */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex h-10 items-center gap-2 px-4 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-sm font-medium hover:bg-red-600/20 transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:block">Admin</span>
            </Link>
          )}
          
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white transition-colors touch-target">
            <Search className="h-5 w-5" />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white transition-colors touch-target">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-[#080808]" />
          </button>

          {/* Auth Section */}
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="h-10 px-4 rounded-full text-sm font-medium text-zinc-300 hover:text-white transition-colors touch-target">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="h-10 px-4 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 touch-target">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-white">{username}</span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-600/20",
                    userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-red-600",
                    userButtonPopoverCard: "bg-[#0a0a0a] border border-white/10 rounded-2xl",
                    userButtonPopoverActionButton: "text-zinc-300 hover:text-white hover:bg-white/5",
                  }
                }}
                afterSignOutUrl="/sign-in"
              />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* Mobile Navigation Header */}
      <nav className="md:hidden flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 text-red-600">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/10 border border-red-600/20">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            <span className="text-red-600">SG</span>&<span className="text-amber-500">B</span>
          </span>
        </div>

        {/* Right side - Actions + Menu */}
        <div className="flex items-center gap-2">
          {/* Admin Link - Solo para admin/mod */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/10 border border-red-600/20 text-red-500 touch-target"
            >
              <Shield className="h-4 w-4" />
            </Link>
          )}
          
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white transition-colors touch-target">
            <Search className="h-4 w-4" />
          </button>
          
          {/* Auth Section Mobile */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="h-9 px-3 rounded-full bg-red-600 text-white text-sm font-medium touch-target">
                Entrar
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-red-700",
                  userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-red-600",
                  userButtonPopoverCard: "bg-[#0a0a0a] border border-white/10 rounded-2xl",
                  userButtonPopoverActionButton: "text-zinc-300 hover:text-white hover:bg-white/5",
                }
              }}
              afterSignOutUrl="/sign-in"
            />
          </SignedIn>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.2 }}
              className="absolute right-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-l border-white/10 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-6">
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white touch-target"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors touch-target",
                        isActive 
                          ? "bg-red-600/10 text-red-500 border border-red-600/20" 
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}