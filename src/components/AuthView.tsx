'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthViewProps {
    onLogin: (user: any) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const body = isLogin
            ? { username, password }
            : { username, email, password, confirmPassword };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (res.ok) {
                onLogin(data.user);
            } else {
                setError(data.error || 'Algo salió mal');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#080808] relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 200, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-red-600/10 blur-[120px] rounded-full"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 bg-black/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)] mb-4">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-white">Street TCG</h1>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">
                        {isLogin ? '¡Bienvenido de nuevo!' : 'Únete a nuestra comunidad'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nombre de usuario</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <User size={16} className="text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all"
                                placeholder="Tu apodo favorito"
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Correo electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail size={16} className="text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all"
                                    placeholder="ejemplo@correo.com"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Contraseña</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Lock size={16} className="text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all"
                                placeholder="Tu clave secreta"
                                required
                            />
                        </div>
                        {!isLogin && <p className="text-[8px] text-zinc-600 uppercase tracking-wider ml-1">Mínimo 12 caracteres</p>}
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirma tu contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock size={16} className="text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all"
                                    placeholder="Repite tu clave secreta"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.2)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        <span>{loading ? 'PROCESANDO...' : isLogin ? 'ENTRAR AL CLUB' : 'CREAR MI CUENTA'}</span>
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
                    >
                        {isLogin ? '¿Eres nuevo? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
