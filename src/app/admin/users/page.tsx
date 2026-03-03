"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Package, Layers, Shield, UserCog, X, Plus, Minus, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  cards_count: string;
  packs_available: string;
  packs: { pack_id: string; name: string; count: number }[];
}

interface Set {
  id: string;
  name: string;
  game: string;
  cards_count: string;
}

interface Card {
  id: string;
  name: string;
  rarity: string;
  image_url: string | null;
  number: string | null;
}

const navItems = [
  { id: 'dashboard', label: 'Panel', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Sobres', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: UserCog, href: '/admin/transactions' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const pathname = usePathname();

  // Assign modal state
  const [assignTab, setAssignTab] = useState<'sets' | 'cards'>('sets');
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedSet, setSelectedSet] = useState<Set | null>(null);
  const [setCards, setSetCards] = useState<Card[]>([]);
  const [setQuantity, setSetQuantity] = useState(1);
  const [cardSearch, setCardSearch] = useState('');
  const [searchedCards, setSearchedCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Map<string, number>>(new Map());
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchSets();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Error fetching users');
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSets = async () => {
    try {
      const res = await fetch('/api/admin/sets');
      if (res.ok) {
        const data = await res.json();
        setSets(data.sets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSetCards = async (setId: string) => {
    try {
      const res = await fetch(`/api/admin/sets?setId=${setId}`);
      if (res.ok) {
        const data = await res.json();
        setSetCards(data.cards || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const searchCards = async (query: string) => {
    if (query.length < 2) {
      setSearchedCards([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/search-cards?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchedCards(data.cards || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: selectedUser.id, newRole }),
      });

      if (!res.ok) throw new Error('Error updating role');

      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignSet = async () => {
    if (!selectedUser || !selectedSet) return;
    
    setAssigning(true);
    setAssignSuccess(null);
    
    try {
      const res = await fetch('/api/admin/assign-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          setId: selectedSet.id,
          quantity: setQuantity
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setAssignSuccess(data.message);
      setTimeout(() => {
        setShowAssignModal(false);
        resetAssignState();
        fetchUsers();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error al asignar');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignCards = async () => {
    if (!selectedUser || selectedCards.size === 0) return;
    
    setAssigning(true);
    setAssignSuccess(null);
    
    const cards = Array.from(selectedCards.entries()).map(([cardId, quantity]) => ({
      cardId,
      quantity
    }));

    try {
      const res = await fetch('/api/admin/assign-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          cards
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setAssignSuccess(data.message);
      setTimeout(() => {
        setShowAssignModal(false);
        resetAssignState();
        fetchUsers();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Error al asignar');
    } finally {
      setAssigning(false);
    }
  };

  const resetAssignState = () => {
    setAssignTab('sets');
    setSelectedSet(null);
    setSetCards([]);
    setSetQuantity(1);
    setCardSearch('');
    setSearchedCards([]);
    setSelectedCards(new Map());
    setAssignSuccess(null);
  };

  const openAssignModal = (user: User) => {
    setSelectedUser(user);
    setShowAssignModal(true);
    resetAssignState();
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Map(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.set(cardId, 1);
    }
    setSelectedCards(newSelection);
  };

  const updateCardQuantity = (cardId: string, delta: number) => {
    const newSelection = new Map(selectedCards);
    const current = newSelection.get(cardId) || 0;
    const newQty = Math.max(1, current + delta);
    newSelection.set(cardId, newQty);
    setSelectedCards(newSelection);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'mod':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
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
                <h1 className="text-3xl font-bold text-white mb-2">Usuarios</h1>
                <p className="text-zinc-400">{users.length} usuarios registrados</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Usuario</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Rol</th>
                    <th className="text-center p-4 text-sm font-medium text-zinc-400">Cartas</th>
                    <th className="text-center p-4 text-sm font-medium text-zinc-400">Packs</th>
                    <th className="text-center p-4 text-sm font-medium text-zinc-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{user.username}</span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-400">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-center text-white font-medium">
                        {user.cards_count || 0}
                      </td>
                      <td className="p-4 text-center text-white font-medium">
                        {user.packs_available || 0}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openAssignModal(user)}
                            className="px-3 py-1.5 bg-green-600/10 border border-green-600/20 rounded-lg text-sm text-green-400 hover:text-green-300 hover:bg-green-600/20 transition-colors"
                          >
                            Asignar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setShowRoleModal(true);
                            }}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            Rol
                          </button>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="px-3 py-1.5 bg-red-600/10 border border-red-600/20 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-600/20 transition-colors"
                          >
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Role Modal */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-white mb-4">Cambiar Rol</h2>
              <p className="text-zinc-400 mb-4">
                Usuario: <span className="text-white">{selectedUser.username}</span>
              </p>
              <div className="space-y-2 mb-6">
                {['user', 'mod', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`w-full p-3 rounded-xl border text-left transition-colors ${
                      newRole === role
                        ? 'bg-red-600/10 border-red-600/30 text-red-400'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-medium capitalize">{role}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRoleChange}
                  className="flex-1 py-2 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !assigning && setShowAssignModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white">Asignar Items</h2>
                  <p className="text-sm text-zinc-500">
                    Usuario: <span className="text-white">{selectedUser.username}</span>
                  </p>
                </div>
                <button
                  onClick={() => !assigning && setShowAssignModal(false)}
                  className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5">
                <button
                  onClick={() => setAssignTab('sets')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    assignTab === 'sets'
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="h-4 w-4 inline mr-2" />
                  Asignar Set
                </button>
                <button
                  onClick={() => setAssignTab('cards')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    assignTab === 'cards'
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  Cartas Específicas
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {assignSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-16 w-16 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-green-400 font-medium text-center">{assignSuccess}</p>
                  </div>
                ) : assignTab === 'sets' ? (
                  <div className="space-y-4">
                    {/* Set Selection */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Seleccionar Set</label>
                      <select
                        value={selectedSet?.id || ''}
                        onChange={(e) => {
                          const set = sets.find(s => s.id === e.target.value);
                          setSelectedSet(set || null);
                          if (set) fetchSetCards(set.id);
                        }}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600/50"
                      >
                        <option value="">Selecciona un set...</option>
                        {sets.map((set) => (
                          <option key={set.id} value={set.id}>
                            {set.name} ({set.game}) - {set.cards_count} cartas
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Cantidad por carta</label>
                      <input
                        type="number"
                        min="1"
                        value={setQuantity}
                        onChange={(e) => setSetQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600/50"
                      />
                    </div>

                    {/* Preview */}
                    {selectedSet && (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-zinc-400">Set seleccionado:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGameBadge(selectedSet.game)}`}>
                            {selectedSet.game}
                          </span>
                        </div>
                        <p className="text-white font-medium">{selectedSet.name}</p>
                        <p className="text-sm text-zinc-500 mt-1">
                          {setCards.length} cartas × {setQuantity} = <span className="text-amber-400 font-medium">{setCards.length * setQuantity} cartas totales</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Card Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Buscar cartas (mínimo 2 caracteres)..."
                        value={cardSearch}
                        onChange={(e) => {
                          setCardSearch(e.target.value);
                          searchCards(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50"
                      />
                    </div>

                    {/* Search Results */}
                    {searchedCards.length > 0 && (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl max-h-48 overflow-y-auto">
                        {searchedCards.map((card) => (
                          <button
                            key={card.id}
                            onClick={() => toggleCardSelection(card.id)}
                            className={`w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors ${
                              selectedCards.has(card.id) ? 'bg-green-600/10' : ''
                            }`}
                          >
                            <div className="text-left">
                              <p className="text-white font-medium">{card.name}</p>
                              <p className="text-xs text-zinc-500">{card.rarity}</p>
                            </div>
                            {selectedCards.has(card.id) && (
                              <Check className="h-5 w-5 text-green-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Cards */}
                    {selectedCards.size > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-zinc-400">Cartas seleccionadas:</p>
                        {Array.from(selectedCards.entries()).map(([cardId, quantity]) => {
                          const card = searchedCards.find(c => c.id === cardId);
                          if (!card) return null;
                          return (
                            <div
                              key={cardId}
                              className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl"
                            >
                              <div>
                                <p className="text-white font-medium">{card.name}</p>
                                <p className="text-xs text-zinc-500">{card.rarity}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateCardQuantity(cardId, -1)}
                                  className="p-1 bg-white/5 rounded-lg text-zinc-400 hover:text-white"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-white font-medium w-8 text-center">{quantity}</span>
                                <button
                                  onClick={() => updateCardQuantity(cardId, 1)}
                                  className="p-1 bg-white/5 rounded-lg text-zinc-400 hover:text-white"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => toggleCardSelection(cardId)}
                                  className="p-1 bg-red-600/10 rounded-lg text-red-400 hover:bg-red-600/20"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-sm text-amber-400 font-medium">
                          Total: {Array.from(selectedCards.values()).reduce((a, b) => a + b, 0)} cartas
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!assignSuccess && (
                <div className="flex gap-3 p-6 border-t border-white/5">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    disabled={assigning}
                    className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={assignTab === 'sets' ? handleAssignSet : handleAssignCards}
                    disabled={assigning || (assignTab === 'sets' ? !selectedSet : selectedCards.size === 0)}
                    className="flex-1 py-2 bg-green-600 rounded-xl text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Asignar
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}