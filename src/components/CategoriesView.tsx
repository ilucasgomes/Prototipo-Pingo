import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Category, TransactionType } from '../types';
import { Plus, Trash2, Edit2, X, Check, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const COMMON_EMOJIS = ['🍔', '🚌', '🏠', '💊', '☕', '🛍️', '📦', '💵', '⚡', '💼', '📥', '⛽', '🎓', '🎬', '🛒', '✂️', '🔧', '👶', '🐾', '📱'];

export const CategoriesView: React.FC = () => {
  const { data, addCategory, updateCategory, deleteCategory } = useWallet();

  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [catType, setCatType] = useState<TransactionType>('expense');
  const [errorMsg, setErrorMsg] = useState('');

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const filteredCategories = data.categories.filter((c) => c.type === activeType);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setIcon(activeType === 'expense' ? '🍔' : '💵');
    setCatType(activeType);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setCatType(cat.type);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome da categoria é obrigatório.');
      return;
    }

    if (editingCat) {
      updateCategory(editingCat.id, {
        name: name.trim(),
        icon: icon || '📦',
        type: catType,
      });
    } else {
      addCategory({
        name: name.trim(),
        icon: icon || '📦',
        type: catType,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    const res = deleteCategory(categoryToDelete.id);
    if (!res.success) {
      setDeleteErrorMessage(res.reason || 'Não foi possível excluir esta categoria.');
    } else {
      setCategoryToDelete(null);
      setDeleteErrorMessage(null);
    }
  };

  return (
    <div id="categories-view" className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#102A43] tracking-tight">Categorias</h1>
          <p className="text-xs text-[#627D98]">Organize suas despesas e receitas por tipo</p>
        </div>
        <button
          id="add-category-btn"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-[#159FEF] hover:bg-[#0D7EBF] active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Expense / Income Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <button
          id="categories-tab-expense"
          onClick={() => setActiveType('expense')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            activeType === 'expense'
              ? 'bg-[#DC2626] text-white shadow-xs'
              : 'text-[#627D98] hover:text-[#DC2626]'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          Despesas ({data.categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          id="categories-tab-income"
          onClick={() => setActiveType('income')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            activeType === 'income'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'text-[#627D98] hover:text-[#16A34A]'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Receitas ({data.categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Bento List */}
      <div className="grid grid-cols-1 gap-2">
        {filteredCategories.map((cat) => {
          const usageCount = data.transactions.filter((t) => t.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              id={`cat-card-${cat.id}`}
              className="bg-white border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between shadow-xs hover:border-[#CBD5E1] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F4F8] border border-[#E2E8F0] flex items-center justify-center text-xl shrink-0">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#102A43] leading-tight">{cat.name}</h3>
                  <span className="text-[11px] text-[#627D98]">
                    {usageCount} {usageCount === 1 ? 'lançamento' : 'lançamentos'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 text-[#627D98] hover:text-[#102A43] hover:bg-[#F0F4F8] rounded-xl transition-colors"
                  title="Editar categoria"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => {
                      setCategoryToDelete(cat);
                      setDeleteErrorMessage(null);
                    }}
                    className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors"
                    title="Excluir categoria"
                    aria-label={`Excluir categoria ${cat.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Category Confirmation Dialog */}
      {categoryToDelete && (
        <div
          className="fixed inset-0 z-50 bg-[#102A43]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCategoryToDelete(null);
              setDeleteErrorMessage(null);
            }
          }}
        >
          <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <span>{categoryToDelete.icon}</span>
                <span>Excluir Categoria</span>
              </h3>
              <button
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteErrorMessage(null);
                }}
                className="text-[#627D98] hover:text-[#102A43]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#627D98] leading-relaxed">
              Deseja realmente apagar a categoria <strong>"{categoryToDelete.name}"</strong>?
            </p>

            {deleteErrorMessage && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl text-xs text-[#DC2626] font-bold leading-tight">
                {deleteErrorMessage}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteErrorMessage(null);
                }}
                className="flex-1 bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#102A43] font-bold py-2.5 rounded-2xl text-xs border border-[#D9E2EC]"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-delete-cat-btn"
                onClick={handleConfirmDelete}
                className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-2.5 rounded-2xl text-xs shadow-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Edit / Add Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#102A43]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#102A43]">
                {editingCat ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#627D98] hover:text-[#102A43]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 bg-[#F0F4F8] p-1 rounded-2xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setCatType('expense')}
                  className={`py-2 text-xs font-bold rounded-xl ${
                    catType === 'expense' ? 'bg-[#DC2626] text-white shadow-xs' : 'text-[#627D98]'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setCatType('income')}
                  className={`py-2 text-xs font-bold rounded-xl ${
                    catType === 'income' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-[#627D98]'
                  }`}
                >
                  Receita
                </button>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#627D98] mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Farmácia, Combustível..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F0F4F8] border border-[#E2E8F0] focus:border-[#159FEF] text-[#102A43] text-sm font-medium rounded-2xl px-3.5 py-2.5 outline-none"
                  autoFocus
                />
              </div>

              {/* Icon / Emoji Picker */}
              <div>
                <label className="block text-xs font-bold text-[#627D98] mb-1">Ícone</label>
                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto bg-[#F0F4F8] p-2 rounded-2xl border border-[#E2E8F0]">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setIcon(emoji)}
                      className={`text-xl p-2 rounded-xl transition-all ${
                        icon === emoji ? 'bg-[#159FEF] text-white scale-110 shadow-xs' : 'hover:bg-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl text-xs text-[#DC2626] font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#102A43] font-bold py-2.5 rounded-2xl text-xs border border-[#D9E2EC]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#159FEF] hover:bg-[#0D7EBF] text-white font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
