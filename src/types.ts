export type TransactionType = 'expense' | 'income';

export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface UserProfile {
  name: string;
  paymentFrequency: PaymentFrequency;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number; // Integer representation of currency in cents (e.g., 2450 = R$ 24,50)
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  createdAt: number; // timestamp ms
  updatedAt?: number; // timestamp ms
}

export interface AppSettings {
  currency: string;
  locale: string;
  monthlyExpenseLimitCents: number; // 0 = disabled
  nightReviewReminder: boolean;
  userName?: string;
}

export interface AppDataSchema {
  version: number;
  lastUpdated: string;
  userProfile?: UserProfile;
  hasCompletedOnboarding?: boolean;
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
}

export type ViewTab = 'dashboard' | 'history' | 'categories' | 'settings';

export interface FinancialSummary {
  totalIncomeCents: number;
  totalExpenseCents: number;
  balanceCents: number;
  
  // Current dynamic financial period metrics (Weekly, Biweekly or Monthly)
  periodIncomeCents: number;
  periodExpenseCents: number;
  periodBalanceCents: number;
  periodLabel: string; // "desta semana", "desta quinzena", "deste mês"
  periodNoun: string;  // "Semana", "Quinzena", "Mês"
  periodDescription: string; // "Você recebe semanalmente.", etc.
  periodGreetingContext: string;
  periodStartDateStr: string;
  periodEndDateStr: string;
  periodDaysRemaining: number;

  // Legacy/Reference Month metrics
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthBalanceCents: number;

  // Today metrics
  todayExpenseCents: number;
  todayIncomeCents: number;
  todayTransactionsCount: number;
}

