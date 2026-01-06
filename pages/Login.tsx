import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                navigate('/');
            }
        } else {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                alert('Verifique seu e-mail para confirmar o cadastro!');
                setMode('login');
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background-light p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
                        <span className="material-symbols-outlined text-white text-4xl">home_work</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800">HLH Engenharia</h1>
                    <p className="text-slate-500 font-medium">Gestão de Obras</p>
                </div>

                <div className="flex gap-4 mb-6 p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => { setMode('login'); setError(null); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setError(null); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Cadastrar
                    </button>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium ml-1">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Cadastrar agora')}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                        disabled={loading}
                        className="text-primary font-bold hover:underline text-center text-sm"
                    >
                        {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
