import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollaborators } from '../contexts/CollaboratorContext';
import { Collaborator } from '../types';
import { supabase } from '../lib/supabase';

const CollaboratorDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCollaborator, updateCollaborator, removeCollaborator, loading: loadingContext } = useCollaborators();

  const [worker, setWorker] = useState<Collaborator | undefined>(undefined);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Local form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    salary: '',
    currentProject: '',
    photo: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name');
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (id) {
      const found = getCollaborator(id);
      if (found) {
        setWorker(found);
        setFormData({
          name: found.name,
          role: found.role,
          salary: found.salary,
          currentProject: found.currentProject,
          photo: found.photo
        });
      }
    }
  }, [id, getCollaborator, loadingContext]);

  if (loadingContext || loadingProjects) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        <p>Colaborador não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary">Voltar</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      {/* App Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Detalhes do Colaborador</h2>
        <div className="flex w-10 items-center justify-end">
          <button className="text-primary font-bold text-base hover:text-orange-400 transition-colors">
            Editar
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[600px] mx-auto pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 py-8 px-4">
          <div className="relative group cursor-pointer">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-32 h-32 border-4 border-white dark:border-surface-dark shadow-lg"
              style={{ backgroundImage: `url('${worker.photo}')` }}
            ></div>
            <div className="absolute bottom-0 right-0 bg-cyan-brand text-background-dark rounded-full p-2 border-4 border-background-light dark:border-background-dark flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px] font-bold">photo_camera</span>
            </div>
          </div>
          <button className="text-cyan-brand hover:text-cyan-300 text-[16px] font-semibold tracking-[-0.015em] transition-colors">
            Alterar foto
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-2 px-4">
          {/* Name */}
          <div className="flex flex-col w-full gap-2 py-2">
            <label className="text-slate-600 dark:text-[#baab9c] text-sm font-medium pl-1">Nome Completo</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 dark:text-[#baab9c] material-symbols-outlined">person</span>
              <input
                className="flex w-full min-w-0 flex-1 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-dark h-14 pl-12 pr-4 text-base transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                type="text"
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col w-full gap-2 py-2">
            <label className="text-slate-600 dark:text-[#baab9c] text-sm font-medium pl-1">Função</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#baab9c] material-symbols-outlined pointer-events-none">engineering</span>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="flex w-full min-w-0 flex-1 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-dark h-14 pl-12 pr-10 text-base appearance-none transition-all"
              >
                <option value="Mestre de Obras">Mestre de Obras</option>
                <option value="Pedreiro">Pedreiro</option>
                <option value="Servente">Servente</option>
                <option value="Engenheiro Civil">Engenheiro Civil</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#baab9c] material-symbols-outlined pointer-events-none">unfold_more</span>
            </div>
          </div>

          {/* Salary */}
          <div className="flex flex-col w-full gap-2 py-2">
            <label className="text-slate-600 dark:text-[#baab9c] text-sm font-medium pl-1">Salário / Diária</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 dark:text-[#baab9c] material-symbols-outlined">payments</span>
              <input
                className="flex w-full min-w-0 flex-1 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-dark h-14 pl-12 pr-4 text-base transition-all"
                inputMode="numeric"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                type="text"
              />
            </div>
          </div>

          {/* Project */}
          <div className="flex flex-col w-full gap-2 py-2">
            <label className="text-slate-600 dark:text-[#baab9c] text-sm font-medium pl-1">Obra Atual</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#baab9c] material-symbols-outlined pointer-events-none">apartment</span>
              <select
                value={formData.currentProject}
                onChange={(e) => setFormData({ ...formData, currentProject: e.target.value })}
                className="flex w-full min-w-0 flex-1 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-dark h-14 pl-12 pr-10 text-base appearance-none transition-all"
              >
                <option value="">Sem alocação (Disponível)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#baab9c] material-symbols-outlined pointer-events-none">unfold_more</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 mt-8 flex flex-col gap-3">
          <button
            onClick={async () => {
              if (id) {
                await updateCollaborator(id, formData);
                navigate(-1);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 h-14 shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-white">save</span>
            <span className="text-white text-base font-bold">Salvar Alterações</span>
          </button>
          <button
            onClick={async () => {
              if (id && window.confirm('Tem certeza que deseja excluir?')) {
                await removeCollaborator(id);
                navigate(-1);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-transparent border border-red-500/30 px-4 h-12 active:bg-red-500/10 transition-colors"
          >
            <span className="text-red-500 text-base font-semibold">Excluir Colaborador</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default CollaboratorDetails;
