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

interface Pack {
  id: string;
  name: string;
  card_count: number;
  image_url: string | null;
  set_name: string | null;
  set_logo: string | null;
  game: string | null;
  series: string | null;
  pokemon_count?: number;
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

  // Assign packs modal state
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<Map<string, { pack: Pack; quantity: number }>>(new Map());
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [gameFilter, setGameFilter] = useState<string>('');
  const [seriesFilter, setSeriesFilter] = useState<string>('');
  const [packSearch, setPackSearch] = useState<string>('');
  const [pokemonSearch, setPokemonSearch] = useState<string>('');
  const [activePackId, setActivePackId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchPacks();
  }, []);

  // Debounce para búsqueda de Pokémon
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pokemonSearch.length >= 2) {
        fetchPacks(pokemonSearch);
        setGameFilter('');
        setSeriesFilter('');
      } else if (pokemonSearch.length === 0) {
        fetchPacks();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pokemonSearch]);

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

  const fetchPacks = async (pokemon?: string) => {
    try {
      const params = new URLSearchParams();
      if (pokemon && pokemon.length >= 2) {
        params.append('pokemon', pokemon);
      }
      const res = await fetch(`/api/admin/packs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPacks(data.packs);
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

  const handleAssignPacks = async () => {
    if (!selectedUser || selectedPacks.size === 0) return;
    
    setAssigning(true);
    setAssignSuccess(null);
    
    try {
      // Assign each pack
      for (const [packId, { quantity }] of selectedPacks) {
        const res = await fetch('/api/admin/assign-packs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: selectedUser.id,
            packId,
            quantity
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      const totalPacks = Array.from(selectedPacks.values()).reduce((a, b) => a + b.quantity, 0);
      setAssignSuccess(`¡${totalPacks} sobres asignados a ${selectedUser.username}!`);
      
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
    setSelectedPacks(new Map());
    setAssignSuccess(null);
    setGameFilter('');
    setSeriesFilter('');
    setPackSearch('');
    setPokemonSearch('');
    setActivePackId(null);
  };

  const openAssignModal = (user: User) => {
    setSelectedUser(user);
    setShowAssignModal(true);
    resetAssignState();
  };

  const togglePackSelection = (pack: Pack) => {
    // Si ya está seleccionado, lo quitamos
    if (selectedPacks.has(pack.id)) {
      const newSelection = new Map(selectedPacks);
      newSelection.delete(pack.id);
      setSelectedPacks(newSelection);
      setActivePackId(null);
    } else {
      // Si no está seleccionado, activamos el selector de cantidad
      setActivePackId(pack.id);
    }
  };

  const confirmPackSelection = (pack: Pack, quantity: number) => {
    const newSelection = new Map(selectedPacks);
    newSelection.set(pack.id, { pack, quantity });
    setSelectedPacks(newSelection);
    setActivePackId(null);
  };

  const updatePackQuantity = (packId: string, delta: number) => {
    const newSelection = new Map(selectedPacks);
    const current = newSelection.get(packId);
    if (current) {
      const newQty = Math.max(1, current.quantity + delta);
      newSelection.set(packId, { ...current, quantity: newQty });
      setSelectedPacks(newSelection);
    }
  };

  const removePack = (packId: string) => {
    const newSelection = new Map(selectedPacks);
    newSelection.delete(packId);
    setSelectedPacks(newSelection);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPacks = pokemonSearch.length >= 2 
    ? packs // Si hay búsqueda de Pokémon, la API ya filtró
    : packs.filter(p => {
      if (gameFilter && p.game !== gameFilter) return false;
      if (seriesFilter && p.series !== seriesFilter) return false;
      if (packSearch) {
        const search = packSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(search);
        const matchesSet = p.set_name?.toLowerCase().includes(search);
        if (!matchesName && !matchesSet) return false;
      }
      return true;
    });

  // Obtener series únicas del juego seleccionado
  const availableSeries = gameFilter 
    ? [...new Set(packs.filter(p => p.game === gameFilter && p.series).map(p => p.series))]
    : [...new Set(packs.filter(p => p.series).map(p => p.series))];

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

      {/* Assign Packs Modal */}
      <AnimatePresence>
        {showAssignModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !assigning && setShowAssignModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white">Asignar Sobres</h2>
                  <p className="text-sm text-zinc-500">
                    Usuario: <span className="text-white font-medium">{selectedUser.username}</span>
                  </p>
                </div>
                <button
                  onClick={() => !assigning && setShowAssignModal(false)}
                  className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
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
                ) : (
                  <div className="space-y-6">
                    {/* Search and Filters */}
                    <div className="space-y-3">
                      {/* Pokemon Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                        <input
                          type="text"
                          placeholder="Buscar Pokémon (ej: Pikachu, Charizard...)"
                          value={pokemonSearch}
                          onChange={(e) => setPokemonSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-amber-600/10 border border-amber-600/30 rounded-xl text-white placeholder-amber-500/50 focus:outline-none focus:border-amber-500"
                        />
                        {pokemonSearch && (
                          <button
                            onClick={() => { setPokemonSearch(''); fetchPacks(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Pack/Set Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Buscar pack o set..."
                          value={packSearch}
                          onChange={(e) => setPackSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50"
                        />
                      </div>
                      
                      {/* Game Filter */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => { setGameFilter(''); setSeriesFilter(''); }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            gameFilter === '' ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'
                          }`}
                        >
                          Todos
                        </button>
                        {['Pokemon', 'Yu-Gi-Oh!', 'Magic'].map((game) => (
                          <button
                            key={game}
                            onClick={() => { setGameFilter(game); setSeriesFilter(''); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              gameFilter === game ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {game}
                          </button>
                        ))}
                      </div>

                      {/* Series Filter (only for Pokemon) */}
                      {gameFilter === 'Pokemon' && availableSeries.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setSeriesFilter('')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              seriesFilter === '' ? 'bg-amber-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            Todas las series
                          </button>
                          {availableSeries.slice(0, 8).map((series) => (
                            <button
                              key={series}
                              onClick={() => setSeriesFilter(series || '')}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                seriesFilter === series ? 'bg-amber-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {series}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Results count */}
                    <p className="text-sm text-zinc-500">
                      {pokemonSearch.length >= 2 ? (
                        <>
                          {filteredPacks.length} packs con <span className="text-amber-400 font-medium">{pokemonSearch}</span>
                          {filteredPacks.some(p => p.pokemon_count) && (
                            <span className="text-zinc-400 ml-2">
                              ({filteredPacks.reduce((a, p) => a + (Number(p.pokemon_count) || 0), 0)} cartas encontradas)
                            </span>
                          )}
                        </>
                      ) : (
                        <>{filteredPacks.length} packs encontrados</>
                      )}
                    </p>

                    {/* Packs Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredPacks.map((pack) => {
                        const isSelected = selectedPacks.has(pack.id);
                        const isActive = activePackId === pack.id;
                        const selectedData = selectedPacks.get(pack.id);
                        
                        return (
                          <div
                            key={pack.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isActive
                                ? 'bg-amber-600/10 border-amber-600/30'
                                : isSelected
                                ? 'bg-green-600/10 border-green-600/30'
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                            }`}
                          >
                            {/* Pack Info */}
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                {pack.image_url || pack.set_logo ? (
                                  <img
                                    src={pack.image_url || pack.set_logo || ''}
                                    alt={pack.name}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-zinc-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{pack.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{pack.set_name || 'Pack personalizado'}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getGameBadge(pack.game)}`}>
                                {pack.game || 'N/A'}
                              </span>
                              <div className="flex items-center gap-2">
                                {pokemonSearch.length >= 2 && pack.pokemon_count && (
                                  <span className="text-xs text-amber-400 font-medium">
                                    {pack.pokemon_count}x
                                  </span>
                                )}
                                <span className="text-xs text-zinc-500">{pack.card_count} cartas</span>
                              </div>
                            </div>

                            {/* Quantity Selector or Action Button */}
                            {isActive ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    onClick={() => {
                                      const current = selectedPacks.get(pack.id);
                                      const qty = current?.quantity || 1;
                                      if (qty > 1) {
                                        const newSelection = new Map(selectedPacks);
                                        newSelection.set(pack.id, { pack, quantity: qty - 1 });
                                        setSelectedPacks(newSelection);
                                      }
                                    }}
                                    className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="text-white font-bold text-lg w-12 text-center">
                                    {selectedData?.quantity || 1}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const current = selectedPacks.get(pack.id);
                                      const qty = (current?.quantity || 1) + 1;
                                      const newSelection = new Map(selectedPacks);
                                      newSelection.set(pack.id, { pack, quantity: qty });
                                      setSelectedPacks(newSelection);
                                    }}
                                    className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setActivePackId(null)}
                                    className="flex-1 py-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white text-sm"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => confirmPackSelection(pack, selectedData?.quantity || 1)}
                                    className="flex-1 py-2 bg-green-600 rounded-lg text-white text-sm font-medium hover:bg-green-700"
                                  >
                                    Confirmar
                                  </button>
                                </div>
                              </div>
                            ) : isSelected ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="text-green-400 font-medium">{selectedData?.quantity}x</span>
                                </div>
                                <button
                                  onClick={() => togglePackSelection(pack)}
                                  className="text-xs text-red-400 hover:text-red-300"
                                >
                                  Quitar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => togglePackSelection(pack)}
                                className="w-full py-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 text-sm transition-colors"
                              >
                                Seleccionar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Packs */}
                    {selectedPacks.size > 0 && (
                      <div className="space-y-3 border-t border-white/5 pt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-zinc-400">Sobres seleccionados ({selectedPacks.size})</p>
                          <button
                            onClick={() => setSelectedPacks(new Map())}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Limpiar todo
                          </button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {Array.from(selectedPacks.entries()).map(([packId, { pack, quantity }]) => (
                            <div
                              key={packId}
                              className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl"
                            >
                              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                {pack.image_url || pack.set_logo ? (
                                  <img
                                    src={pack.image_url || pack.set_logo || ''}
                                    alt={pack.name}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-zinc-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{pack.name}</p>
                                <p className="text-xs text-zinc-500">{pack.card_count} cartas c/u</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updatePackQuantity(packId, -1)}
                                  className="p-1.5 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-white font-medium w-8 text-center">{quantity}</span>
                                <button
                                  onClick={() => updatePackQuantity(packId, 1)}
                                  className="p-1.5 bg-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => removePack(packId)}
                                  className="p-1.5 bg-red-600/10 rounded-lg text-red-400 hover:bg-red-600/20 ml-2"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-zinc-400">Total de sobres:</span>
                          <span className="text-lg font-bold text-amber-400">
                            {Array.from(selectedPacks.values()).reduce((a, b) => a + b.quantity, 0)} sobres
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!assignSuccess && (
                <div className="flex gap-3 p-6 border-t border-white/5 bg-[#0a0a0a]/50">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    disabled={assigning}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAssignPacks}
                    disabled={assigning || selectedPacks.size === 0}
                    className="flex-1 py-3 bg-green-600 rounded-xl text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Asignar Sobres
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