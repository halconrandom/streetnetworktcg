'use client';

import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { ControlSection } from '../UI';

interface ProfileViewProps {
    user: UserProfile;
    collectionCount: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, collectionCount }) => {
    return (
        <div className="flex h-full">
            <main className="flex-1 relative overflow-auto p-12 text-white">
                <div className="max-w-2xl mx-auto space-y-12">
                    <div className="flex items-center space-x-10 bg-black/40 backdrop-blur-3xl p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
                        <div className="w-28 h-28 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                            <User size={56} className="text-white/20" />
                            <div className="absolute inset-0 bg-red-600/10 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-1">{user.username}</h3>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                <p className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em]">Verified Collective</p>
                            </div>

                            <div className="flex space-x-10 mt-8 border-t border-white/5 pt-6">
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Asset Credits</p>
                                    <p className="text-2xl font-black text-white">{user.balance}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">Data Bindings</p>
                                    <p className="text-2xl font-black text-white">{collectionCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <aside className="w-85 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-y-auto p-8 relative z-20">
                <ControlSection title="Privacy Protocols">
                    <div className="space-y-3">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-red-600/30 transition-all group">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Security Node</span>
                            <ChevronRight size={16} className="text-white/20 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-red-600/30 transition-all group">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Interface Prefs</span>
                            <ChevronRight size={16} className="text-white/20 group-hover:text-red-500 transition-colors" />
                        </div>
                    </div>
                </ControlSection>
            </aside>
        </div>
    );
};
