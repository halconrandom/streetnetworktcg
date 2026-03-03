"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Package, Layers, History, Settings, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Stats {
  totalUsers: number;
  totalPacks: number;
  totalCards: number;
  totalTransactions: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  action_type: string;
  action_data: Record<string, unknown>;
  created_at: string;
  user_name: string;
  admin_name: string | null;
}

const navItems = [
  { id: 'dashboard', label: 'Panel', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Sobres', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: History, href: '/admin/transactions' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Error fetching stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Background Effects */}
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

          <div className="absolute bottom-6 left-3 right-3">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="h-5 w-5" />
              Volver al sitio
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
            <p className="text-zinc-400 mb-8">Resumen de la plataforma</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Usuarios"
                value={stats?.totalUsers || 0}
                icon={Users}
                color="red"
              />
              <StatCard
                title="Packs"
                value={stats?.totalPacks || 0}
                icon={Package}
                color="amber"
              />
              <StatCard
                title="Cartas"
                value={stats?.totalCards || 0}
                icon={Layers}
                color="green"
              />
              <StatCard
                title="Transacciones"
                value={stats?.totalTransactions || 0}
                icon={TrendingUp}
                color="blue"
              />
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Transacciones Recientes</h2>
              {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentTransactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-600/10 flex items-center justify-center">
                          <History className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{tx.action_type}</p>
                          <p className="text-xs text-zinc-500">
                            {tx.user_name} {tx.admin_name ? `• por ${tx.admin_name}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">No hay transacciones recientes</p>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { 
  title: string; 
  value: number; 
  icon: typeof Users;
  color: 'red' | 'amber' | 'green' | 'blue';
}) {
  const colors = {
    red: 'from-red-500/20 to-red-600/10 border-red-600/20 text-red-500',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-600/20 text-amber-500',
    green: 'from-green-500/20 to-green-600/10 border-green-600/20 text-green-500',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-600/20 text-blue-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-6 w-6 opacity-80" />
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</p>
      <p className="text-sm text-zinc-400">{title}</p>
    </motion.div>
  );
}