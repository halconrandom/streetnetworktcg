"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ChevronDown, Shield, Users, Package, UserCog, X, Image as ImageIcon, Eye } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function CardThumb({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-zinc-600" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

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

interface Card {
  id: string;
  name: string;
  rarity: string;
  rarity_slug: string | null;
  image_url: string | null;
  number: string | null;
  supertype: string | null;
}

const navItems = [
  { id: 'dashboard', label: 'Panel', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Sobres', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: UserCog, href: '/admin/transactions' },
];

export default function AdminSetsPage() {
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const [rarityConfig, setRarityConfig] = useState<RarityConfig[]>([]);
  const [gameFilter, setGameFilter] = useState<string>('');
  const [cardsModal, setCardsModal] = useState<{ open: boolean; set: Set | null; cards: Card[]; loading: boolean }>({
    open: false,
    set: null,
    cards: [],
    loading: false,
  });
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

  const fetchCards = async (setId: string) => {
    setCardsModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/admin/sets?setId=${setId}`);
      if (!res.ok) throw new Error('Error fetching cards');
      const data = await res.json();
      setCardsModal(prev => ({ ...prev, cards: data.cards || [], loading: false }));
    } catch (err) {
      console.error(err);
      setCardsModal(prev => ({ ...prev, loading: false }));
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

  const openCardsModal = (set: Set) => {
    setCardsModal({ open: true, set, cards: [], loading: true });
    fetchCards(set.id);
  };

  const closeCardsModal = () => {
    setCardsModal({ open: false, set: null, cards: [], loading: false });
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

  // Logo URLs should already be correct from import
  const getLogoUrl = (url: string | null) => url;

  // Fix card image URL - TCGdex needs proper format
  const getCardImageUrl = (card: Card, set: Set | null) => {
    if (!card.image_url) return null;

    // Si ya tiene extensión, usar tal cual
    if (card.image_url.endsWith('.png') || card.image_url.endsWith('.jpg') || card.image_url.endsWith('.webp')) {
      return card.image_url;
    }

    // Si es de TCGdex sin extensión, construir URL correcta
    // Formato: https://assets.tcgdex.net/en/{setId}/{cardNumber}.jpg
    if (card.image_url.includes('assets.tcgdex.net')) {
      const tcgId = set?.tcg_id;
      if (tcgId && card.number) {
        return `https://assets.tcgdex.net/en/${tcgId}/${card.number}.jpg`;
      }
      // Fallback: agregar .jpg
      return `${card.image_url}.jpg`;
    }

    return card.image_url;
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${gameFilter === game
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
                  {gameSets.map((set) => {
                    const logoUrl = getLogoUrl(set.logo_url);
                    return (
                      <motion.div
                        key={set.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden"
                      >
                        <div className="p-4 flex items-center justify-between">
                          <button
                            onClick={() => handleExpand(set.id)}
                            className="flex items-center gap-4 flex-1 text-left hover:opacity-80 transition-opacity"
                          >
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={set.name}
                                className="h-10 w-auto object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-16 bg-white/5 rounded flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-zinc-600" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium text-white">{set.name}</h3>
                              <p className="text-sm text-zinc-500">
                                {set.series} {set.release_date ? `• ${new Date(set.release_date).getFullYear()}` : ''}
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">{set.cards_count} cartas</p>
                              <p className="text-xs text-zinc-500">{set.packs_count} packs</p>
                            </div>

                            {/* Ver cartas button */}
                            <button
                              onClick={() => openCardsModal(set)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/20 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-600/20 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              Ver cartas
                            </button>

                            <button onClick={() => handleExpand(set.id)}>
                              <ChevronDown
                                className={`h-5 w-5 text-zinc-400 transition-transform ${expandedSet === set.id ? 'rotate-180' : ''
                                  }`}
                              />
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedSet === set.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </main>
      </div>

      {/* Cards Modal */}
      <AnimatePresence>
        {cardsModal.open && cardsModal.set && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeCardsModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white">{cardsModal.set.name}</h2>
                  <p className="text-sm text-zinc-500">
                    {cardsModal.set.game} • {cardsModal.cards.length} cartas
                  </p>
                </div>
                <button
                  onClick={closeCardsModal}
                  className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                {cardsModal.loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : cardsModal.cards.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {cardsModal.cards.map((card) => (
                      <div
                        key={card.id}
                        className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden group"
                      >
                        <div className="aspect-[3/4] relative bg-zinc-800">
                          <CardThumb src={getCardImageUrl(card, cardsModal.set)} alt={card.name} />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-white truncate">{card.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getRarityBadge(card.rarity || card.rarity_slug || 'Common')}`}>
                              {(card.rarity || card.rarity_slug || 'Common').substring(0, 10)}
                            </span>
                            {card.number && (
                              <span className="text-[10px] text-zinc-500">#{card.number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Layers className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500">No hay cartas en este set</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}