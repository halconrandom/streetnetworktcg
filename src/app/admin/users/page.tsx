"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Package, Layers, Shield, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface User {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  role: string;
  balance: number;
  created_at: string;
  cards_count: string;
  packs_available: string;
  packs: { pack_id: string; name: string; count: number }[];
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Shield, href: '/admin' },
  { id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' },
  { id: 'packs', label: 'Packs', icon: Package, href: '/admin/packs' },
  { id: 'sets', label: 'Sets', icon: Layers, href: '/admin/sets' },
  { id: 'transactions', label: 'Transacciones', icon: UserCog, href: '/admin/transactions' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    fetchUsers();
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
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setShowRoleModal(true);
                            }}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            Cambiar Rol
                          </button>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="px-3 py-1.5 bg-red-600/10 border border-red-600/20 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-600/20 transition-colors"
                          >
                            Ver Colección
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
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
        </div>
      )}
    </div>
  );
}