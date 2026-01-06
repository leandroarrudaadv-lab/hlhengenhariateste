import React, { useState, useEffect } from 'react';
import { CONTRACTS } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { Contract, Project } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import { supabase } from '../lib/supabase';

const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const project = (location.state as { project: Project })?.project;

  const [activeSegment, setActiveSegment] = useState<'clients' | 'suppliers'>('suppliers');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, [project?.id]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('project_id', project?.id);

      if (error) throw error;

      if (data) {
        setContracts(data.map(c => ({
          id: c.id,
          name: c.name,
          supplier: c.supplier,
          status: c.status as any,
          expiry: c.expiry_date,
          value: c.value,
          code: c.code
        })));
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts(CONTRACTS);
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [newContract, setNewContract] = useState({
    name: '',
    supplier: '',
    value: '',
    status: 'Ativo' as const,
    code: `CT-2023-${Math.floor(Math.random() * 1000)}`
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredContracts = contracts.filter(contract =>
    contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddContract = async () => {
    try {
      const contractData = {
        project_id: project?.id,
        name: newContract.name,
        supplier: newContract.supplier,
        status: newContract.status,
        value: newContract.value,
        code: newContract.code,
        expiry_date: new Date().toLocaleDateString('pt-BR') // Fallback date
      };

      const { data, error } = await supabase
        .from('contracts')
        .insert([contractData])
        .select();

      if (error) throw error;

      if (data) {
        fetchContracts();
        setIsModalOpen(false);
        setNewContract({
          name: '',
          supplier: '',
          value: '',
          status: 'Ativo',
          code: `CT-2023-${Math.floor(Math.random() * 1000)}`
        });
      }
    } catch (error) {
      console.error('Error adding contract:', error);
      alert('Erro ao adicionar contrato.');
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContractToDelete(id);
  };

  const confirmDeleteContract = async () => {
    if (contractToDelete) {
      try {
        const { error } = await supabase
          .from('contracts')
          .delete()
          .eq('id', contractToDelete);

        if (error) throw error;
        setContracts(contracts.filter(c => c.id !== contractToDelete));
        setContractToDelete(null);
      } catch (error) {
        console.error('Error deleting contract:', error);
        alert('Erro ao excluir contrato.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Contratos</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-10 items-center justify-center px-3 rounded-full hover:bg-primary/10 active:bg-primary/20 transition-colors"
        >
          <span className="text-primary text-sm font-bold tracking-wide">Adicionar</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-4">
        {/* Project Context */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Obra Selecionada</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{project?.name || 'Projeto não selecionado'}</h1>
            <div className="size-10 rounded-full overflow-hidden bg-surface-dark border border-white/10 shrink-0">
              <img src={project?.image || "https://picsum.photos/seed/building1/100/100"} className="h-full w-full object-cover" alt="" />
            </div>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="mb-6 p-1 bg-slate-200 dark:bg-surface-dark rounded-xl flex">
          <button
            onClick={() => setActiveSegment('clients')}
            className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium transition-all duration-200 ${activeSegment === 'clients' ? 'bg-white dark:bg-background-dark text-cyan-brand shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setActiveSegment('suppliers')}
            className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium transition-all duration-200 ${activeSegment === 'suppliers' ? 'bg-white dark:bg-background-dark text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
          >
            Fornecedores
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow sm:text-sm shadow-sm"
              placeholder="Buscar contrato, nome ou ID..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Contratos Ativos</p>
            <p className="text-xl font-bold mt-1">12</p>
          </div>
          <div className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Valor Pendente</p>
            <p className="text-xl font-bold text-primary mt-1">R$ 45k</p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
            <p>Carregando contratos...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">description</span>
            <p>Nenhum contrato encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map(contract => (
              <div
                key={contract.id}
                className="group relative bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-white/5 active:scale-[0.99] transition-transform duration-100 cursor-pointer"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(contract.id, e)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${contract.status === 'Ativo' ? 'bg-primary/10 text-primary' :
                      contract.status === 'Pendente' ? 'bg-cyan-brand/10 text-cyan-brand' :
                        contract.status === 'Atenção' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-slate-500/10 text-slate-500'
                      }`}>
                      <span className="material-symbols-outlined">
                        {contract.id === '4' ? 'architecture' : contract.id === '3' ? 'bolt' : contract.id === '2' ? 'format_paint' : 'handshake'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">{contract.name}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{contract.supplier}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${contract.status === 'Ativo' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                    contract.status === 'Pendente' ? 'bg-primary/10 text-primary border-primary/20' :
                      contract.status === 'Atenção' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        'bg-slate-500/10 text-slate-500 border-slate-200'
                    }`}>
                    {contract.status}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className={`flex items-center gap-1.5 ${contract.status === 'Atenção' ? 'text-red-500' : contract.status === 'Pendente' ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[16px]">
                      payments
                    </span>
                    <span>{contract.value ? `R$ ${contract.value}` : contract.expiry}</span>
                  </div>
                  <span className="font-semibold">{contract.code}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-20 right-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">Novo Contrato</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome / Serviço</label>
                <input
                  type="text"
                  value={newContract.name}
                  onChange={(e) => setNewContract({ ...newContract, name: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="Ex: Fornecimento de Areia"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Fornecedor</label>
                <input
                  type="text"
                  value={newContract.supplier}
                  onChange={(e) => setNewContract({ ...newContract, supplier: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Valor (R$)</label>
                  <input
                    type="text"
                    value={newContract.value}
                    onChange={(e) => setNewContract({ ...newContract, value: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    placeholder="Ex: 150.000,00"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Situação</label>
                  <select
                    value={newContract.status}
                    onChange={(e) => setNewContract({ ...newContract, status: e.target.value as 'Ativo' | 'Concluído' })}
                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Ativo" className="dark:bg-zinc-800">Ativo</option>
                    <option value="Concluído" className="dark:bg-zinc-800">Concluído</option>
                  </select>
                </div>
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
                onClick={handleAddContract}
                disabled={!newContract.name || !newContract.supplier}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={contractToDelete !== null}
        title="Excluir Contrato"
        message="Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita."
        onConfirm={confirmDeleteContract}
        onCancel={() => setContractToDelete(null)}
        confirmText="Excluir"
      />
    </div>
  );
};

export default Contracts;
