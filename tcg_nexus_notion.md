# TCG Nexus - Complete Project Source Code

This document contains all the current source code for the TCG Nexus project, refactored with a modern dark glassmorphic theme and red accents.

## Table of Contents
1. [App Page (Main Layout & Logic)](#app-page-main-layout--logic)
2. [Sidebar Component](#sidebar-component)
3. [TopBar Component](#topbar-component)
4. [UI Primitives](#ui-primitives)
5. [CardDisplay Component](#carddisplay-component)
6. [Marketplace View](#marketplace-view)
7. [Simulator View (Pack Opener)](#simulator-view-pack-opener)
8. [Collection View (My Binder)](#collection-view-my-binder)
9. [Profile View](#profile-view)
10. [Types Definition](#types-definition)
11. [Mock Data](#mock-data)
12. [Global Styles](#global-styles)

---

## App Page (Main Layout & Logic)
**File:** `src/app/page.tsx`

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MarketplaceView } from '@/components/views/MarketplaceView';
import { SimulatorView } from '@/components/views/SimulatorView';
import { CollectionView } from '@/components/views/CollectionView';
import { ProfileView } from '@/components/views/ProfileView';
import { UserProfile, Card, Pack } from '@/lib/types';
import { AnimatePresence, motion } from 'motion/react';

export default function Home() {
  const [view, setView] = useState<'marketplace' | 'simulator' | 'collection' | 'profile'>('marketplace');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [collection, setCollection] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      const [userRes, collRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/collection')
      ]);
      setUser(await userRes.json());
      setCollection(await collRes.json());
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUser = React.useCallback(async () => {
    const res = await fetch('/api/user');
    setUser(await res.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBuy = async (pack: Pack) => {
    try {
      const res = await fetch('/api/buy-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id, price: pack.price })
      });
      if (res.ok) fetchUser(); // Faster just to grab user
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = async (packId: string) => {
    try {
      const res = await fetch('/api/open-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId })
      });
      const data = await res.json();
      if (data.cards) {
        fetchData(); // Refresh both user balance/inv and collection
        return data.cards;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#080808] overflow-hidden relative">
        {/* Loading Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-red-600/10 blur-[120px] rounded-full"
          />
        </div>

        <div className="flex flex-col items-center space-y-4 relative z-10">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-[10px] uppercase tracking-widest text-zinc-500">Initializing Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden font-sans selection:bg-red-600/20 relative">
      {/* Dynamic Animated Background Layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 400, 0],
            y: [0, 200, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -300, 0],
            y: [0, 400, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-amber-500/5 blur-[130px] rounded-full"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,8,8,0.4)_100%)]" />
      </div>

      <Sidebar view={view} setView={setView} username={user.username} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar view={view} balance={user.balance} />

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {view === 'marketplace' && <MarketplaceView onBuy={handleBuy} balance={user.balance} />}
              {view === 'simulator' && <SimulatorView user={user} onOpen={handleOpen} />}
              {view === 'collection' && <CollectionView collection={collection} />}
              {view === 'profile' && <ProfileView user={user} collectionCount={collection.length} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
```

---

## Sidebar Component
**File:** `src/components/Sidebar.tsx`

```tsx
import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Package, LayoutGrid, User, LogOut, Sparkles } from 'lucide-react';

interface SidebarProps {
    view: string;
    setView: (view: any) => void;
    username: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, username }) => {
    const menuItems = [
        { id: 'marketplace', label: 'Gallery', icon: ShoppingBag },
        { id: 'simulator', label: 'Pack Opener', icon: Package },
        { id: 'collection', label: 'My Binder', icon: LayoutGrid },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <aside className="w-64 border-r border-white/5 flex flex-col bg-black/40 backdrop-blur-xl transition-all h-full text-zinc-400 relative z-20">
            <div className="p-6 flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    <Sparkles size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-black tracking-tight uppercase leading-none text-white">TCG Nexus</h1>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Collectors Hub</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = view === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all relative group ${isActive
                                ? 'text-white'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-red-600/10 border border-red-600/20 rounded-xl"
                                />
                            )}
                            <Icon size={16} className={isActive ? 'text-red-500 relative z-10' : 'relative z-10'} />
                            <span className="text-[11px] font-bold uppercase tracking-widest relative z-10">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-white/5">
                <div className="flex items-center space-x-3 px-2 mb-4">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                        <User size={18} className="text-zinc-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate uppercase text-white">{username}</p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <p className="text-[8px] text-red-500/80 font-black uppercase tracking-widest">Nexus Link Active</p>
                        </div>
                    </div>
                </div>
                <button className="w-full flex items-center space-x-3 px-4 py-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest">
                    <LogOut size={14} />
                    <span>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};
```

---

## TopBar Component
**File:** `src/components/TopBar.tsx`

```tsx
import React from 'react';
import { Coins, History, Download, Upload } from 'lucide-react';

interface TopBarProps {
    view: string;
    balance: number;
}

export const TopBar: React.FC<TopBarProps> = ({ view, balance }) => {
    const viewLabels: Record<string, string> = {
        marketplace: 'Gallery',
        simulator: 'Pack Opener',
        collection: 'My Binder',
        profile: 'Profile',
    };

    return (
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md w-full relative z-20">
            <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span>Nexus</span>
                <span className="text-zinc-800">/</span>
                <span className="text-white">{viewLabels[view]}</span>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                    <Coins size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-200 tracking-tight">{balance}</span>
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-zinc-500 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                        <History size={18} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                        <Download size={18} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                        <Upload size={18} />
                    </button>
                    <button className="ml-2 px-4 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:bg-red-700 transition-all">
                        Direct Share
                    </button>
                </div>
            </div>
        </header>
    );
};
```

---

## UI Primitives
**File:** `src/components/UI.tsx`

```tsx
'use client';

import React from 'react';

export const PanelHeader = ({ title }: { title: string }) => (
    <div className="flex items-center space-x-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
    </div>
);

export const ControlSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-10">
        <PanelHeader title={title} />
        <div className="space-y-4">{children}</div>
    </div>
);

export const InputField = ({ label, value }: { label: string; value: string | number }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 ml-1">{label}</label>
        <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-zinc-300 backdrop-blur-sm shadow-inner overflow-hidden truncate">
            {value}
        </div>
    </div>
);
```

---

## CardDisplay Component
**File:** `src/components/CardDisplay.tsx`

```tsx
'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Card } from '@/lib/types';

interface CardDisplayProps {
    card: Card;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, rotateY: 5, rotateX: 5 }}
            className="group relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 hover:border-red-600/30"
        >
            <div className="aspect-[3/4] overflow-hidden bg-black/40 relative">
                <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute top-3 right-3 z-10">
                    <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${card.rarity.includes('Premium') || card.rarity.includes('Ultra')
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                            : card.rarity.includes('Rare')
                                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                : 'bg-white/10 text-zinc-400 border border-white/10'
                            }`}
                    >
                        {card.rarity}
                    </span>
                </div>
            </div>
            <div className="p-3 relative z-10">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-black text-white truncate flex-1 text-[10px] uppercase tracking-tight">{card.name}</h3>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{card.type}</p>
                    <span className="text-[7px] font-black text-red-600/80 uppercase tracking-tighter bg-red-600/5 px-1.5 py-0.5 rounded-md border border-red-600/10">{card.game}</span>
                </div>
            </div>
            <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
};
```

---

## Marketplace View
**File:** `src/components/views/MarketplaceView.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Package, ChevronRight, ChevronDown } from 'lucide-react';
import { Pack } from '@/lib/types';
import { MOCK_PACKS } from '@/lib/mockData';
import { ControlSection, InputField } from '../UI';

interface MarketplaceViewProps {
    onBuy: (pack: Pack) => void;
    balance: number;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onBuy, balance }) => {
    const [selectedPack, setSelectedPack] = useState<Pack>(MOCK_PACKS[0]);

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
                <motion.div
                    key={selectedPack.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center relative z-10"
                >
                    <div className="w-64 h-80 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col items-center justify-center shadow-2xl mb-8 group hover:border-red-500/50 transition-all duration-500">
                        <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <Package size={80} className="text-white/10 group-hover:text-red-500/20 transition-colors duration-500" />
                        <div className="mt-4 text-white/20 font-bold uppercase tracking-widest text-[10px] group-hover:text-red-500/40 transition-colors">
                            {selectedPack.game} Protocol
                        </div>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">{selectedPack.name}</h2>
                    <p className="text-red-500/60 uppercase tracking-widest text-[9px] font-black">
                        Nexus Authentication Required
                    </p>
                </motion.div>
            </div>

            <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-y-auto p-6 relative z-10">
                <ControlSection title="Interface Nodes">
                    <div className="space-y-2">
                        {MOCK_PACKS.map((pack) => (
                            <button
                                key={pack.id}
                                onClick={() => setSelectedPack(pack)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group relative overflow-hidden ${selectedPack.id === pack.id
                                    ? 'bg-red-600/10 border-red-500/30 text-white font-bold'
                                    : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                                    }`}
                            >
                                <span className="text-[10px] uppercase tracking-widest relative z-10">{pack.name}</span>
                                <ChevronRight
                                    size={14}
                                    className={selectedPack.id === pack.id ? 'text-red-500 relative z-10' : 'text-zinc-600 relative z-10'}
                                />
                            </button>
                        ))}
                    </div>
                </ControlSection>

                <ControlSection title="Data Stream">
                    <InputField label="Credits Required" value={selectedPack.price} />
                    <InputField label="Source Network" value={selectedPack.game} />
                </ControlSection>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button
                        onClick={() => onBuy(selectedPack)}
                        disabled={balance < selectedPack.price}
                        className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:bg-red-700 transition-all disabled:opacity-30 disabled:grayscale group relative overflow-hidden"
                    >
                        <span className="relative z-10">Initialize Acquisition</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <p className="text-[8px] text-center mt-4 text-zinc-600 uppercase tracking-widest font-bold">
                        Secure Transmission Encrypted
                    </p>
                </div>
            </aside>
        </div>
    );
};
```

---

## Simulator View (Pack Opener)
**File:** `src/components/views/SimulatorView.tsx`

```tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Package } from 'lucide-react';
import { Card, UserProfile } from '@/lib/types';
import { CardDisplay } from '../CardDisplay';
import { ControlSection } from '../UI';

interface SimulatorViewProps {
    user: UserProfile;
    onOpen: (packId: string) => Promise<Card[] | null>;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ user, onOpen }) => {
    const [opening, setOpening] = useState(false);
    const [openedCards, setOpenedCards] = useState<Card[]>([]);
    const [selectedPackId, setSelectedPackId] = useState<string | null>(
        user.inventory.length > 0 ? user.inventory[0].packId : null
    );

    const handleOpenClick = async () => {
        if (!selectedPackId) return;
        setOpening(true);
        const cards = await onOpen(selectedPackId);
        if (cards) {
            setTimeout(() => {
                setOpenedCards(cards);
                setOpening(false);
            }, 1200);
        } else {
            setOpening(false);
        }
    };

    return (
        <div className="flex h-full">
            <main className="flex-1 relative overflow-auto p-12">
                <AnimatePresence mode="wait">
                    {opening ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center p-12"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 2, -2, 0],
                                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                                }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="w-48 h-64 bg-white/5 backdrop-blur-3xl rounded-3xl border border-red-500/30 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.2)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
                                <Sparkles size={48} className="text-red-500 animate-pulse relative z-10" />
                                <p className="mt-4 font-black text-[10px] uppercase tracking-[0.2em] text-red-500 relative z-10 animate-pulse">Syncing Nexus...</p>
                            </motion.div>
                        </motion.div>
                    ) : openedCards.length > 0 ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-5xl">
                                {openedCards.map((card, idx) => (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                                    >
                                        <CardDisplay card={card} />
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-12">
                                <button
                                    onClick={() => setOpenedCards([])}
                                    className="px-12 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] rounded-full border border-white/10 transition-all text-[10px]"
                                >
                                    Clear Stream
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                                <Sparkles size={32} className="text-red-500/20" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-widest mb-2 uppercase">Nexus Standby</h3>
                            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                                Awaiting Authentication Signal
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-y-auto p-6 relative z-10">
                <ControlSection title="Encrypted Buffer">
                    <div className="space-y-2">
                        {user.inventory.map((item) => (
                            <button
                                key={item.packId}
                                onClick={() => setSelectedPackId(item.packId)}
                                className={`w-full flex items-center justify-between p-4 border transition-all rounded-xl relative overflow-hidden group ${selectedPackId === item.packId
                                    ? 'bg-red-600/10 border-red-500/30'
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center space-x-3 relative z-10">
                                    <Package size={14} className={selectedPackId === item.packId ? 'text-red-500' : 'text-zinc-600'} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedPackId === item.packId ? 'text-white' : 'text-zinc-500'}`}>
                                        {item.packId.includes('p') ? 'Pokemon' : item.packId.includes('y') ? 'Yu-Gi-Oh' : 'Magic'} Node
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black relative z-10 ${selectedPackId === item.packId ? 'text-red-500' : 'text-zinc-700'}`}>
                                    {item.count}
                                </span>
                            </button>
                        ))}
                        {user.inventory.length === 0 && (
                            <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl">
                                <p className="text-[9px] text-zinc-700 uppercase tracking-[0.2em] font-black">Empty Vault</p>
                            </div>
                        )}
                    </div>
                </ControlSection>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button
                        onClick={handleOpenClick}
                        disabled={opening || !selectedPackId || !user.inventory.find(i => i.packId === selectedPackId)?.count}
                        className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:bg-red-700 transition-all disabled:opacity-20 disabled:grayscale group relative overflow-hidden"
                    >
                        <span className="relative z-10">Initialize Sequence</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <p className="text-[8px] text-center mt-4 text-zinc-600 uppercase tracking-widest font-bold">
                        Bypass Protocol V4.2
                    </p>
                </div>
            </aside>
        </div>
    );
};
```

---

## Collection View (My Binder)
**File:** `src/components/views/CollectionView.tsx`

```tsx
'use client';

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Card } from '@/lib/types';
import { CardDisplay } from '../CardDisplay';
import { ControlSection } from '../UI';

interface CollectionViewProps {
    collection: Card[];
}

export const CollectionView: React.FC<CollectionViewProps> = ({ collection }) => {
    return (
        <div className="flex h-full">
            <main className="flex-1 relative overflow-auto p-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 p-4">
                    {collection.map((card) => (
                        <CardDisplay key={card.id} card={card} />
                    ))}
                </div>
                {collection.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <LayoutGrid size={80} className="text-white mb-6" />
                        <p className="font-black uppercase tracking-[0.5em] text-xs text-white text-center">Empty Binder Capacity</p>
                    </div>
                )}
            </main>

            <aside className="w-85 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-y-auto p-8 relative z-20">
                <ControlSection title="Gallery Index">
                    <div className="grid grid-cols-2 gap-3">
                        {['Pokemon', 'Yu-Gi-Oh!', 'Magic', 'All'].map((game) => (
                            <button
                                key={game}
                                className="px-4 py-3 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all text-zinc-500 hover:text-white"
                            >
                                {game}
                            </button>
                        ))}
                    </div>
                </ControlSection>

                <ControlSection title="Recent Transfers">
                    <div className="space-y-4">
                        {collection.slice(-10).reverse().map((card) => (
                            <div key={card.id} className="text-[10px] font-bold text-zinc-600 leading-relaxed border-b border-white/5 pb-2 last:border-0">
                                <span className="text-red-500/60 mr-2">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                                <span className="text-white">TRANSFERRED:</span> {card.name}
                            </div>
                        ))}
                    </div>
                </ControlSection>
            </aside>
        </div>
    );
};
```

---

## Profile View
**File:** `src/components/views/ProfileView.tsx`

```tsx
'use client';

import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { ControlSection } from '../UI';

interface ProfileViewProps {
    user: UserProfile;
    collectionCount: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, collectionCount }) => {
    return (
        <div className="flex h-full">
            <main className="flex-1 relative overflow-auto p-12 text-white">
                <div className="max-w-2xl mx-auto space-y-12">
                    <div className="flex items-center space-x-10 bg-black/40 backdrop-blur-3xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
                        <div className="w-28 h-28 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                            <User size={56} className="text-white/20" />
                            <div className="absolute inset-0 bg-red-600/10 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-1">{user.username}</h3>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                <p className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em]">Verified Collective</p>
                            </div>

                            <div className="flex space-x-10 mt-8 border-t border-white/5 pt-6">
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Asset Credits</p>
                                    <p className="text-2xl font-black text-white">{user.balance}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Data Bindings</p>
                                    <p className="text-2xl font-black text-white">{collectionCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <aside className="w-85 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-y-auto p-8 relative z-20">
                <ControlSection title="Privacy Protocols">
                    <div className="space-y-3">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-red-600/30 transition-all group">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Security Node</span>
                            <ChevronRight size={16} className="text-white/20 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-red-600/30 transition-all group">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Interface Prefs</span>
                            <ChevronRight size={16} className="text-white/20 group-hover:text-red-500 transition-colors" />
                        </div>
                    </div>
                </ControlSection>
            </aside>
        </div>
    );
};
```

---

## Types Definition
**File:** `src/lib/types.ts`

```ts
export type GameType = 'Pokemon' | 'Yu-Gi-Oh!' | 'Magic';

export interface Card {
    id: string;
    name: string;
    type: string;
    rarity: string;
    imageUrl: string;
    game: GameType;
    price?: number;
}

export interface Pack {
    id: string;
    name: string;
    game: GameType;
    price: number;
    imageUrl?: string;
}

export interface InventoryItem {
    packId: string;
    count: number;
}

export interface UserProfile {
    id: string;
    username: string;
    avatar: string | null;
    balance: number;
    inventory: InventoryItem[];
}
```

---

## Mock Data
**File:** `src/lib/mockData.ts`

```ts
import { Card, Pack, UserProfile } from './types';

export const MOCK_CARDS: Card[] = [
    // Pokemon
    {
        id: 'p1',
        name: 'Charizard',
        type: 'Fire',
        rarity: 'Ultra Rare',
        imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
        game: 'Pokemon',
    },
    {
        id: 'p2',
        name: 'Blastoise',
        type: 'Water',
        rarity: 'Rare Holo',
        imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
        game: 'Pokemon',
    },
    {
        id: 'p3',
        name: 'Venusaur',
        type: 'Grass',
        rarity: 'Rare Holo',
        imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png',
        game: 'Pokemon',
    },
    // Yu-Gi-Oh
    {
        id: 'y1',
        name: 'Blue-Eyes White Dragon',
        type: 'Dragon/Normal',
        rarity: 'Ultra Rare',
        imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
        game: 'Yu-Gi-Oh!',
    },
    {
        id: 'y2',
        name: 'Dark Magician',
        type: 'Spellcaster/Normal',
        rarity: 'Ultra Rare',
        imageUrl: 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
        game: 'Yu-Gi-Oh!',
    },
    {
        id: 'y3',
        name: 'Exodia the Forbidden One',
        type: 'Spellcaster/Effect',
        rarity: 'Ultra Rare',
        imageUrl: 'https://images.ygoprodeck.com/images/cards/33396948.jpg',
        game: 'Yu-Gi-Oh!',
    },
    // Magic
    {
        id: 'm1',
        name: 'Black Lotus',
        type: 'Artifact',
        rarity: 'Rare',
        imageUrl: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
        game: 'Magic',
    },
    {
        id: 'm2',
        name: 'Ancestral Recall',
        type: 'Instant',
        rarity: 'Rare',
        imageUrl: 'https://cards.scryfall.io/large/front/2/3/2359af08-4156-48bd-8ef6-0c121d919d9b.jpg',
        game: 'Magic',
    },
    {
        id: 'm3',
        name: 'Time Walk',
        type: 'Sorcery',
        rarity: 'Rare',
        imageUrl: 'https://cards.scryfall.io/large/front/7/0/70901356-3266-4bd9-aacc-f06c27271de5.jpg',
        game: 'Magic',
    }
];

export const MOCK_PACKS: Pack[] = [
    { id: 'pk-p1', name: 'Pokemon Base Set', game: 'Pokemon', price: 500 },
    { id: 'pk-y1', name: 'Legend of Blue Eyes', game: 'Yu-Gi-Oh!', price: 400 },
    { id: 'pk-m1', name: 'MTG Alpha Edition', game: 'Magic', price: 1000 },
];

export let MOCK_USER: UserProfile = {
    id: 'u1',
    username: 'StreetCollector',
    avatar: null,
    balance: 2500,
    inventory: [
        { packId: 'pk-p1', count: 2 },
        { packId: 'pk-y1', count: 5 },
    ],
};

export let MOCK_COLLECTION: Card[] = [
    MOCK_CARDS[0],
    MOCK_CARDS[3],
];

export const updateMockUser = (newUser: UserProfile) => {
    MOCK_USER = newUser;
};

export const addToCollection = (cards: Card[]) => {
    MOCK_COLLECTION = [...MOCK_COLLECTION, ...cards];
};
```

---

## Global Styles
**File:** `src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```
