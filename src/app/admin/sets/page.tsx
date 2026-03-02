"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Layers, ChevronDown, Shield, Users, Package, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Set {
  id: string;
  name: string;
  game: string;
  series: string | null;
  printed_total: number | null;
  release_date: string | null;
  logo_url: string | null;
  tcg_id: string | null;
  cards_count: string;
  packs_count: string;
}

interface RarityConfig {
  id: string;
  rarity: string;
  weight: number;
  minPerPack: number;
  maxPerPack: number;
  isGuaranteed: boolean;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Packs', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: UserCog, href: '/admin/transactions' },
];

export default function AdminSetsPage() {
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const [rarityConfig, setRarityConfig] = useState<RarityConfig[]>([]);
  const [gameFilter, setGameFilter] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const res = await fetch('/api/admin/sets');
      if (!res.ok) throw new Error('Error fetching sets');
      const data = await res.json();
      setSets(data.sets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRarityConfig = async (setId: string) => {
    try {
      const res = await fetch(`/api/admin/rarity-config?setId=${setId}`);
      if (!res.ok) throw new Error('Error fetching rarity config');
      const data = await res.json();
      setRarityConfig(data.config);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExpand = (setId: string) => {
    if (expandedSet === setId) {
      setExpandedSet(null);
    } else {
      setExpandedSet(setId);
      fetchRarityConfig(setId);
    }
  };

  const getGameBadge = (game: string) => {
    switch (game) {
      case 'Pokemon':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Yu-Gi-Oh!':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Magic':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const filteredSets = gameFilter
    ? sets.filter((s) => s.game === gameFilter)
    : sets;

  const groupedSets = filteredSets.reduce((acc, set) => {
    if (!acc[set.game]) acc[set.game] = [];
    acc[set.game].push(set);
    return acc;
  }, {} as Record<string, Set[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-600/20">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Admin</span>
                <span className="text-xs text-zinc-500 block">Street Games</span>
              </div>
            </Link>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-600/10 text-red-500 border border-red-600/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Sets</h1>
                <p className="text-zinc-400">{sets.length} sets disponibles</p>
              </div>
              <div className="flex gap-2">
                {['', 'Pokemon', 'Yu-Gi-Oh!', 'Magic'].map((game) => (
                  <button
                    key={game}
                    onClick={() => setGameFilter(game)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      gameFilter === game
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {game || 'Todos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sets by Game */}
            {Object.entries(groupedSets).map(([game, gameSets]) => (
              <div key={game} className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGameBadge(game)}`}>
                    {game}
                  </span>
                  {gameSets.length} sets
                </h2>

                <div className="space-y-3">
                  {gameSets.map((set) => (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => handleExpand(set.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {set.logo_url && (
                            <img
                              src={set.logo_url}
                              alt={set.name}
                              className="h-10 w-auto object-contain"
                            />
                          )}
                          <div className="text-left">
                            <h3 className="font-medium text-white">{set.name}</h3>
                            <p className="text-sm text-zinc-500">
                              {set.series} {set.release_date ? `• ${new Date(set.release_date).getFullYear()}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{set.cards_count} cartas</p>
                            <p className="text-xs text-zinc-500">{set.packs_count} packs</p>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 text-zinc-400 transition-transform ${
                              expandedSet === set.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {expandedSet === set.id && (
                        <div className="border-t border-white/5 p-4">
                          <h4 className="text-sm font-medium text-zinc-400 mb-3">Configuración de Rarezas</h4>
                          {rarityConfig.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {rarityConfig.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="bg-white/[0.02] rounded-lg p-3 border border-white/5"
                                >
                                  <p className="text-sm font-medium text-white">{slot.rarity}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-zinc-500">
                                      {(slot.weight * 100).toFixed(1)}%
                                    </span>
                                    {slot.isGuaranteed && (
                                      <span className="text-xs text-amber-500">Garantizado</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-1">
                                    {slot.minPerPack}-{slot.maxPerPack} por pack
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500">
                              Sin configuración de rarezas
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}