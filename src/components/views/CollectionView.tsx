'use client';

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Card } from '@/lib/types';
import { CardDisplay } from '../CardDisplay';
import { ControlSection } from '../UI';

interface CollectionViewProps {
    collection: Card[];
}

export const CollectionView: React.FC<CollectionViewProps> = ({ collection }) => {
    return (
        <div className="flex h-full">
            <main className="flex-1 relative overflow-auto p-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 p-4">
                    {collection.map((card) => (
                        <CardDisplay key={card.id} card={card} />
                    ))}
                </div>
                {collection.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <LayoutGrid size={80} className="text-white mb-6" />
                        <p className="font-black uppercase tracking-[0.5em] text-xs text-white text-center">Empty Binder Capacity</p>
                    </div>
                )}
            </main>

            <aside className="w-85 border-l border-white/5 bg-black/40 backdrop-blur-xl flex flex-col overflow-y-auto p-8 relative z-20">
                <ControlSection title="Gallery Index">
                    <div className="grid grid-cols-2 gap-3">
                        {['Pokemon', 'Yu-Gi-Oh!', 'Magic', 'All'].map((game) => (
                            <button
                                key={game}
                                className="px-4 py-3 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all text-zinc-500 hover:text-white"
                            >
                                {game}
                            </button>
                        ))}
                    </div>
                </ControlSection>

                <ControlSection title="Recent Transfers">
                    <div className="space-y-4">
                        {collection.slice(-10).reverse().map((card) => (
                            <div key={card.id} className="text-[10px] font-bold text-zinc-600 leading-relaxed border-b border-white/5 pb-2 last:border-0">
                                <span className="text-red-500/60 mr-2">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                                <span className="text-white">TRANSFERRED:</span> {card.name}
                            </div>
                        ))}
                    </div>
                </ControlSection>
            </aside>
        </div>
    );
};
