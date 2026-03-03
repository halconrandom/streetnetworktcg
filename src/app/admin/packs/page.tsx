"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Plus, Edit2, Trash2, Shield, Users, Layers, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Pack {
  id: string;
  name: string;
  price: number;
  card_count: number;
  description: string | null;
  image_url: string | null;
  is_custom: boolean;
  set_id: string | null;
  set_name: string | null;
  game: string | null;
  cards_in_set: string;
}

interface Set {
  id: string;
  name: string;
  game: string;
}

const navItems = [
  { id: 'dashboard', label: 'Panel', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Sobres', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: UserCog, href: '/admin/transactions' },
];

export default function AdminPacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    setId: '',
    price: 0,
    cardCount: 5,
    description: '',
    imageUrl: '',
  });
  const pathname = usePathname();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packsRes, setsRes] = await Promise.all([
        fetch('/api/admin/packs'),
        fetch('/api/admin/sets'),
      ]);

      if (packsRes.ok) {
        const packsData = await packsRes.json();
        setPacks(packsData.packs);
      }

      if (setsRes.ok) {
        const setsData = await setsRes.json();
        setSets(setsData.sets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingPack ? '/api/admin/packs' : '/api/admin/packs';
    const method = editingPack ? 'PUT' : 'POST';

    const body = editingPack
      ? { packId: editingPack.id, ...formData }
      : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Error saving pack');

      setShowModal(false);
      setEditingPack(null);
      setFormData({ name: '', setId: '', price: 0, cardCount: 5, description: '', imageUrl: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (packId: string) => {
    if (!confirm('¿Estás seguro de eliminar este pack?')) return;

    try {
      const res = await fetch(`/api/admin/packs?packId=${packId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
      }

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (pack: Pack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      setId: pack.set_id || '',
      price: pack.price,
      cardCount: pack.card_count,
      description: pack.description || '',
      imageUrl: pack.image_url || '',
    });
    setShowModal(true);
  };

  const getGameBadge = (game: string | null) => {
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
                <h1 className="text-3xl font-bold text-white mb-2">Sobres</h1>
                <p className="text-zinc-400">{packs.length} sobres disponibles</p>
              </div>
              <button
                onClick={() => {
                  setEditingPack(null);
                  setFormData({ name: '', setId: '', price: 0, cardCount: 5, description: '', imageUrl: '' });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Nuevo Sobre
              </button>
            </div>

            {/* Packs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packs.map((pack) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{pack.name}</h3>
                        <p className="text-sm text-zinc-500">{pack.set_name || 'Pack personalizado'}</p>
                      </div>
                      {pack.game && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGameBadge(pack.game)}`}>
                          {pack.game}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/[0.02] rounded-xl p-3">
                        <p className="text-xs text-zinc-500 mb-1">Precio</p>
                        <p className="text-lg font-bold text-amber-500">{pack.price.toLocaleString()} CR</p>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3">
                        <p className="text-xs text-zinc-500 mb-1">Cartas</p>
                        <p className="text-lg font-bold text-white">{pack.card_count}</p>
                      </div>
                    </div>

                    {pack.description && (
                      <p className="text-sm text-zinc-400 mb-4">{pack.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs text-zinc-500">
                        {pack.cards_in_set} cartas en el set
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(pack)}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pack.id)}
                          className="p-2 bg-red-600/10 border border-red-600/20 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-600/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPack ? 'Editar Sobre' : 'Nuevo Sobre'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Set</label>
                <select
                  value={formData.setId}
                  onChange={(e) => setFormData({ ...formData, setId: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600/50"
                >
                  <option value="">Seleccionar set...</option>
                  {sets.map((set) => (
                    <option key={set.id} value={set.id}>
                      {set.name} ({set.game})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Precio (CR)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Cartas por pack</label>
                  <input
                    type="number"
                    value={formData.cardCount}
                    onChange={(e) => setFormData({ ...formData, cardCount: parseInt(e.target.value) || 5 })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Descripción (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600/50 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 transition-colors"
                >
                  {editingPack ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}