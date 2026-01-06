import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollaborators } from '../contexts/CollaboratorContext';
import { Collaborator, ProjectStatus } from '../types';
import { PROJECTS } from '../constants';
import ConfirmModal from '../components/ConfirmModal';
import { supabase } from '../lib/supabase';

const Collaborators: React.FC = () => {
    const navigate = useNavigate();
    const { collaborators, loading, addCollaborator, removeCollaborator } = useCollaborators();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [collaboratorToDelete, setCollaboratorToDelete] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoadingProjects(true);
            const { data, error } = await supabase
                .from('projects')
                .select('id, name, status')
                .eq('status', 'Em Andamento');

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const activeProjects = projects;

    const [newCollaborator, setNewCollaborator] = useState({
        name: '',
        role: 'Mestre de Obras',
        salary: '',
        currentProject: '',
    });

    const handleAddCollaborator = async () => {
        // Find project ID from name (simplified for now, ideally we use ID in state)
        // Since we are moving to Supabase, we should ideally use project_id in the DB.
        // For now, I'll just save the name to match current UI and context logic.

        await addCollaborator({
            name: newCollaborator.name,
            role: newCollaborator.role,
            salary: newCollaborator.salary,
            photo: `https://picsum.photos/seed/${Date.now()}/150/150`,
            currentProject: newCollaborator.currentProject
        });

        setIsModalOpen(false);
        setNewCollaborator({ name: '', role: 'Mestre de Obras', salary: '', currentProject: '' });
    };

    const handleDeleteClick = (id: string) => {
        setCollaboratorToDelete(id);
    };

    const confirmDeleteCollaborator = () => {
        if (collaboratorToDelete) {
            removeCollaborator(collaboratorToDelete);
            setCollaboratorToDelete(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between px-4 py-3">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold text-center flex-1">Equipe</h1>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center w-10 h-10 -mr-2 rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors text-primary">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
            </header>

            <main className="flex flex-col p-4 gap-4">
                {loading || loadingProjects ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
                        <p>Carregando equipe...</p>
                    </div>
                ) : collaborators.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <span className="material-symbols-outlined text-4xl mb-2">groups</span>
                        <p>Nenhum colaborador encontrado.</p>
                    </div>
                ) : (
                    collaborators.map((collaborator) => (
                        <div
                            key={collaborator.id}
                            className="flex flex-col bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5"
                        >
                            <div className="flex items-start gap-4">
                                <img
                                    src={collaborator.photo}
                                    alt={collaborator.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 cursor-pointer"
                                    onClick={() => navigate(`/collaborator/${collaborator.id}`)}
                                />
                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => navigate(`/collaborator/${collaborator.id}`)}
                                >
                                    <h3 className="font-bold text-lg leading-tight truncate">{collaborator.name}</h3>
                                    <p className="text-cyan-brand font-medium text-sm">{collaborator.role}</p>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-[14px]">apartment</span>
                                        <span>{collaborator.currentProject || 'Sem alocação'}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteClick(collaborator.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                        <h2 className="text-xl font-bold mb-4">Novo Colaborador</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
                                <input
                                    type="text"
                                    value={newCollaborator.name}
                                    onChange={(e) => setNewCollaborator({ ...newCollaborator, name: e.target.value })}
                                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10"
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Função</label>
                                <select
                                    value={newCollaborator.role}
                                    onChange={(e) => setNewCollaborator({ ...newCollaborator, role: e.target.value })}
                                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">Mestre de Obras</option>
                                    <option className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">Engenheiro Civil</option>
                                    <option className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">Pedreiro</option>
                                    <option className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">Servente</option>
                                    <option className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">Eletricista</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Salário / Diária</label>
                                <input
                                    type="text"
                                    value={newCollaborator.salary}
                                    onChange={(e) => setNewCollaborator({ ...newCollaborator, salary: e.target.value })}
                                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="R$ 0,00"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Obra Atual</label>
                                <select
                                    value={newCollaborator.currentProjectId}
                                    onChange={(e) => setNewCollaborator({ ...newCollaborator, currentProjectId: e.target.value })}
                                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="" className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">Sem alocação</option>
                                    {activeProjects.map((p: any) => (
                                        <option key={p.id} value={p.id} className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white">{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-gray-500 font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddCollaborator}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30"
                                disabled={!newCollaborator.name}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={collaboratorToDelete !== null}
                title="Remover Colaborador"
                message="Tem certeza que deseja remover este colaborador da equipe? Esta ação não pode ser desfeita."
                onConfirm={confirmDeleteCollaborator}
                onCancel={() => setCollaboratorToDelete(null)}
                confirmText="Remover"
            />
        </div>
    );
};

export default Collaborators;
