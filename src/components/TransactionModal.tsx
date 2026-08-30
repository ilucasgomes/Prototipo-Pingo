import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { TransactionType } from '../types';
import { getTodayDateString, formatCentsToBRL, parseInputToCents } from '../utils/formatters';
import { X, Trash2, Check, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const TransactionModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    editingTransaction,
    setEditingTransaction,
    data,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useWallet();

  const [type, setType] = useState<TransactionType>('expense');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Filter categories by selected type
  const availableCategories = data.categories.filter((cat) => cat.type === type);

  // Sync state when modal opens or editingTransaction changes
  useEffect(() => {
    setShowDeleteConfirm(false);
    if (editingTransaction) {
      setType(editingTransaction.type);
      setRawAmount((editingTransaction.amountCents / 100).toFixed(2).replace('.', ','));
      setCategoryId(editingTransaction.categoryId);
      setDescription(editingTransaction.description || '');
      setDate(editingTransaction.date || getTodayDateString());
    } else {
      setType('expense');
      setRawAmount('');
      setDescription('');
      setDate(getTodayDateString());
      // Default to first category of expense if available
      const defaultCat = data.categories.find((c) => c.type === 'expense');
      if (defaultCat) setCategoryId(defaultCat.id);
    }
    setErrorMessage('');
  }, [editingTransaction, isQuickAddOpen, data.categories]);

  // When type changes, ensure a matching category is selected
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matching = data.categories.find((c) => c.type === newType);
    if (matching) {
      setCategoryId(matching.id);
    }
  };

  if (!isQuickAddOpen && !editingTransaction) return null;

  const handleClose = () => {
    setIsQuickAddOpen(false);
    setEditingTransaction(null);
    setShowDeleteConfirm(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cents = parseInputToCents(rawAmount);
    if (cents <= 0) {
      setErrorMessage('Por favor, informe um valor maior que R$ 0,00');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Selecione uma categoria.');
      return;
    }

    if (!date || isNaN(Date.parse(date))) {
      setErrorMessage('Informe uma data válida.');
      return;
    }

    const selectedCat = data.categories.find((c) => c.id === categoryId);
    const finalDescription = description.trim() || selectedCat?.name || (type === 'expense' ? 'Despesa' : 'Receita');

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amountCents: cents,
        categoryId,
        description: finalDescription,
        date,
      });
    } else {
      addTransaction({
        type,
        amountCents: cents,
        categoryId,
        description: finalDescription,
        date,
      });
    }

    handleClose();
  };

  const handleConfirmDelete = () => {
    if (editingTransaction) {
      deleteTransaction(editingTransaction.id);
      handleClose();
    }
  };

  const quickAmounts = [10, 20, 50, 100];

  return (
    <div
      id="transaction-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#102A43]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="transaction-modal-card"
        className="w-full max-w-md bg-white border-t sm:border border-[#E2E8F0] sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-[#102A43] tracking-tight">
            {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button
            id="close-transaction-modal-btn"
            onClick={handleClose}
            className="p-2 text-[#627D98] hover:text-[#102A43] hover:bg-[#F0F4F8] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Type Toggle: Despesa vs Receita */}
          <div className="grid grid-cols-2 gap-2 bg-[#F0F4F8] p-1.5 rounded-2xl border border-[#E2E8F0]">
            <button
              type="button"
              id="type-toggle-expense"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#DC2626]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Despesa
            </button>
            <button
              type="button"
              id="type-toggle-income"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#627D98] hover:text-[#16A34A]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita
            </button>
          </div>

          {/* Valor Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#627D98] mb-1.5">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#627D98]">
                R$
              </span>
              <input
                type="text"
                id="transaction-amount-input"
                inputMode="decimal"
                autoFocus
                placeholder="0,00"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                className="w-full bg-[#F0F4F8] border-2 border-[#E2E8F0] focus:border-[#159FEF] text-[#102A43] text-2xl font-black rounded-2xl pl-13 pr-4 py-3 outline-none transition-colors"
              />
            </div>

            {/* Quick value buttons */}
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => {
                    const currentCents = parseInputToCents(rawAmount);
                    const newCents = currentCents + amt * 100;
                    setRawAmount((newCents / 100).toFixed(2).replace('.', ','));
                  }}
                  className="flex-1 py-1.5 text-xs font-bold bg-[#F0F4F8] text-[#102A43] hover:bg-[#E2E8F0] border border-[#D9E2EC] rounded-xl transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Categorias Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#627D98] mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {availableCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    id={`category-select-${cat.id}`}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#159FEF]/10 border-[#159FEF] text-[#159FEF] shadow-xs'
                        : 'bg-[#F0F4F8] border-[#E2E8F0] text-[#627D98] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <span className="text-xl mb-1">{cat.icon}</span>
                    <span className="truncate w-full text-center">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição Opcional */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#627D98] mb-1.5">
              Descrição (Opcional)
            </label>
            <input
              type="text"
              id="transaction-description-input"
              placeholder="Ex: Marmita do almoço, gasolina..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#F0F4F8] border border-[#E2E8F0] focus:border-[#159FEF] text-[#102A43] text-sm font-medium rounded-2xl px-4 py-2.5 outline-none transition-colors"
            />
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#627D98] mb-1.5">
              Data
            </label>
            <input
              type="date"
              id="transaction-date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#F0F4F8] border border-[#E2E8F0] focus:border-[#159FEF] text-[#102A43] text-sm font-medium rounded-2xl px-4 py-2.5 outline-none transition-colors"
            />
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl text-xs text-[#DC2626] font-medium">
              {errorMessage}
            </div>
          )}

          {/* Inline Delete Confirmation */}
          {showDeleteConfirm ? (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl space-y-2.5 animate-in fade-in">
              <p className="text-xs font-bold text-[#DC2626] text-center">
                Deseja realmente apagar este lançamento?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white hover:bg-[#F0F4F8] text-[#102A43] text-xs font-bold py-2 rounded-xl border border-[#D9E2EC]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="confirm-delete-tx-btn"
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold py-2 rounded-xl shadow-xs"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          ) : (
            /* Botões de Ação Normais */
            <div className="flex gap-3 pt-2">
              {editingTransaction && (
                <button
                  type="button"
                  id="delete-transaction-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-3.5 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-2xl flex items-center justify-center transition-colors shadow-2xs"
                  title="Excluir lançamento"
                  aria-label="Excluir este lançamento"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                id="save-transaction-btn"
                className="flex-1 bg-[#159FEF] hover:bg-[#0D7EBF] active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Check className="w-5 h-5" />
                {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
