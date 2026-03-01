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
