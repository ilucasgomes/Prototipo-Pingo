import { Category, AppDataSchema } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Despesas solicitadas
  { id: 'cat_moradia', name: 'Moradia', icon: '🏠', type: 'expense', color: '#8B5CF6', isDefault: true },
  { id: 'cat_alimentacao', name: 'Alimentação', icon: '🍔', type: 'expense', color: '#EF4444', isDefault: true },
  { id: 'cat_transporte', name: 'Transporte', icon: '🚌', type: 'expense', color: '#F97316', isDefault: true },
  { id: 'cat_saude', name: 'Saúde', icon: '💊', type: 'expense', color: '#EC4899', isDefault: true },
  { id: 'cat_lazer', name: 'Lazer', icon: '☕', type: 'expense', color: '#06B6D4', isDefault: true },
  { id: 'cat_contas', name: 'Contas', icon: '📄', type: 'expense', color: '#6366F1', isDefault: true },
  { id: 'cat_compras', name: 'Compras', icon: '🛍️', type: 'expense', color: '#3B82F6', isDefault: true },
  { id: 'cat_educacao', name: 'Educação', icon: '📚', type: 'expense', color: '#10B981', isDefault: true },
  { id: 'cat_trabalho_desp', name: 'Trabalho', icon: '💼', type: 'expense', color: '#64748B', isDefault: true },
  { id: 'cat_outros_desp', name: 'Outros', icon: '📦', type: 'expense', color: '#94A3B8', isDefault: true },

  // Receitas correspondentes
  { id: 'cat_trabalho_rec', name: 'Trabalho / Salário', icon: '💵', type: 'income', color: '#10B981', isDefault: true },
  { id: 'cat_extra_rec', name: 'Renda Extra / Bico', icon: '⚡', type: 'income', color: '#F59E0B', isDefault: true },
  { id: 'cat_vendas_rec', name: 'Vendas', icon: '🏷️', type: 'income', color: '#14B8A6', isDefault: true },
  { id: 'cat_outros_rec', name: 'Outras Receitas', icon: '📥', type: 'income', color: '#8B5CF6', isDefault: true },
];

export const INITIAL_APP_DATA: AppDataSchema = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  hasCompletedOnboarding: false,
  userProfile: {
    name: '',
    paymentFrequency: 'monthly',
  },
  settings: {
    currency: 'BRL',
    locale: 'pt-BR',
    monthlyExpenseLimitCents: 0,
    nightReviewReminder: true,
    userName: '',
  },
  categories: DEFAULT_CATEGORIES,
  transactions: [],
};
