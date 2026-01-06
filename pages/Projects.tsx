import React, { useState } from 'react';
import { DOCUMENTS, PROJECTS } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConstructionDocument, Project, ProjectStatus } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get project from state or fallback to first project (for dev/direct access)
  const project = (location.state as { project: Project })?.project || PROJECTS[0];

  const [activeTab, setActiveTab] = useState('Todos');
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ConstructionDocument[]>(() => {
    const savedDocs = localStorage.getItem('construction_documents');
    return savedDocs ? JSON.parse(savedDocs) : DOCUMENTS;
  });

  React.useEffect(() => {
    localStorage.setItem('construction_documents', JSON.stringify(documents));
  }, [documents]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    type: 'pdf' as 'pdf' | 'dwg' | 'xlsx' | 'jpg',
    author: 'Usuário Atual'
  });

  const [projectImage, setProjectImage] = useState(project.image);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Editing state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);

  // All projects for persistence
  const [allProjects, setAllProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : PROJECTS;
  });

  // Sync editedProject with current project if navigation happens
  React.useEffect(() => {
    setEditedProject(project);
    setProjectImage(project.image);
  }, [project]);

  const handleSaveProjectEdit = () => {
    const updatedProjects = allProjects.map(p =>
      p.id === project.id ? editedProject : p
    );
    setAllProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    setIsEditModalOpen(false);

    // Update local display if needed (though location.state stays same)
    // For a better UX, we might need a context or global state, 
    // but here we rely on the fact that we edit the local 'editedProject' 
    // and use THAT for display in this page.
  };

  const tabs = ['Todos', 'Plantas', 'Contratos', 'Relatórios'];

  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'Todos') return true;
    if (activeTab === 'Plantas') return doc.type === 'dwg' || doc.name.toLowerCase().includes('planta') || doc.name.toLowerCase().includes('projeto');
    if (activeTab === 'Contratos') return doc.name.toLowerCase().includes('contrato');
    if (activeTab === 'Relatórios') return doc.type === 'xlsx' || doc.name.toLowerCase().includes('relatório') || doc.name.toLowerCase().includes('orçamento');
    return true;
  });


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProjectImage(imageUrl);
    }
  };

  const handleOpenModal = () => {
    // Pre-fill type/name based on context
    let defaultType: 'pdf' | 'dwg' | 'xlsx' | 'jpg' = 'pdf';
    let defaultName = '';

    if (activeTab === 'Plantas') {
      defaultType = 'dwg';
      defaultName = 'Nova Planta';
    } else if (activeTab === 'Contratos') {
      defaultType = 'pdf';
      defaultName = 'Novo Contrato';
    } else if (activeTab === 'Relatórios') {
      defaultType = 'xlsx';
      defaultName = 'Novo Relatório';
    }

    setNewDoc({ ...newDoc, type: defaultType, name: defaultName });
    setIsModalOpen(true);
  };

  const handleUpload = () => {
    const doc: ConstructionDocument = {
      id: Date.now().toString(),
      name: newDoc.name,
      date: new Date().toLocaleDateString('pt-BR'),
      author: newDoc.author,
      type: newDoc.type
    };
    setDocuments([doc, ...documents]);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocToDelete(id);
  };

  const confirmDeleteDoc = () => {
    if (docToDelete) {
      setDocuments(prev => prev.filter(doc => doc.id !== docToDelete));
      setDocToDelete(null);
    }
  };

  const handleViewDocument = (doc: ConstructionDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Visualizando documento: ${doc.name}\n(Funcionalidade simulada)`);
  };

  const handleDownloadDocument = (doc: ConstructionDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`Baixando documento: ${doc.name}\n(Funcionalidade simulada)`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'description';
      case 'dwg': return 'architecture';
      case 'xlsx': return 'table_chart';
      case 'jpg': return 'image';
      default: return 'insert_drive_file';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-orange-500 bg-orange-500/10';
      case 'dwg': return 'text-cyan-brand bg-cyan-brand/10';
      case 'xlsx': return 'text-emerald-500 bg-emerald-500/10';
      case 'jpg': return 'text-purple-500 bg-purple-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold text-center flex-1">Projetos e Documentos</h1>
          <button className="flex items-center justify-center w-10 h-10 -mr-2 rounded-full active:bg-gray-200 dark:active:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col w-full">
        {/* Project Card Context */}
        <section className="px-4 py-4">
          <div
            className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-white/5 transition-transform"
          >
            <div className="flex flex-col justify-center flex-[2]">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${editedProject.status === ProjectStatus.IN_PROGRESS
                  ? 'bg-cyan-brand/10 text-cyan-brand ring-cyan-brand/20'
                  : 'bg-green-500/10 text-green-500 ring-green-500/20'
                  }`}>
                  {editedProject.status}
                </span>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <h2 className="text-lg font-bold leading-tight mb-1">{editedProject.name}</h2>
              <div className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <p className="text-sm font-medium">{editedProject.location}</p>
              </div>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-lg flex-shrink-0 relative overflow-hidden cursor-pointer group bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10"
              style={projectImage ? { backgroundImage: `url('${projectImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!projectImage && (
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-[32px]">add_photo_alternate</span>
              )}
              <div className={`absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center ${!projectImage ? 'hidden group-hover:flex' : ''}`}>
                <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="px-4 pb-2">
          <div className="relative flex items-center w-full h-12 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary transition-all">
            <div className="grid place-items-center h-full w-12 text-gray-400">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="peer h-full w-full outline-none text-sm text-slate-900 dark:text-white pr-4 bg-transparent placeholder-gray-400"
              placeholder="Buscar arquivos, plantas ou contratos..."
              type="text"
            />
          </div>
        </section>

        {/* Filter Chips */}
        {/* Filter Chips */}
        <section className="w-full border-b border-gray-100 dark:border-white/5 bg-background-light dark:bg-background-dark">
          <div className="flex flex-wrap gap-2 px-4 py-3 items-center justify-start">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-full transition-all text-sm font-medium whitespace-nowrap ${activeTab === tab
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-slate-600 dark:text-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
            <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-1 flex-shrink-0"></div>
            {/* RDO Button */}
            <button
              onClick={() => navigate('/rdo')}
              className="flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-full bg-cyan-brand/10 text-cyan-brand border border-cyan-brand/20 active:scale-95 transition-all text-sm font-bold whitespace-nowrap"
            >
              RDO
            </button>
            {/* Galeria Button */}
            <button
              onClick={() => navigate('/photos')}
              className="flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 active:scale-95 transition-all text-sm font-bold whitespace-nowrap"
            >
              Galeria
            </button>
            {/* Mapa Button */}
            <button
              onClick={() => {
                const url = editedProject.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(editedProject.location)}`;
                window.open(url, '_blank');
              }}
              className="flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:scale-95 transition-all text-sm font-bold whitespace-nowrap"
            >
              Mapa
            </button>
          </div>
        </section>

        {/* File List */}
        <div className="px-4 py-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
            {activeTab === 'Todos' ? 'Recentes' : activeTab}
          </h3>
          <span className="text-xs text-cyan-brand font-medium cursor-pointer">Ver histórico</span>
        </div>

        <section className="flex flex-col px-4 gap-3">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2">folder_off</span>
              <p>Nenhum documento encontrado.</p>
            </div>
          ) : (
            filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="group relative flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-white/5 active:scale-[0.99] transition-all shadow-sm"
              >
                <div className={`flex items-center justify-center shrink-0 w-12 h-12 rounded-lg ${getIconColor(doc.type)}`}>
                  <span className="material-symbols-outlined text-[28px]">{getIcon(doc.type)}</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-base font-semibold leading-tight truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 dark:text-gray-400">{doc.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span className="text-xs text-slate-500 dark:text-gray-400 truncate">{doc.author}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => doc.type === 'pdf' || doc.type === 'jpg' ? handleViewDocument(doc, e) : handleDownloadDocument(doc, e)}
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {doc.type === 'pdf' || doc.type === 'jpg' ? 'visibility' : 'download'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(doc.id, e)}
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* FAB */}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-3">
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-all group relative"
        >
          <span className="material-symbols-outlined text-[32px]">add</span>
          <span className="absolute right-full mr-3 bg-white dark:bg-surface-dark text-slate-700 dark:text-white text-xs font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {activeTab === 'Todos' ? 'Adicionar' : `Novo ${activeTab.slice(0, -1)}`}
          </span>
        </button>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">
              {activeTab === 'Todos' ? 'Adicionar Documento' : `Adicionar ${activeTab.slice(0, -1)}`}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Type Selection (Auto-filled but editable) */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                <select
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value as any })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="pdf" className="dark:bg-zinc-800">PDF</option>
                  <option value="dwg" className="dark:bg-zinc-800">DWG (Planta)</option>
                  <option value="xlsx" className="dark:bg-zinc-800">Excel</option>
                  <option value="jpg" className="dark:bg-zinc-800">Imagem</option>
                </select>
              </div>

              {/* Upload Mock */}
              <div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer bg-gray-50 dark:bg-transparent">
                <span className="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
                <p className="text-sm font-medium">Clique para selecionar o PDF</p>
                <p className="text-xs opacity-70 mt-1">(Simulação de Upload)</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome do Arquivo</label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="Ex: Planta Térreo_v1"
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
                onClick={handleUpload}
                disabled={!newDoc.name}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">Editar Obra</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome da Obra</label>
                <input
                  type="text"
                  value={editedProject.name}
                  onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Endereço / Localização</label>
                <input
                  type="text"
                  value={editedProject.location}
                  onChange={(e) => setEditedProject({ ...editedProject, location: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">URL do Mapa (Google Maps/Waze)</label>
                <input
                  type="text"
                  value={editedProject.mapsUrl || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, mapsUrl: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="https://maps.google.com/..."
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">Se vazio, usaremos a busca automática pelo endereço.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProjectEdit}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={docToDelete !== null}
        title="Excluir Documento"
        message="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita."
        onConfirm={confirmDeleteDoc}
        onCancel={() => setDocToDelete(null)}
        confirmText="Excluir"
      />
    </div>
  );
};

export default Projects;
