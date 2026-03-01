'use client';

import React from 'react';

export const PanelHeader = ({ title }: { title: string }) => (
    <div className="flex items-center space-x-3 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
    </div>
);

export const ControlSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-10">
        <PanelHeader title={title} />
        <div className="space-y-4">{children}</div>
    </div>
);

export const InputField = ({ label, value }: { label: string; value: string | number }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 ml-1">{label}</label>
        <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-mono font-bold text-zinc-300 backdrop-blur-sm shadow-inner overflow-hidden truncate">
            {value}
        </div>
    </div>
);
