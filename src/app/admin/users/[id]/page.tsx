"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { ArrowLeft, Shield, Users, Package, Layers, UserCog, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface UserData {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    balance: number;
    created_at: string;
  };
  inventory: Card[];
  cardsByGame: Record<string, Card[]>;
  packs: Pack[];
  stats: {
    totalCards: number;
    uniqueCards: number;
    byGame: { game: string; total: number; unique: number }[];
    totalPacks: number;
  };
}

interface Card {
  id: string;
  name: string;
  type: string;
  rarity: string;
  image_url: string;
  set_name: string;
  game: string;
  quantity: number;
}

interface Pack {
  id: string;
  name: string;
  set_name: string;
  game: string;
  count: number;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Packs', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: UserCog, href: '/admin/transactions' },
];

export default function UserCollectionPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    fetchUserCollection();
  }, [params.id]);

  const fetchUserCollection = async () => {
    try {
      const res = await fetch(`/api/admin/user-collection?userId=${params.id}`);
      if (!res.ok) throw new Error('Error fetching user collection');
      const userData = await res.json();
      setData(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const getRarityBadge = (rarity: string) => {
    const rarityColors: Record<string, string> = {
      'Common': 'bg-zinc-500/20 text-zinc-400',
      'Uncommon': 'bg-green-500/20 text-green-400',
      'Rare': 'bg-blue-500/20 text-blue-400',
      'Rare Holo': 'bg-cyan-500/20 text-cyan-400',
      'Ultra Rare': 'bg-purple-500/20 text-purple-400',
      'Illustration Rare': 'bg-pink-500/20 text-pink-400',
      'Special Illustration Rare': 'bg-rose-500/20 text-rose-400',
      'Hyper Rare': 'bg-amber-500/20 text-amber-400',
      'Secret Rare': 'bg-red-500/20 text-red-400',
    };
    return rarityColors[rarity] || 'bg-zinc-500/20 text-zinc-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="text-zinc-500">Usuario no encontrado</p>
      </div>
    );
  }

  const filteredCards = selectedGame
    ? data.cardsByGame[selectedGame] || []
    : data.inventory;

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
            {/* Back Button */}
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a usuarios
            </Link>

            {/* User Header */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-2xl font-bold">
                    {data.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{data.user.username}</h1>
                    <p className="text-zinc-400">{data.user.email}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        data.user.role === 'admin'
                          ? 'bg-red-500/20 text-red-400'
                          : data.user.role === 'mod'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-zinc-500/20 text-zinc-400'
                      }`}
                    >
                      {data.user.role}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-amber-500">{data.user.balance.toLocaleString()} CR</p>
                  <p className="text-sm text-zinc-500">Balance</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{data.stats.totalCards}</p>
                <p className="text-sm text-zinc-500">Cartas totales</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{data.stats.uniqueCards}</p>
                <p className="text-sm text-zinc-500">Cartas únicas</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{data.stats.totalPacks}</p>
                <p className="text-sm text-zinc-500">Packs disponibles</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{Object.keys(data.cardsByGame).length}</p>
                <p className="text-sm text-zinc-500">Juegos</p>
              </div>
            </div>

            {/* Packs */}
            {data.packs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Packs Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.packs.map((pack) => (
                    <div
                      key={pack.id}
                      className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{pack.name}</p>
                          <p className="text-sm text-zinc-500">{pack.set_name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGameBadge(pack.game)}`}>
                          {pack.game}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-amber-500 mt-2">{pack.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Colección</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGame('')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !selectedGame
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Todas
                  </button>
                  {Object.keys(data.cardsByGame).map((game) => (
                    <button
                      key={game}
                      onClick={() => setSelectedGame(game)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedGame === game
                          ? 'bg-red-600 text-white'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {game}
                    </button>
                  ))}
                </div>
              </div>

              {filteredCards.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredCards.slice(0, 50).map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden group"
                    >
                      <div className="aspect-[3/4] relative">
                        {card.image_url ? (
                          <Image
                            src={card.image_url}
                            alt={card.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-zinc-600" />
                          </div>
                        )}
                        {card.quantity > 1 && (
                          <span className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            x{card.quantity}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium text-white truncate">{card.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{card.set_name}</p>
                        <span
                          className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] ${getRarityBadge(
                            card.rarity
                          )}`}
                        >
                          {card.rarity}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">Este usuario no tiene cartas</p>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}