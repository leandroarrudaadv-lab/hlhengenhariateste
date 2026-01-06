import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('Engenheiro Responsável');

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', user?.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setFullName(data.full_name || '');
                if (data.role) setRole(data.role);
            } else {
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([{ id: user?.id, full_name: user?.user_metadata?.full_name || '' }]);

                if (insertError) console.error('Error creating profile fallback:', insertError);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    full_name: fullName,
                    role: role,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // Recarrega os dados para confirmar que foram salvos
            await fetchProfile();

            // Feedback visual de sucesso
            alert('Perfil salvo com sucesso!');
        } catch (error: any) {
            console.error(`Erro ao salvar perfil: ${error.message}`);
            alert(`Erro ao salvar perfil: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between px-4 py-3">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold text-center flex-1">Meu Perfil</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-4xl text-primary">person</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{user?.email}</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-[#baab9c] uppercase ml-1 mb-2 block">Nome Completo</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <span className="material-symbols-outlined text-[20px]">badge</span>
                            </span>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                                placeholder="Seu nome"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-[#baab9c] uppercase ml-1 mb-2 block">Cargo / Especialidade</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <span className="material-symbols-outlined text-[20px]">engineering</span>
                            </span>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                                placeholder="Seu cargo"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`w-full py-4 ${saving ? 'bg-primary/70' : 'bg-primary'} text-white rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2`}
                        >
                            {saving ? (
                                <span className="material-symbols-outlined animate-spin">sync</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    <span>Salvar Alterações</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={() => signOut()}
                            className="w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-bold border border-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span>Sair da Conta</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
