"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Collection } from '@/components/Collection';
import { PackOpener } from '@/components/PackOpener';
import { Store } from '@/components/Store';
import { UserProfile, Card, Pack } from '@/lib/types';

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'collection' | 'packs' | 'store'>('dashboard');
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
      if (res.ok) fetchUser();
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
        fetchData();
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
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col items-center space-y-4 relative z-10">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-bold text-[10px] uppercase tracking-widest text-zinc-500">Initializing Street Games...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={view} setActiveTab={setView} username={user.username} balance={user.balance}>
      {view === 'dashboard' && <Dashboard onNavigate={setView} />}
      {view === 'collection' && <Collection collection={collection} />}
      {view === 'packs' && <PackOpener user={user} onOpen={handleOpen} />}
      {view === 'store' && <Store onBuy={handleBuy} balance={user.balance} />}
    </Layout>
  );
}
