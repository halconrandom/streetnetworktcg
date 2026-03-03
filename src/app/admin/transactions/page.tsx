"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { History, Search, Filter, Shield, Users, Package, Layers, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Transaction {
  id: string;
  action_type: string;
  action_data: Record<string, unknown>;
  created_at: string;
  user_name: string;
  user_email: string;
  admin_name: string | null;
}

const navItems = [
  { id: 'dashboard', label: 'Panel', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Sobres', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: UserCog, href: '/admin/transactions' },
];

const actionTypeLabels: Record<string, string> = {
  pack_assignment: 'Asignación de Pack',
  role_change: 'Cambio de Rol',
  pack_opened: 'Pack Abierto',
};

const actionTypeColors: Record<string, string> = {
  pack_assignment: 'bg-green-500/20 text-green-400 border-green-500/30',
  role_change: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  pack_opened: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    fetchTransactions(0, true);
  }, []);

  const fetchTransactions = async (newOffset: number, reset = false) => {
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.append('actionType', actionFilter);
      params.append('limit', '20');
      params.append('offset', newOffset.toString());

      const res = await fetch(`/api/admin/transactions?${params.toString()}`);
      if (!res.ok) throw new Error('Error fetching transactions');
      const data = await res.json();

      if (reset) {
        setTransactions(data.transactions);
      } else {
        setTransactions((prev) => [...prev, ...data.transactions]);
      }
      setHasMore(data.pagination.hasMore);
      setOffset(newOffset);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) {
      fetchTransactions(offset + 20);
    }
  };

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.user_name.toLowerCase().includes(search.toLowerCase()) ||
      tx.action_type.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                <h1 className="text-3xl font-bold text-white mb-2">Transacciones</h1>
                <p className="text-zinc-400">Historial de actividad de la plataforma</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-600/50"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <select
                    value={actionFilter}
                    onChange={(e) => {
                      setActionFilter(e.target.value);
                      fetchTransactions(0, true);
                    }}
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-600/50 appearance-none"
                  >
                    <option value="">Todas</option>
                    <option value="pack_assignment">Asignaciones</option>
                    <option value="role_change">Cambios de rol</option>
                    <option value="pack_opened">Packs abiertos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Tipo</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Usuario</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Detalles</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-400">Admin</th>
                    <th className="text-right p-4 text-sm font-medium text-zinc-400">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            actionTypeColors[tx.action_type] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                          }`}
                        >
                          {actionTypeLabels[tx.action_type] || tx.action_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{tx.user_name}</p>
                          <p className="text-xs text-zinc-500">{tx.user_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-zinc-300">
                          {tx.action_type === 'pack_assignment' && (
                            <>
                              {tx.action_data.quantity as number} pack(s) asignado(s)
                            </>
                          )}
                          {tx.action_type === 'role_change' && (
                            <>
                              Nuevo rol: <span className="text-amber-400">{tx.action_data.newRole as string}</span>
                            </>
                          )}
                          {tx.action_type === 'pack_opened' && (
                            <>
                              Pack abierto
                            </>
                          )}
                        </p>
                      </td>
                      <td className="p-4 text-zinc-400">
                        {tx.admin_name || '-'}
                      </td>
                      <td className="p-4 text-right text-sm text-zinc-500">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {hasMore && (
                <div className="p-4 text-center border-t border-white/5">
                  <button
                    onClick={loadMore}
                    className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cargar más
                  </button>
                </div>
              )}

              {filteredTransactions.length === 0 && (
                <div className="p-8 text-center">
                  <History className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">No hay transacciones</p>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}