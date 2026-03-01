'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, ChevronRight, Loader2 } from 'lucide-react';
import { Pack } from '@/lib/types';
import { ControlSection, InputField } from '../UI';

interface MarketplaceViewProps {
    onBuy: (pack: Pack) => void;
    balance: number;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onBuy, balance }) => {
    const [packs, setPacks] = useState<Pack[]>([]);
    const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPacks = async () => {
            try {
                const res = await fetch('/api/packs');
                const data = await res.json();
                setPacks(data);
                if (data.length > 0) setSelectedPack(data[0]);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPacks();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    if (!selectedPack) return null;

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
                <motion.div
                    key={selectedPack.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center relative z-10"
                >
                    <div className="w-64 h-80 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col items-center justify-center shadow-2xl mb-8 group hover:border-red-500/50 transition-all duration-500">
                        <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                        <Package size={80} className="text-white/10 group-hover:text-red-500/20 transition-colors duration-500" />
                        <div className="mt-4 text-white/20 font-bold uppercase tracking-widest text-[10px] group-hover:text-red-500/40 transition-colors">
                            Cartas de {selectedPack.game}
                        </div>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">{selectedPack.name}</h2>
                    <p className="text-red-500/60 uppercase tracking-widest text-[9px] font-black">
                        ¡Consigue tu sobre ahora!
                    </p>
                </motion.div>
            </div>

            <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-y-auto p-6 relative z-10">
                <ControlSection title="Sobres Disponibles">
                    <div className="space-y-2">
                        {packs.map((pack) => (
                            <button
                                key={pack.id}
                                onClick={() => setSelectedPack(pack)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group relative overflow-hidden ${selectedPack.id === pack.id
                                    ? 'bg-red-600/10 border-red-500/30 text-white font-bold'
                                    : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                                    }`}
                            >
                                <span className="text-[10px] uppercase tracking-widest relative z-10">{pack.name}</span>
                                <ChevronRight
                                    size={14}
                                    className={selectedPack.id === pack.id ? 'text-red-500 relative z-10' : 'text-zinc-600 relative z-10'}
                                />
                            </button>
                        ))}
                    </div>
                </ControlSection>

                <ControlSection title="Detalles del sobre">
                    <InputField label="Precio del sobre" value={selectedPack.price} />
                    <InputField label="Juego" value={selectedPack.game} />
                </ControlSection>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button
                        onClick={() => onBuy(selectedPack)}
                        disabled={balance < selectedPack.price}
                        className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:bg-red-700 transition-all disabled:opacity-30 disabled:grayscale group relative overflow-hidden"
                    >
                        <span className="relative z-10">Comprar este sobre</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <p className="text-[8px] text-center mt-4 text-zinc-600 uppercase tracking-widest font-bold">
                        Compra segura y protegida
                    </p>
                </div>
            </aside>
        </div>
    );
};
