'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Package } from 'lucide-react';
import { Card, UserProfile } from '@/lib/types';
import { CardDisplay } from '../CardDisplay';
import { ControlSection } from '../UI';

interface SimulatorViewProps {
    user: UserProfile;
    onOpen: (packId: string) => Promise<Card[] | null>;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ user, onOpen }) => {
    const [opening, setOpening] = useState(false);
    const [openedCards, setOpenedCards] = useState<Card[]>([]);
    const [selectedPackId, setSelectedPackId] = useState<string | null>(
        user.inventory.length > 0 ? user.inventory[0].packId : null
    );

    const handleOpenClick = async () => {
        if (!selectedPackId) return;
        setOpening(true);
        const cards = await onOpen(selectedPackId);
        if (cards) {
            setTimeout(() => {
                setOpenedCards(cards);
                setOpening(false);
            }, 1200);
        } else {
            setOpening(false);
        }
    };

    return (
        <div className="flex h-full">
            <main className="flex-1 relative overflow-auto p-12">
                <AnimatePresence mode="wait">
                    {opening ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center p-12"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 2, -2, 0],
                                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                                }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="w-48 h-64 bg-white/5 backdrop-blur-3xl rounded-3xl border border-red-500/30 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.2)] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
                                <Sparkles size={48} className="text-red-500 animate-pulse relative z-10" />
                                <p className="mt-4 font-black text-[10px] uppercase tracking-[0.2em] text-red-500 relative z-10 animate-pulse">Abriendo sobre...</p>
                            </motion.div>
                        </motion.div>
                    ) : openedCards.length > 0 ? (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-5xl">
                                {openedCards.map((card, idx) => (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                                    >
                                        <CardDisplay card={card} />
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-12">
                                <button
                                    onClick={() => setOpenedCards([])}
                                    className="px-12 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] rounded-full border border-white/10 transition-all text-[10px]"
                                >
                                    Clear Stream
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                                <Sparkles size={32} className="text-red-500/20" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-widest mb-2 uppercase">Preparado para abrir</h3>
                            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">
                                Elige un sobre para empezar
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-y-auto p-6 relative z-10">
                <ControlSection title="Tus Sobres">
                    <div className="space-y-2">
                        {(user.inventory || []).map((item) => (
                            <button
                                key={item.packId}
                                onClick={() => setSelectedPackId(item.packId)}
                                className={`w-full flex items-center justify-between p-4 border transition-all rounded-xl relative overflow-hidden group ${selectedPackId === item.packId
                                    ? 'bg-red-600/10 border-red-500/30'
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center space-x-3 relative z-10">
                                    <Package size={14} className={selectedPackId === item.packId ? 'text-red-500' : 'text-zinc-600'} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedPackId === item.packId ? 'text-white' : 'text-zinc-500'}`}>
                                        {item.name || 'Unidentified Node'}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black relative z-10 ${selectedPackId === item.packId ? 'text-red-500' : 'text-zinc-700'}`}>
                                    {item.count}
                                </span>
                            </button>
                        ))}
                        {(!user.inventory || user.inventory.length === 0) && (
                            <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl">
                                <p className="text-[9px] text-zinc-700 uppercase tracking-[0.2em] font-black">Empty Vault</p>
                            </div>
                        )}
                    </div>
                </ControlSection>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button
                        onClick={handleOpenClick}
                        disabled={opening || !selectedPackId || !user.inventory.find(i => i.packId === selectedPackId)?.count}
                        className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.2)] hover:bg-red-700 transition-all disabled:opacity-20 disabled:grayscale group relative overflow-hidden"
                    >
                        <span className="relative z-10">Abrir sobre ahora</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <p className="text-[8px] text-center mt-4 text-zinc-600 uppercase tracking-widest font-bold">
                        ¡Mucha suerte con tus cartas!
                    </p>
                </div>
            </aside>
        </div>
    );
};
