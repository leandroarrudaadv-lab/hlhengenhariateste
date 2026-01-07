import React, { useEffect, useState } from 'react';
import { RDOS } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { Project, RDO, ProjectStatus } from '../types';
import { supabase } from '../lib/supabase';

const RDOPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const project = (location.state as { project: Project })?.project;

  const [loading, setLoading] = useState(true);
  const [rdos, setRdos] = useState<RDO[]>([]);
  const [progress, setProgress] = useState(project?.progress || 0);

  useEffect(() => {
    if (project?.id) {
      fetchRdos();
    }
  }, [project?.id]);

  const fetchRdos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rdos')
        .select('*')
        .eq('project_id', project?.id)
        .order('full_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setRdos(data.map(r => {
          const d = new Date(r.full_date + 'T12:00:00');
          return {
            id: r.id,
            date: d.getDate().toString(),
            month: d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
            day: d.toLocaleDateString('pt-BR', { weekday: 'long' }),
            status: r.status,
            description: r.description,
            weather: r.weather,
            workers: r.workers,
            hasIssue: r.has_issue,
            fullDate: r.full_date
          } as RDO;
        }));
      }
    } catch (error) {
      console.error('Error fetching RDOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rdoToDelete, setRdoToDelete] = useState<string | null>(null);
  const [editingRdo, setEditingRdo] = useState<Partial<RDO>>({});
  const [isEditingProgress, setIsEditingProgress] = useState(false);

  const handleOpenModal = (rdo?: RDO) => {
    if (rdo) {
      setEditingRdo(rdo);
    } else {
      setEditingRdo({
        status: 'Em Andamento',
        weather: 'Ensolarado',
        workers: 0,
        hasIssue: false,
        fullDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRdoToDelete(id);
  };

  const confirmDeleteRdo = async () => {
    if (rdoToDelete) {
      try {
        const { error } = await supabase
          .from('rdos')
          .delete()
          .eq('id', rdoToDelete);

        if (error) throw error;
        setRdos(prev => prev.filter(r => r.id !== rdoToDelete));
        setRdoToDelete(null);
      } catch (error) {
        console.error('Error deleting RDO:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!project?.id) return;

      const rdoData = {
        project_id: project.id,
        full_date: editingRdo.fullDate,
        status: editingRdo.status,
        description: editingRdo.description,
        weather: editingRdo.weather,
        workers: editingRdo.workers,
        has_issue: editingRdo.hasIssue
      };

      if (editingRdo.id) {
        // Update
        const { error } = await supabase
          .from('rdos')
          .update(rdoData)
          .eq('id', editingRdo.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('rdos')
          .insert([rdoData]);
        if (error) throw error;
      }

      fetchRdos();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving RDO:', error);
      alert('Erro ao salvar relatório.');
    }
  };

  const handleProgressChange = async (newProgress: number) => {
    let value = Math.max(0, Math.min(100, newProgress));
    setProgress(value);

    if (project?.id) {
      try {
        // Atualiza o progresso
        await supabase
          .from('projects')
          .update({ progress: value })
          .eq('id', project.id);

        // Se chegou a 100%, muda automaticamente para Concluída
        if (value === 100) {
          await supabase
            .from('projects')
            .update({ status: ProjectStatus.COMPLETED })
            .eq('id', project.id);
        }
      } catch (error) {
        console.error('Error updating project progress:', error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Obra</span>
            <h1 className="text-lg font-bold leading-tight tracking-tight">{project?.name || 'Residencial Jardins'}</h1>
          </div>
          <button className="flex items-center justify-center p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border border-background-light dark:border-background-dark"></span>
          </button>
        </div>
      </header>

      {/* Progress Card */}
      <section className="px-4 pt-6 pb-2">
        <div className="bg-gradient-to-br from-surface-light to-slate-50 dark:from-surface-dark dark:to-slate-900 p-4 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Progresso da Obra</p>
                <button
                  onClick={() => setIsEditingProgress(!isEditingProgress)}
                  className="text-cyan-brand hover:text-cyan-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">{isEditingProgress ? 'check' : 'edit'}</span>
                </button>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                {isEditingProgress ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={progress}
                      onChange={(e) => handleProgressChange(parseInt(e.target.value) || 0)}
                      className="w-20 text-3xl font-bold bg-white dark:bg-white/10 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-cyan-brand"
                      autoFocus
                    />
                    <span className="text-xl font-bold">%</span>
                  </div>
                ) : (
                  <h2 className="text-3xl font-bold">{progress}%</h2>
                )}
              </div>
            </div>
            {/* Chart Icon Removed */}
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-cyan-brand h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Início: Jan 2023</span>
            <span>Previsão: Dez 2024</span>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-4 py-2 sticky top-[60px] z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input
              className="block w-full pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-surface-dark border-none ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-cyan-brand placeholder:text-slate-400 text-sm shadow-sm transition-all"
              placeholder="Buscar atividade ou data..."
              type="text"
            />
          </div>
          <button className="shrink-0 bg-white dark:bg-surface-dark p-3 rounded-xl ring-1 ring-black/5 dark:ring-white/10 text-slate-600 dark:text-slate-300 shadow-sm transition-all">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </section>

      <div className="flex items-center justify-between px-4 py-2 mt-2">
        <h3 className="text-base font-bold">Relatórios Recentes</h3>
        <button className="text-sm font-medium text-cyan-brand">Ver calendário</button>
      </div>

      <main className="flex flex-col gap-3 px-4 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
            <p>Carregando relatórios...</p>
          </div>
        ) : rdos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
            <p>Nenhum relatório encontrado.</p>
          </div>
        ) : rdos.map(rdo => (
          <article
            key={rdo.id}
            onClick={() => handleOpenModal(rdo)}
            className={`group relative bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/5 active:scale-[0.99] transition-all cursor-pointer ${rdo.status === 'Em Andamento' ? 'border-l-4 border-l-primary' : ''
              }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{rdo.month}</span>
                  <span className="text-xl font-bold leading-none">{rdo.date}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${rdo.status === 'Em Andamento' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-500/30' :
                      rdo.status === 'Finalizado' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30' :
                        'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-slate-200'
                      }`}>
                      {rdo.status === 'Em Andamento' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>}
                      {rdo.status}
                    </span>
                    {rdo.hasIssue && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-red-100 dark:bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30">
                        ! Ocorrência
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold">{rdo.day}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteClick(rdo.id, e)}
                className="text-slate-400 hover:text-red-500 transition-colors p-2"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
            <div className="flex gap-4 mb-3 text-xs text-slate-500 dark:text-slate-400 border-b border-dashed border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-orange-400 text-[18px]">sunny</span>
                <span>{rdo.weather}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-cyan-brand text-[18px]">groups</span>
                <span>{rdo.workers} Funcionários</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2">
              {rdo.description}
            </p>
            <div className="flex items-center justify-between mt-1">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark object-cover" src="https://picsum.photos/seed/eng1/50/50" alt="" />
                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark object-cover" src="https://picsum.photos/seed/eng2/50/50" alt="" />
                <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500">+3</div>
              </div>
              <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                Detalhes <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* FAB */}
      <div className="fixed bottom-20 right-6 z-40">
        <button
          onClick={() => handleOpenModal()}
          className="group flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white shadow-lg shadow-orange-500/40 rounded-full h-14 pl-5 pr-6 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
          <span className="font-bold text-base tracking-wide">Novo RDO</span>
        </button>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 px-0 md:px-4">
          <div className="bg-white dark:bg-surface-dark w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-200">
            <h2 className="text-xl font-bold mb-6">{editingRdo.id ? 'Editar RDO' : 'Novo RDO'}</h2>

            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {/* Date Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Data do Relatório</label>
                <input
                  type="date"
                  value={editingRdo.fullDate || ''}
                  onChange={(e) => setEditingRdo({ ...editingRdo, fullDate: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <div className="flex gap-2 mt-2">
                  {['Em Andamento', 'Finalizado'].map(status => (
                    <button
                      key={status}
                      onClick={() => setEditingRdo({ ...editingRdo, status: status as any })}
                      className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-all ${editingRdo.status === status
                        ? status === 'Em Andamento'
                          ? 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:border-yellow-500/30 dark:text-yellow-200'
                          : 'bg-green-100 border-green-200 text-green-800 dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-200'
                        : 'bg-gray-50 border-gray-100 text-gray-500 dark:bg-white/5 dark:border-white/10 dark:text-gray-400'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather & Workers */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Clima</label>
                  <select
                    value={editingRdo.weather}
                    onChange={(e) => setEditingRdo({ ...editingRdo, weather: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="Ensolarado">Ensolarado ☀️</option>
                    <option value="Nublado">Nublado ☁️</option>
                    <option value="Chuvoso">Chuvoso 🌧️</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Funcionários</label>
                  <input
                    type="number"
                    value={editingRdo.workers}
                    onChange={(e) => setEditingRdo({ ...editingRdo, workers: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Atividades / Descrição</label>
                <textarea
                  value={editingRdo.description}
                  onChange={(e) => setEditingRdo({ ...editingRdo, description: e.target.value })}
                  rows={4}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                  placeholder="Descreva as atividades realizadas hoje..."
                />
              </div>

              {/* Ocorrência Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                <div className={`p-2 rounded-full ${editingRdo.hasIssue ? 'bg-red-500 text-white' : 'bg-red-200 dark:bg-red-500/30 text-red-700 dark:text-red-300'}`}>
                  <span className="material-symbols-outlined text-lg">warning</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900 dark:text-red-200">Houve alguma ocorrência?</p>
                  <p className="text-xs text-red-700 dark:text-red-300 opacity-80">Acidentes, atrasos graves ou problemas.</p>
                </div>
                <input
                  type="checkbox"
                  checked={editingRdo.hasIssue}
                  onChange={(e) => setEditingRdo({ ...editingRdo, hasIssue: e.target.checked })}
                  className="w-6 h-6 rounded border-red-300 text-red-600 focus:ring-red-500"
                />
              </div>

            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={rdoToDelete !== null}
        title="Excluir Relatório"
        message="Tem certeza que deseja excluir este relatório diário? Esta ação não pode ser desfeita."
        onConfirm={confirmDeleteRdo}
        onCancel={() => setRdoToDelete(null)}
        confirmText="Excluir"
      />
    </div>
  );
};

export default RDOPage;
