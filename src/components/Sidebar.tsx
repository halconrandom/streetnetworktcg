import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Package, LayoutGrid, User, LogOut, Sparkles } from 'lucide-react';

interface SidebarProps {
    view: string;
    setView: (view: any) => void;
    username: string;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, username, onLogout }) => {
    const menuItems = [
        { id: 'marketplace', label: 'Gallery', icon: ShoppingBag },
        { id: 'simulator', label: 'Pack Opener', icon: Package },
        { id: 'collection', label: 'My Binder', icon: LayoutGrid },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <aside className="w-64 border-r border-white/5 flex flex-col bg-black/40 backdrop-blur-xl transition-all h-full text-zinc-400 relative z-20">
            <div className="p-6 flex items-center space-x-3 mb-8">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    <Sparkles size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-black tracking-tight uppercase leading-none text-white">Street TCG</h1>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Club de Coleccionistas</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = view === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all relative group ${isActive
                                ? 'text-white'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-red-600/10 border border-red-600/20 rounded-xl"
                                />
                            )}
                            <Icon size={16} className={isActive ? 'text-red-500 relative z-10' : 'relative z-10'} />
                            <span className="text-[11px] font-bold uppercase tracking-widest relative z-10">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-white/5">
                <div className="flex items-center space-x-3 px-2 mb-4">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                        <User size={18} className="text-zinc-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate uppercase text-white">{username}</p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <p className="text-[8px] text-red-500/80 font-black uppercase tracking-widest">En línea</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                    <LogOut size={14} />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
};
