import React, { useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { PingoMascot } from './PingoMascot';
import { formatCentsToBRL, getTodayDateString, formatFriendlyDate } from '../utils/formatters';
import { getCurrentFinancialPeriod, isDateInPeriod } from '../utils/period';
import { ArrowDownRight, ArrowUpRight, Plus, Moon, AlertCircle, ArrowRight, Calendar } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { data, summary, setIsQuickAddOpen, setEditingTransaction, getCategoryById, setActiveTab } = useWallet();

  const todayStr = getTodayDateString();
  const userName = data.userProfile?.name?.trim() || data.settings?.userName?.trim() || '';
  const frequency = data.userProfile?.paymentFrequency || 'monthly';
  const currentPeriod = useMemo(() => getCurrentFinancialPeriod(frequency), [frequency]);

  // Recent transactions (up to 5 most recent)
  const recentTransactions = useMemo(() => {
    return [...data.transactions]
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createdAt - a.createdAt;
      })
      .slice(0, 5);
  }, [data.transactions]);

  // Top Expenses by Category in the current financial period
  const topExpenseCategories = useMemo(() => {
    const expensesInPeriod = data.transactions.filter(
      (tx) => tx.type === 'expense' && isDateInPeriod(tx.date, currentPeriod)
    );

    const categoryMap = new Map<string, number>();
    expensesInPeriod.forEach((tx) => {
      categoryMap.set(tx.categoryId, (categoryMap.get(tx.categoryId) || 0) + tx.amountCents);
    });

    const totalPeriodExpense = summary.periodExpenseCents;

    const sorted = Array.from(categoryMap.entries())
      .map(([catId, totalCents]) => {
        const cat = getCategoryById(catId);
        const percent = totalPeriodExpense > 0 ? Math.round((totalCents / totalPeriodExpense) * 100) : 0;
        return {
          id: catId,
          name: cat?.name || 'Outros',
          icon: cat?.icon || '📦',
          totalCents,
          percent,
        };
      })
      .sort((a, b) => b.totalCents - a.totalCents)
      .slice(0, 4);

    return sorted;
  }, [data.transactions, currentPeriod, summary.periodExpenseCents, getCategoryById]);

  // Determine greeting based on local hour and user name
  const currentHour = new Date().getHours();
  let greeting = userName ? `Boa noite, ${userName} 🌙` : 'Fechamento Noturno 🌙';
  let promptText = 'Anote os gastos de hoje e durma com a mente tranquila.';
  let pingoMood: 'calm' | 'happy' | 'sleeping' | 'celebrating' = 'calm';

  if (currentHour >= 5 && currentHour < 12) {
    greeting = userName ? `Bom dia, ${userName} 👋` : 'Bom dia!';
    promptText = 'Comece o dia sabendo exatamente sua situação.';
    pingoMood = 'happy';
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = userName ? `Boa tarde, ${userName}.` : 'Boa tarde!';
    promptText = 'Mantenha o controle das movimentações do seu dia.';
    pingoMood = 'happy';
  } else {
    pingoMood = summary.todayExpenseCents > 0 ? 'celebrating' : 'sleeping';
  }

  // Budget limit adapted to the period
  const budgetLimit = data.settings.monthlyExpenseLimitCents || 0;
  const budgetPercent = budgetLimit > 0 ? Math.min(100, Math.round((summary.periodExpenseCents / budgetLimit) * 100)) : 0;
  const isBudgetExceeded = budgetLimit > 0 && summary.periodExpenseCents > budgetLimit;
  const remainingBudget = Math.max(0, budgetLimit - summary.periodExpenseCents);

  return (
    <div id="dashboard-view" className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Saudação & Hero Bento Card */}
      <div className="bg-[#102A43] text-white border border-[#102A43] rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1 z-10 max-w-[70%]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#159FEF]">
              <Moon className="w-3.5 h-3.5" />
              <span>pingowallet10</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">{greeting}</h1>
            <p className="text-xs text-[#9FB3C8] leading-relaxed">{promptText}</p>
          </div>

          <div className="shrink-0 flex items-center justify-center">
            <PingoMascot mood={pingoMood} size={68} className="drop-shadow-sm" />
          </div>
        </div>

        {/* Atalhos para registrar movimentação */}
        <div className="mt-4 pt-4 border-t border-[#1C4269] flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-[#9FB3C8] uppercase font-bold tracking-wider">
              Gastos de Hoje
            </span>
            <div className="text-lg font-black text-white">
              {formatCentsToBRL(summary.todayExpenseCents)}
            </div>
          </div>

          <button
            id="dashboard-quick-add-btn"
            onClick={() => {
              setEditingTransaction(null);
              setIsQuickAddOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#159FEF] hover:bg-[#0D7EBF] active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Anotar Gasto</span>
          </button>
        </div>
      </div>

      {/* 2, 3, 4 & 5. Saldo Atual, Receitas, Despesas e Resultado do Período */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs space-y-4">
        {/* 2. Saldo Geral */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">
              Saldo Geral Acumulado
            </span>
            <div className="text-3xl font-black text-[#102A43] tracking-tight mt-0.5">
              {formatCentsToBRL(summary.balanceCents)}
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              summary.balanceCents >= 0
                ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
            }`}
          >
            {summary.balanceCents >= 0 ? 'Saldo Positivo' : 'Saldo Negativo'}
          </span>
        </div>

        {/* Período Context Indicator */}
        <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-2xl text-xs">
          <div className="flex items-center gap-1.5 text-[#334E68] font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#159FEF]" />
            <span>{summary.periodGreetingContext}</span>
          </div>
          <span className="text-[11px] text-[#627D98] font-medium">
            {summary.periodDescription}
          </span>
        </div>

        {/* 3 & 4. Receitas e Despesas do Período Dinâmico */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Receitas do Período */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-3 rounded-2xl">
            <div className="flex items-center gap-1 text-xs text-[#16A34A] font-bold mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Receitas {summary.periodNoun}</span>
            </div>
            <div className="text-base font-black text-[#15803D]">
              {formatCentsToBRL(summary.periodIncomeCents)}
            </div>
          </div>

          {/* Despesas do Período */}
          <div className="bg-[#FEF2F2] border border-[#FEE2E2] p-3 rounded-2xl">
            <div className="flex items-center gap-1 text-xs text-[#DC2626] font-bold mb-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Despesas {summary.periodNoun}</span>
            </div>
            <div className="text-base font-black text-[#B91C1C]">
              {formatCentsToBRL(summary.periodExpenseCents)}
            </div>
          </div>
        </div>

        {/* 5. Resultado do Período (Bento Row) */}
        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
          <span className="text-[#627D98] font-semibold">Resultado {summary.periodLabel}:</span>
          <span
            className={`font-black text-sm ${
              summary.periodBalanceCents >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
            }`}
          >
            {summary.periodBalanceCents >= 0 ? '+ ' : ''}
            {formatCentsToBRL(summary.periodBalanceCents)}
          </span>
        </div>

        {/* Planejamento de Gastos / Teto do Período */}
        {budgetLimit > 0 && (
          <div className="pt-3 space-y-2 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#627D98] font-semibold">Teto de Gastos ({summary.periodNoun}):</span>
              <span className="font-bold text-[#102A43]">
                {formatCentsToBRL(summary.periodExpenseCents)} / {formatCentsToBRL(budgetLimit)}
              </span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isBudgetExceeded ? 'bg-[#DC2626]' : budgetPercent > 80 ? 'bg-[#F5B82E]' : 'bg-[#159FEF]'
                }`}
                style={{ width: `${Math.min(100, budgetPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#627D98]">
                {isBudgetExceeded ? (
                  <span className="text-[#DC2626] font-bold">Teto ultrapassado</span>
                ) : (
                  <span>Ainda pode gastar: <strong className="text-[#059669]">{formatCentsToBRL(remainingBudget)}</strong></span>
                )}
              </span>
              <span className="text-[#627D98]">{budgetPercent}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 6. Principais Gastos do Período (Categorias) */}
      {topExpenseCategories.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#627D98]">
              Principais Gastos {summary.periodLabel}
            </h2>
            <span className="text-[11px] text-[#627D98] font-medium">Top Categorias</span>
          </div>

          <div className="space-y-2.5">
            {topExpenseCategories.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-bold text-[#102A43]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-[#627D98] text-[11px]">{item.percent}%</span>
                    <span className="text-[#DC2626]">{formatCentsToBRL(item.totalCents)}</span>
                  </div>
                </div>
                <div className="w-full bg-[#F0F4F8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#159FEF] h-full rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Histórico Recente */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#627D98]">
            Histórico Recente
          </h2>
          <button
            id="view-all-history-btn"
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-[#159FEF] hover:text-[#0D7EBF] flex items-center gap-1"
          >
            <span>Ver tudo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 text-center space-y-3 shadow-xs">
            <div className="flex justify-center">
              <PingoMascot mood="sleeping" size={56} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#102A43]">Nenhum lançamento registrado</p>
              <p className="text-xs text-[#627D98] max-w-xs mx-auto">
                Adicione seu primeiro ganho ou gasto do dia para começar a acompanhar seu saldo.
              </p>
            </div>
            <button
              id="empty-dashboard-add-btn"
              onClick={() => {
                setEditingTransaction(null);
                setIsQuickAddOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-[#159FEF] hover:bg-[#0D7EBF] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primeiro Gasto</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const cat = getCategoryById(tx.categoryId);
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  id={`dashboard-tx-${tx.id}`}
                  onClick={() => setEditingTransaction(tx)}
                  className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-150 active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F0F4F8] border border-[#E2E8F0] flex items-center justify-center text-lg shrink-0">
                      {cat?.icon || (isExpense ? '📦' : '💵')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#102A43] leading-tight">
                        {tx.description || cat?.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-[#627D98] font-medium">
                        <span>{cat?.name || (isExpense ? 'Despesa' : 'Receita')}</span>
                        <span>•</span>
                        <span>{formatFriendlyDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-black ${
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
        )}
      </div>
    </div>
  );
};


