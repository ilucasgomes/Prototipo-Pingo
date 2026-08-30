import React, { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { TransactionType, Transaction } from '../types';
import { formatCentsToBRL, formatFriendlyDate, getCurrentMonthKey } from '../utils/formatters';
import { PingoMascot } from './PingoMascot';
import { Search, Filter, Calendar, ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { data, setEditingTransaction, setIsQuickAddOpen, getCategoryById } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique available months from transactions
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    data.transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        monthsSet.add(tx.date.slice(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [data.transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Month filter
      if (selectedMonth !== 'all' && !tx.date.startsWith(selectedMonth)) return false;

      // Category filter
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const cat = getCategoryById(tx.categoryId);
        const matchDesc = tx.description?.toLowerCase().includes(query);
        const matchCat = cat?.name.toLowerCase().includes(query);
        if (!matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [data.transactions, typeFilter, selectedMonth, selectedCategory, searchQuery, getCategoryById]);

  // Group filtered transactions by date
  const groupedByDate = useMemo(() => {
    const groups: { [dateStr: string]: Transaction[] } = {};
    filteredTransactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort().reverse();
    return sortedDates.map((date) => ({
      date,
      transactions: groups[date],
      totalDayExpenseCents: groups[date]
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amountCents || 0), 0),
      totalDayIncomeCents: groups[date]
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (t.amountCents || 0), 0),
    }));
  }, [filteredTransactions]);

  const formatMonthLabel = (monthKey: string) => {
    const parts = monthKey.split('-');
    if (parts.length === 2) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    }
    return monthKey;
  };

  return (
    <div id="history-view" className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#102A43] tracking-tight">Histórico de Finanças</h1>
          <p className="text-xs text-[#627D98]">Todas as suas receitas e despesas registradas</p>
        </div>
        <span className="text-xs font-bold bg-[#E2E8F0] text-[#102A43] px-2.5 py-1 rounded-full">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Search & Month Filter Bento Card */}
      <div className="space-y-2.5 bg-white border border-[#E2E8F0] p-3.5 rounded-3xl shadow-xs">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#627D98] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="history-search-input"
            placeholder="Buscar por descrição ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F0F4F8] border border-[#E2E8F0] focus:border-[#159FEF] text-[#102A43] text-xs font-medium rounded-2xl pl-9 pr-3 py-2.5 outline-none transition-colors"
          />
        </div>

        {/* Filters row: Month & Type & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Type Filter Pills */}
          <div className="flex bg-[#F0F4F8] p-1 rounded-2xl border border-[#E2E8F0]">
            <button
              id="history-filter-all"
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                typeFilter === 'all' ? 'bg-white text-[#102A43] shadow-xs' : 'text-[#627D98] hover:text-[#102A43]'
              }`}
            >
              Todos
            </button>
            <button
              id="history-filter-expenses"
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                typeFilter === 'expense' ? 'bg-[#DC2626] text-white shadow-xs' : 'text-[#627D98] hover:text-[#DC2626]'
              }`}
            >
              Gastos
            </button>
            <button
              id="history-filter-incomes"
              onClick={() => setTypeFilter('income')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                typeFilter === 'income' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-[#627D98] hover:text-[#16A34A]'
              }`}
            >
              Ganhos
            </button>
          </div>

          <div className="flex gap-2">
            {/* Month Dropdown */}
            <select
              id="history-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Filtrar por período"
              className="flex-1 bg-[#F0F4F8] border border-[#E2E8F0] text-[#102A43] text-xs font-bold rounded-2xl px-3 py-2 outline-none capitalize"
            >
              <option value="all">Todo o período</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>

            {/* Category Dropdown */}
            <select
              id="history-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filtrar por categoria"
              className="flex-1 bg-[#F0F4F8] border border-[#E2E8F0] text-[#102A43] text-xs font-bold rounded-2xl px-3 py-2 outline-none"
            >
              <option value="all">Todas as categorias</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button if any filter is active */}
        {(typeFilter !== 'all' || selectedMonth !== 'all' || selectedCategory !== 'all' || searchQuery.trim() !== '') && (
          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[#627D98] text-[11px]">Filtros aplicados</span>
            <button
              id="clear-filters-btn"
              onClick={() => {
                setTypeFilter('all');
                setSelectedMonth('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-[#159FEF] font-bold hover:underline text-xs"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* List / Grouped view */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="flex justify-center">
            <PingoMascot mood="alert" size={64} />
          </div>
          <p className="text-sm font-bold text-[#102A43]">Nenhum lançamento encontrado</p>
          <p className="text-xs text-[#627D98] max-w-xs mx-auto">
            {searchQuery || typeFilter !== 'all' || selectedMonth !== 'all'
              ? 'Tente remover os filtros de busca para ver outros lançamentos.'
              : 'Seu histórico está vazio. Registre uma movimentação para começar.'}
          </p>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsQuickAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-[#159FEF] hover:bg-[#0D7EBF] text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Agora</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Day Header */}
              <div className="flex items-center justify-between px-1.5 text-xs text-[#627D98]">
                <span className="font-bold text-[#102A43] capitalize">
                  {formatFriendlyDate(group.date)}
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  {group.totalDayExpenseCents > 0 && (
                    <span className="text-[#DC2626] font-bold">
                      - {formatCentsToBRL(group.totalDayExpenseCents)}
                    </span>
                  )}
                  {group.totalDayIncomeCents > 0 && (
                    <span className="text-[#16A34A] font-bold">
                      + {formatCentsToBRL(group.totalDayIncomeCents)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in Day Bento Cards */}
              <div className="space-y-1.5">
                {group.transactions.map((tx) => {
                  const cat = getCategoryById(tx.categoryId);
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setEditingTransaction(tx)}
                      className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.99] shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F0F4F8] border border-[#E2E8F0] flex items-center justify-center text-base shrink-0">
                          {cat?.icon || (isExpense ? '📦' : '💵')}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-[#102A43] leading-tight">
                            {tx.description || cat?.name}
                          </h3>
                          <span className="text-[10px] text-[#627D98]">
                            {cat?.name || (isExpense ? 'Despesa' : 'Receita')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xs font-black ${
                            isExpense ? 'text-[#DC2626]' : 'text-[#16A34A]'
                          }`}
                        >
                          {isExpense ? '- ' : '+ '}
                          {formatCentsToBRL(tx.amountCents)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
