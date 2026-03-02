"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Collection } from '@/components/Collection';
import { PackOpener } from '@/components/PackOpener';
import { Store } from '@/components/Store';
import { UserProfile, Card, Pack } from '@/lib/types';
import { SignedIn, SignedOut, SignIn } from '@clerk/nextjs';

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'collection' | 'packs' | 'store'>('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [collection, setCollection] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, collRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/collection')
      ]);
      
      if (userRes.ok) {
        setUser(await userRes.json());
      }
      
      if (collRes.ok) {
        setCollection(await collRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const res = await fetch('/api/user');
    if (res.ok) {
      setUser(await res.json());
    }
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

  if (loading) {
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
    <>
      <SignedOut>
        <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/5 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
          </div>
          
          <div className="relative z-10 w-full max-w-md px-6">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formFieldInput: "w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-red-600/50 focus:ring-red-600/20 py-3 px-4",
                  formFieldLabel: "text-zinc-400 text-sm font-medium mb-2",
                  formButtonPrimary: "w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-3 transition-colors shadow-lg shadow-red-600/20",
                  footerActionLink: "text-red-500 hover:text-red-400 font-medium",
                  footerActionText: "text-zinc-500 text-sm",
                },
              }}
              signUpUrl="/sign-up"
              redirectUrl="/"
            />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {user && (
          <Layout activeTab={view} setActiveTab={setView} username={user.username} balance={user.balance}>
            {view === 'dashboard' && <Dashboard onNavigate={setView} />}
            {view === 'collection' && <Collection collection={collection} />}
            {view === 'packs' && <PackOpener user={user} onOpen={handleOpen} />}
            {view === 'store' && <Store onBuy={handleBuy} balance={user.balance} />}
          </Layout>
        )}
      </SignedIn>
    </>
  );
}
