
import React, { useState, useEffect } from 'react';
import { PURCHASES } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { Project, Purchase } from '../types';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';

const Purchases: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const project = (location.state as { project: Project })?.project;

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    item: '',
    supplier: '',
    price: '',
    category: 'Material',
    status: 'Pendente'
  });
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, [project?.id]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('project_id', project?.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        setPurchases(data.map(p => ({
          id: p.id,
          item: p.item,
          supplier: p.supplier,
          price: p.price,
          date: p.date,
          category: p.category,
          status: p.status as any
        })));
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setPurchases(PURCHASES);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = purchases.reduce((acc, curr) => {
    const val = parseFloat(curr.price.replace(/[^\d,]/g, '').replace(',', '.'));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const filteredPurchases = purchases.filter(p =>
    p.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPurchase = async () => {
    if (!project?.id) return;
    try {
      setSaving(true);

      // Limpa o valor para salvar apenas números e vírgula se necessário, ou formata como número
      let rawPrice = newPurchase.price.replace('R$', '').trim();

      const { error } = await supabase
        .from('purchases')
        .insert([{
          project_id: project.id,
          item: newPurchase.item,
          supplier: newPurchase.supplier || 'N/A',
          price: rawPrice,
          category: newPurchase.category,
          status: 'Pago', // Mudando padrão para Pago já que vamos remover o badge de pendente
          date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;

      fetchPurchases();
      setIsModalOpen(false);
      setNewPurchase({
        item: '',
        supplier: '',
        price: '',
        category: 'Material',
        status: 'Pendente'
      });
    } catch (error) {
      console.error('Error adding purchase:', error);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseToDelete);

      if (error) throw error;

      setPurchases(purchases.filter(p => p.id !== purchaseToDelete));
      setPurchaseToDelete(null);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Erro ao excluir compra');
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-base font-semibold leading-tight">{project?.name || 'Residencial Alphaville'}</h2>
            <span className="text-xs text-slate-500 dark:text-gray-400">Compras da Obra</span>
          </div>
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Summary Card */}
        <section className="p-4">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-dark to-slate-900 border border-white/5 p-6 shadow-lg">
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                <p className="text-sm font-medium text-gray-400">Total Gasto</p>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
              </h3>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="px-4 pb-2 sticky top-[85px] z-10 bg-background-light dark:bg-background-dark pt-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="block w-full rounded-lg border-none bg-white dark:bg-surface-dark py-3 pl-10 pr-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-white"
              placeholder="Buscar fornecedor ou item..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* List */}
        <section className="px-4 py-2 space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider pl-1 mt-2 mb-3">Recentes</h4>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
              <p>Carregando compras...</p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
              <p>Nenhuma compra encontrada.</p>
            </div>
          ) : (
            filteredPurchases.map(item => (
              <article
                key={item.id}
                className="group relative flex items-center gap-4 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-white/5 transition-all hover:border-primary/50"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.category === 'Locação' ? 'bg-blue-500/10 text-blue-500' :
                  item.id === '4' ? 'bg-purple-500/10 text-purple-500' :
                    item.id === '2' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-primary/10 text-primary'
                  }`}>
                  <span className="material-symbols-outlined">
                    {item.category === 'Locação' ? 'handyman' : item.id === '4' ? 'format_paint' : item.id === '2' ? 'grid_view' : 'inventory_2'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-center min-w-0">
                  <div className="flex justify-between items-start">
                    <h5 className="font-semibold truncate pr-2">{item.item}</h5>
                    <span className="font-bold whitespace-nowrap text-primary">R$ {item.price}</span>
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <div className="flex flex-col">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.supplier}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{item.date}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPurchaseToDelete(item.id);
                      }}
                      className="flex size-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      {/* FAB */}
      <div className="fixed bottom-20 right-6 z-30">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-4 text-white shadow-xl shadow-primary/30 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add</span>
          <span className="font-bold text-sm tracking-wide">Nova Compra</span>
        </button>
      </div>

      {/* Add Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Nova Compra</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Item / Material</label>
                <input
                  type="text"
                  value={newPurchase.item}
                  onChange={e => setNewPurchase({ ...newPurchase, item: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ex: Cimento, Areia..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Fornecedor</label>
                <input
                  type="text"
                  value={newPurchase.supplier}
                  onChange={e => setNewPurchase({ ...newPurchase, supplier: e.target.value })}
                  className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ex: Materiais de Construção Silva"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Preço</label>
                  <input
                    type="text"
                    value={newPurchase.price}
                    onChange={e => setNewPurchase({ ...newPurchase, price: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Categoria</label>
                  <select
                    value={newPurchase.category}
                    onChange={e => setNewPurchase({ ...newPurchase, category: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 text-slate-800 dark:text-white border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Material">Material</option>
                    <option value="Ferramenta">Ferramenta</option>
                    <option value="Locação">Locação</option>
                    <option value="Serviço">Serviço</option>
                    <option value="Outros">Outros</option>
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
                onClick={handleAddPurchase}
                disabled={saving || !newPurchase.item || !newPurchase.price}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {purchaseToDelete && (
        <ConfirmModal
          isOpen={!!purchaseToDelete}
          title="Excluir Compra"
          message="Tem certeza que deseja excluir esta compra? Esta ação não pode ser desfeita."
          onConfirm={confirmDeletePurchase}
          onCancel={() => setPurchaseToDelete(null)}
          confirmText="Excluir"
        />
      )}
    </div>
  );
};

export default Purchases;
