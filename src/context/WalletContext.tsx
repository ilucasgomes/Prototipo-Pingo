import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { AppDataSchema, Transaction, Category, AppSettings, ViewTab, FinancialSummary, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { INITIAL_APP_DATA } from '../services/defaultData';
import { getTodayDateString, getCurrentMonthKey } from '../utils/formatters';
import { getCurrentFinancialPeriod, isDateInPeriod } from '../utils/period';

interface WalletContextType {
  data: AppDataSchema;
  summary: FinancialSummary;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Onboarding & Profile Actions
  completeOnboarding: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Transactions Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => boolean;
  deleteTransaction: (id: string) => boolean;

  // Categories Actions
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => boolean;
  deleteCategory: (id: string) => { success: boolean; reason?: string };

  // Settings & Storage Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string) => { success: boolean; error?: string };
  resetAll: () => void;

  // Helpers
  getCategoryById: (id: string) => Category | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppDataSchema>(() => StorageService.loadData());
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state changes with localStorage
  useEffect(() => {
    StorageService.saveData(data);
  }, [data]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  }, []);

  // Category lookup helper
  const getCategoryById = useCallback((id: string): Category | undefined => {
    return data.categories.find((c) => c.id === id);
  }, [data.categories]);

  // Compute financial totals and metrics based on dynamic period
  const summary = useMemo<FinancialSummary>(() => {
    const today = getTodayDateString();
    const currentMonth = getCurrentMonthKey();
    const frequency = data.userProfile?.paymentFrequency || 'monthly';
    const period = getCurrentFinancialPeriod(frequency);

    let totalIncomeCents = 0;
    let totalExpenseCents = 0;

    let periodIncomeCents = 0;
    let periodExpenseCents = 0;

    let monthIncomeCents = 0;
    let monthExpenseCents = 0;

    let todayExpenseCents = 0;
    let todayIncomeCents = 0;
    let todayTransactionsCount = 0;

    data.transactions.forEach((tx) => {
      const isExpense = tx.type === 'expense';
      const amount = tx.amountCents || 0;

      // Accumulated overall
      if (isExpense) {
        totalExpenseCents += amount;
      } else {
        totalIncomeCents += amount;
      }

      // Dynamic Financial Period (Weekly, Biweekly or Monthly)
      if (isDateInPeriod(tx.date, period)) {
        if (isExpense) {
          periodExpenseCents += amount;
        } else {
          periodIncomeCents += amount;
        }
      }

      // Month stats
      if (tx.date && tx.date.startsWith(currentMonth)) {
        if (isExpense) {
          monthExpenseCents += amount;
        } else {
          monthIncomeCents += amount;
        }
      }

      // Today stats
      if (tx.date === today) {
        todayTransactionsCount += 1;
        if (isExpense) {
          todayExpenseCents += amount;
        } else {
          todayIncomeCents += amount;
        }
      }
    });

    return {
      totalIncomeCents,
      totalExpenseCents,
      balanceCents: totalIncomeCents - totalExpenseCents,
      
      // Dynamic period metrics
      periodIncomeCents,
      periodExpenseCents,
      periodBalanceCents: periodIncomeCents - periodExpenseCents,
      periodLabel: period.periodLabel,
      periodNoun: period.periodNoun,
      periodDescription: period.periodDescription,
      periodGreetingContext: period.periodGreetingContext,
      periodStartDateStr: period.startDateStr,
      periodEndDateStr: period.endDateStr,
      periodDaysRemaining: period.daysRemaining,

      // Legacy/Reference Month metrics
      monthIncomeCents,
      monthExpenseCents,
      monthBalanceCents: monthIncomeCents - monthExpenseCents,

      todayExpenseCents,
      todayIncomeCents,
      todayTransactionsCount,
    };
  }, [data.transactions, data.userProfile?.paymentFrequency]);

  // --- Onboarding & User Profile Actions ---
  const completeOnboarding = useCallback((profile: UserProfile) => {
    setData((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
      userProfile: {
        name: profile.name.trim(),
        paymentFrequency: profile.paymentFrequency,
      },
      settings: {
        ...prev.settings,
        userName: profile.name.trim(),
      },
    }));
    showToast(`Bem-vindo, ${profile.name.trim()}! 💧`);
  }, [showToast]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setData((prev) => {
      const currentProfile = prev.userProfile || { name: '', paymentFrequency: 'monthly' };
      const updatedProfile: UserProfile = {
        name: updates.name !== undefined ? updates.name.trim() : currentProfile.name,
        paymentFrequency: updates.paymentFrequency || currentProfile.paymentFrequency,
      };

      return {
        ...prev,
        userProfile: updatedProfile,
        settings: {
          ...prev.settings,
          userName: updatedProfile.name,
        },
      };
    });
    showToast('Perfil atualizado com sucesso!');
  }, [showToast]);

  // --- Transactions Actions ---
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const now = Date.now();
    const newTx: Transaction = {
      ...txData,
      id: `tx_${now}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
    };

    setData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));

    showToast(newTx.type === 'expense' ? 'Despesa registrada com sucesso!' : 'Receita registrada com sucesso!');
    return newTx;
  }, [showToast]);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): boolean => {
    let found = false;
    setData((prev) => {
      const index = prev.transactions.findIndex((t) => t.id === id);
      if (index === -1) return prev;
      found = true;
      const updatedTransactions = [...prev.transactions];
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        ...updates,
        updatedAt: Date.now(),
      };
      return {
        ...prev,
        transactions: updatedTransactions,
      };
    });

    if (found) {
      showToast('Lançamento atualizado!');
    }
    return found;
  }, [showToast]);

  const deleteTransaction = useCallback((id: string): boolean => {
    let found = false;
    setData((prev) => {
      const exists = prev.transactions.some((t) => t.id === id);
      if (!exists) return prev;
      found = true;
      return {
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      };
    });

    if (found) {
      showToast('Lançamento excluído.');
    }
    return found;
  }, [showToast]);

  // --- Categories Actions ---
  const addCategory = useCallback((catData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isDefault: false,
    };

    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));

    showToast(`Categoria "${newCat.name}" criada!`);
    return newCat;
  }, [showToast]);

  const updateCategory = useCallback((id: string, updates: Partial<Omit<Category, 'id'>>): boolean => {
    let found = false;
    setData((prev) => {
      const idx = prev.categories.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      found = true;
      const updatedCats = [...prev.categories];
      updatedCats[idx] = {
        ...updatedCats[idx],
        ...updates,
      };
      return {
        ...prev,
        categories: updatedCats,
      };
    });

    if (found) {
      showToast('Categoria atualizada!');
    }
    return found;
  }, [showToast]);

  const deleteCategory = useCallback((id: string): { success: boolean; reason?: string } => {
    // Check if category is used in transactions
    const countUsed = data.transactions.filter((t) => t.categoryId === id).length;
    if (countUsed > 0) {
      return {
        success: false,
        reason: `Esta categoria está sendo usada em ${countUsed} lançamento(s). Transfira os lançamentos antes de excluir.`,
      };
    }

    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));

    showToast('Categoria removida.');
    return { success: true };
  }, [data.transactions, showToast]);

  // --- Settings Actions ---
  const updateSettings = useCallback((settingsUpdates: Partial<AppSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settingsUpdates,
      },
    }));
    showToast('Configurações salvas!');
  }, [showToast]);

  // --- Backup & Restore ---
  const exportBackup = useCallback(() => {
    StorageService.exportBackup(data);
    showToast('Backup baixado com sucesso!');
  }, [data, showToast]);

  const importBackup = useCallback((jsonStr: string) => {
    const result = StorageService.parseBackupFile(jsonStr);
    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Erro ao processar backup.' };
    }

    setData(result.data);
    StorageService.saveData(result.data);
    showToast('Dados restaurados com sucesso!');
    return { success: true };
  }, [showToast]);

  const resetAll = useCallback(() => {
    StorageService.resetAllData();
    setData({ ...INITIAL_APP_DATA });
    showToast('Aplicativo zerado com sucesso.');
  }, [showToast]);

  const value = {
    data,
    summary,
    activeTab,
    setActiveTab,
    isQuickAddOpen,
    setIsQuickAddOpen,
    editingTransaction,
    setEditingTransaction,
    toastMessage,
    showToast,
    completeOnboarding,
    updateUserProfile,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
    exportBackup,
    importBackup,
    resetAll,
    getCategoryById,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet deve ser utilizado dentro de um WalletProvider');
  }
  return context;
};
