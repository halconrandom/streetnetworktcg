'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Card } from '@/lib/types';

interface CardDisplayProps {
    card: Card;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, rotateY: 5, rotateX: 5 }}
            className="group relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 hover:border-red-600/30"
        >
            <div className="aspect-[3/4] overflow-hidden bg-black/40 relative">
                <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute top-3 right-3 z-10">
                    <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${card.rarity.includes('Premium') || card.rarity.includes('Ultra')
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                            : card.rarity.includes('Rare')
                                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                : 'bg-white/10 text-zinc-400 border border-white/10'
                            }`}
                    >
                        {card.rarity}
                    </span>
                </div>
            </div>
            <div className="p-3 relative z-10">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-black text-white truncate flex-1 text-[10px] uppercase tracking-tight">{card.name}</h3>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{card.type}</p>
                    <span className="text-[7px] font-black text-red-600/80 uppercase tracking-tighter bg-red-600/5 px-1.5 py-0.5 rounded-md border border-red-600/10">{card.game}</span>
                </div>
            </div>
            <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
};
