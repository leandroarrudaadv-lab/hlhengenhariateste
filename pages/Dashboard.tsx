import React from 'react';
import { PROJECTS } from '../constants';
import { ProjectStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Initialize projects from localStorage or constant
  const [projects, setProjects] = React.useState<typeof PROJECTS>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : PROJECTS;
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);
  const [newProject, setNewProject] = React.useState({
    name: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    mapsUrl: ''
  });

  const handleAddProject = () => {
    const project = {
      id: Date.now().toString(),
      name: newProject.name,
      location: newProject.location,
      progress: 0,
      status: ProjectStatus.IN_PROGRESS,
      image: `https://picsum.photos/seed/${newProject.name}/400/400`, // Auto-generated image for new projects
      description: newProject.description,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      mapsUrl: newProject.mapsUrl
    };

    setProjects([project, ...projects]);
    setIsModalOpen(false);
    setNewProject({ name: '', location: '', description: '', startDate: '', endDate: '', mapsUrl: '' });
  };

  // Save to localStorage whenever projects change
  React.useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const toggleProjectStatus = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent navigation
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status: p.status === ProjectStatus.IN_PROGRESS
            ? ProjectStatus.COMPLETED
            : ProjectStatus.IN_PROGRESS
        };
      }
      return p;
    }));
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      const updatedProjects = projects.filter(p => p.id !== projectToDelete);
      setProjects(updatedProjects);
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
                style={{ backgroundImage: `url('https://picsum.photos/seed/ricardo/100/100')` }}
              ></div>
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#baab9c]">Bem-vindo de volta,</p>
              <h2 className="text-lg font-bold leading-tight tracking-tight">Eng. Ricardo</h2>
            </div>
          </div>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative">
            <span className="material-symbols-outlined text-gray-700 dark:text-white">notifications</span>
            <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            className="block w-full pl-10 pr-4 py-3 bg-surface-light dark:bg-surface-dark border-none rounded-xl text-sm shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white"
            placeholder="Buscar obra, status ou local..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-4">
        <h3 className="text-base font-bold mb-3 px-1">Resumo Geral</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl p-4 bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5">
            <span className="flex items-center justify-center size-8 rounded-full bg-cyan-brand/10 text-cyan-brand mb-1">
              <span className="material-symbols-outlined text-[20px]">engineering</span>
            </span>
            <p className="text-2xl font-bold">{projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-[#baab9c]">Ativas</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl p-4 bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5">
            <span className="flex items-center justify-center size-8 rounded-full bg-green-500/10 text-green-500 mb-1">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </span>
            <p className="text-2xl font-bold">{projects.filter(p => p.status === ProjectStatus.COMPLETED).length}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-[#baab9c]">Feitas</p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-lg font-bold">Obras Recentes</h3>
        </div>
        <div className="flex flex-col gap-4">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate('/projects', { state: { project } })}
              className={`group relative flex flex-col gap-3 rounded-xl p-4 bg-surface-light dark:bg-surface-dark border ${project.status === ProjectStatus.IN_PROGRESS ? 'border-cyan-brand/30' : 'border-green-500/30'
                } shadow-sm cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="bg-center bg-no-repeat bg-cover rounded-lg size-12 shrink-0" style={{ backgroundImage: `url('${project.image}')` }}></div>
                  <div>
                    <h4 className="text-base font-bold leading-tight">{project.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-gray-400 text-[14px]">location_on</span>
                      <p className="text-xs text-gray-500 dark:text-[#baab9c]">{project.location}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, project.id)}
                    className="flex items-center justify-center size-8 rounded-full bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors z-10"
                    title="Excluir Obra"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <button
                    onClick={(e) => toggleProjectStatus(e, project.id)}
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors z-10 hover:opacity-80 active:scale-95 ${project.status === ProjectStatus.IN_PROGRESS
                      ? 'bg-cyan-brand/10 text-cyan-brand ring-cyan-brand/20'
                      : 'bg-green-500/10 text-green-500 ring-green-500/20'
                      }`}
                  >
                    {project.status}
                    <span className="material-symbols-outlined text-[14px] ml-1">edit</span>
                  </button>
                </div>
              </div>
              <div className="mt-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-[#baab9c]">Progresso físico</span>
                  <span className={`text-xs font-bold ${project.status === ProjectStatus.IN_PROGRESS ? 'text-cyan-brand' : 'text-green-500'}`}>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${project.status === ProjectStatus.IN_PROGRESS ? 'bg-cyan-brand' : 'bg-green-500'}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-100 dark:border-white/5">
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block size-6 rounded-full ring-2 ring-white dark:ring-surface-dark" src="https://picsum.photos/seed/p1/50/50" alt="" />
                  <img className="inline-block size-6 rounded-full ring-2 ring-white dark:ring-surface-dark" src="https://picsum.photos/seed/p2/50/50" alt="" />
                  <div className="flex items-center justify-center size-6 rounded-full ring-2 ring-white dark:ring-surface-dark bg-gray-200 dark:bg-white/10 text-[10px] font-bold text-gray-500">+3</div>
                </div>
                <button className="text-xs font-semibold flex items-center group-hover:text-primary transition-colors">
                  Detalhes <span className="material-symbols-outlined ml-1 text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 active:scale-95 transition-transform hover:scale-105"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nova Obra</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome da Obra</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="Ex: Residencial Flores"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Localização</label>
                <input
                  type="text"
                  value={newProject.location}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="Ex: Centro, São Paulo"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none h-24"
                  placeholder="Detalhes sobre o projeto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Início</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Previsão</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Link do Maps</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <span className="material-symbols-outlined text-[20px]">map</span>
                  </span>
                  <input
                    type="url"
                    value={newProject.mapsUrl}
                    onChange={(e) => setNewProject({ ...newProject, mapsUrl: e.target.value })}
                    className="w-full mt-1 pl-10 pr-3 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProject}
                disabled={!newProject.name || !newProject.location || !newProject.startDate || !newProject.endDate}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Criar Obra
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={projectToDelete !== null}
        title="Excluir Obra"
        message="Tem certeza que deseja excluir esta obra? Todos os dados associados serão perdidos permanentemente."
        onConfirm={confirmDelete}
        onCancel={() => setProjectToDelete(null)}
        confirmText="Excluir"
      />
    </div>
  );
};

export default Dashboard;
