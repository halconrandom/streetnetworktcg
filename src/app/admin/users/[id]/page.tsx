"use client";

import { use, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ArrowLeft, Shield, Users, Package, Layers, UserCog, Image as ImageIcon, Trash2, X, Minus, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RarityBadge } from '@/components/ui/RarityBadge';

interface UserData {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
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
  { id: 'dashboard', label: 'Panel', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Sobres', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: UserCog, href: '/admin/transactions' },
];

export default function UserCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const pathname = usePathname();

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<'card' | 'pack'>('card');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [deleteQuantity, setDeleteQuantity] = useState(1);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUserCollection();
  }, [resolvedParams.id]);

  const fetchUserCollection = async () => {
    try {
      const res = await fetch(`/api/admin/user-collection?userId=${resolvedParams.id}`);
      if (!res.ok) throw new Error('Error fetching user collection');
      const userData = await res.json();
      setData(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard || !data) return;
    
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/user-collection', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          cardId: selectedCard.id,
          quantity: deleteQuantity
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error deleting card');
      }

      setShowDeleteModal(false);
      setSelectedCard(null);
      setDeleteQuantity(1);
      fetchUserCollection();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePack = async () => {
    if (!selectedPack || !data) return;
    
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/user-packs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          packId: selectedPack.id,
          quantity: deleteQuantity
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error deleting pack');
      }

      setShowDeleteModal(false);
      setSelectedPack(null);
      setDeleteQuantity(1);
      fetchUserCollection();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const openCardDeleteModal = (card: Card) => {
    setSelectedCard(card);
    setDeleteType('card');
    setDeleteQuantity(1);
    setShowDeleteModal(true);
  };

  const openPackDeleteModal = (pack: Pack) => {
    setSelectedPack(pack);
    setDeleteType('pack');
    setDeleteQuantity(1);
    setShowDeleteModal(true);
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
                      className="bg-white/[0.02] border border-white/5 rounded-xl p-4 group relative"
                    >
                      <button
                        onClick={() => openPackDeleteModal(pack)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/10 border border-red-600/20 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                      className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden group relative"
                    >
                      <button
                        onClick={() => openCardDeleteModal(card)}
                        className="absolute top-2 left-2 z-10 p-1.5 bg-red-600/80 border border-red-600/20 rounded-lg text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                        <RarityBadge rarity={card.rarity} size="sm" />
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

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (selectedCard || selectedPack) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">
                  Eliminar {deleteType === 'card' ? 'Carta' : 'Sobre'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Item Info */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  {deleteType === 'card' && selectedCard ? (
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-zinc-800 overflow-hidden">
                        {selectedCard.image_url ? (
                          <Image
                            src={selectedCard.image_url}
                            alt={selectedCard.name}
                            width={48}
                            height={64}
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{selectedCard.name}</p>
                        <p className="text-xs text-zinc-500">{selectedCard.set_name}</p>
                        <p className="text-xs text-zinc-400">Tiene: {selectedCard.quantity}</p>
                      </div>
                    </div>
                  ) : selectedPack ? (
                    <div>
                      <p className="font-medium text-white">{selectedPack.name}</p>
                      <p className="text-xs text-zinc-500">{selectedPack.set_name}</p>
                      <p className="text-xs text-zinc-400">Tiene: {selectedPack.count}</p>
                    </div>
                  ) : null}
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Cantidad a eliminar</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDeleteQuantity(Math.max(1, deleteQuantity - 1))}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={deleteType === 'card' ? selectedCard?.quantity : selectedPack?.count}
                      value={deleteQuantity}
                      onChange={(e) => {
                        const max = deleteType === 'card' ? selectedCard?.quantity : selectedPack?.count;
                        setDeleteQuantity(Math.min(max || 1, Math.max(1, parseInt(e.target.value) || 1)));
                      }}
                      className="w-20 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-center focus:outline-none focus:border-red-600/50"
                    />
                    <button
                      onClick={() => {
                        const max = deleteType === 'card' ? selectedCard?.quantity : selectedPack?.count;
                        setDeleteQuantity(Math.min(max || 1, deleteQuantity + 1));
                      }}
                      className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const max = deleteType === 'card' ? selectedCard?.quantity : selectedPack?.count;
                        if (max) setDeleteQuantity(max);
                      }}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                      Todas
                    </button>
                  </div>
                </div>

                <p className="text-sm text-zinc-500">
                  Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-3 p-6 border-t border-white/5">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteType === 'card' ? handleDeleteCard : handleDeletePack}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}