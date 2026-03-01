import React from 'react';
import { Coins, History, Download, Upload } from 'lucide-react';

interface TopBarProps {
    view: string;
    balance: number;
}

export const TopBar: React.FC<TopBarProps> = ({ view, balance }) => {
    const viewLabels: Record<string, string> = {
        marketplace: 'Gallery',
        simulator: 'Pack Opener',
        collection: 'My Binder',
        profile: 'Profile',
    };

    return (
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md w-full relative z-20">
            <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span>Nexus</span>
                <span className="text-zinc-800">/</span>
                <span className="text-white">{viewLabels[view]}</span>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                    <Coins size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-200 tracking-tight">{balance}</span>
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-zinc-500 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                        <History size={18} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                        <Download size={18} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                        <Upload size={18} />
                    </button>
                    <button className="ml-2 px-4 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:bg-red-700 transition-all">
                        Direct Share
                    </button>
                </div>
            </div>
        </header>
    );
};
