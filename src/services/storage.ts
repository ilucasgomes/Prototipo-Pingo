import { AppDataSchema, Transaction, Category } from '../types';
import { INITIAL_APP_DATA } from './defaultData';

export const STORAGE_KEY = 'pingowallet10_data_v1';

export class StorageService {
  /**
   * Loads persisted data from localStorage with graceful fallback and validation
   */
  static loadData(): AppDataSchema {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        this.saveData(INITIAL_APP_DATA);
        return INITIAL_APP_DATA;
      }

      const parsed = JSON.parse(serialized) as AppDataSchema;

      // Basic structure validation
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) {
        console.warn('[PingoStorage] Dados corrompidos encontrados. Restaurando padrão.');
        return INITIAL_APP_DATA;
      }

      // Schema migration support
      if (!parsed.version || parsed.version < INITIAL_APP_DATA.version) {
        parsed.version = INITIAL_APP_DATA.version;
      }

      // Ensure settings exists
      if (!parsed.settings) {
        parsed.settings = { ...INITIAL_APP_DATA.settings };
      }

      // Ensure userProfile exists and has valid values
      if (!parsed.userProfile || typeof parsed.userProfile !== 'object') {
        parsed.userProfile = {
          name: parsed.settings?.userName || '',
          paymentFrequency: 'monthly',
        };
      } else {
        const validFreqs = ['weekly', 'biweekly', 'monthly'];
        if (!validFreqs.includes(parsed.userProfile.paymentFrequency)) {
          parsed.userProfile.paymentFrequency = 'monthly';
        }
        parsed.userProfile.name = typeof parsed.userProfile.name === 'string' ? parsed.userProfile.name.trim() : '';
      }

      // Ensure hasCompletedOnboarding flag
      if (typeof parsed.hasCompletedOnboarding !== 'boolean') {
        // If user already has a name or existing transactions, consider onboarding complete for seamless migration
        parsed.hasCompletedOnboarding = Boolean(parsed.userProfile.name || parsed.transactions.length > 0);
      }

      return parsed;
    } catch (err) {
      console.error('[PingoStorage] Erro ao carregar localStorage:', err);
      return INITIAL_APP_DATA;
    }
  }

  /**
   * Persists entire app data structure to localStorage
   */
  static saveData(data: AppDataSchema): boolean {
    try {
      data.lastUpdated = new Date().toISOString();
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (err) {
      console.error('[PingoStorage] Falha ao salvar no localStorage:', err);
      return false;
    }
  }

  /**
   * Generates a downloadable JSON backup file blob
   */
  static exportBackup(data: AppDataSchema): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const today = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pingowallet_backup_${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates and imports JSON backup content
   */
  static parseBackupFile(jsonString: string): { success: boolean; data?: AppDataSchema; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Arquivo inválido. O conteúdo não é um JSON válido.' };
      }

      if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories)) {
        return { success: false, error: 'Estrutura de dados incompatível. Faltam transações ou categorias.' };
      }

      // Validate integrity of transactions
      const validTransactions: Transaction[] = parsed.transactions
        .filter((tx: any) => 
          tx && typeof tx.id === 'string' &&
          (tx.type === 'expense' || tx.type === 'income') &&
          typeof tx.amountCents === 'number' &&
          Number.isFinite(tx.amountCents) &&
          tx.amountCents > 0 &&
          typeof tx.date === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(tx.date)
        )
        .map((tx: any) => ({
          id: tx.id,
          type: tx.type,
          amountCents: Math.round(tx.amountCents),
          description: typeof tx.description === 'string' ? tx.description.trim() : '',
          categoryId: typeof tx.categoryId === 'string' ? tx.categoryId : 'cat_outros_desp',
          date: tx.date,
          createdAt: typeof tx.createdAt === 'number' ? tx.createdAt : Date.now(),
        }));

      // Validate categories
      const validCategories: Category[] = parsed.categories
        .filter((cat: any) =>
          cat && typeof cat.id === 'string' &&
          typeof cat.name === 'string' &&
          cat.name.trim().length > 0 &&
          (cat.type === 'expense' || cat.type === 'income')
        )
        .map((cat: any) => ({
          id: cat.id,
          name: cat.name.trim(),
          icon: typeof cat.icon === 'string' ? cat.icon : '📦',
          type: cat.type,
          color: typeof cat.color === 'string' ? cat.color : undefined,
          isDefault: Boolean(cat.isDefault),
        }));

      let userProfile = parsed.userProfile;
      if (!userProfile || typeof userProfile !== 'object') {
        userProfile = {
          name: parsed.settings?.userName || '',
          paymentFrequency: 'monthly',
        };
      } else {
        const validFreqs = ['weekly', 'biweekly', 'monthly'];
        const freq = validFreqs.includes(userProfile.paymentFrequency) ? userProfile.paymentFrequency : 'monthly';
        userProfile = {
          name: typeof userProfile.name === 'string' ? userProfile.name.trim() : '',
          paymentFrequency: freq,
        };
      }

      const hasCompletedOnboarding = typeof parsed.hasCompletedOnboarding === 'boolean'
        ? parsed.hasCompletedOnboarding
        : Boolean(userProfile.name || validTransactions.length > 0);

      const cleanData: AppDataSchema = {
        version: parsed.version || 1,
        lastUpdated: new Date().toISOString(),
        userProfile,
        hasCompletedOnboarding,
        settings: parsed.settings || { ...INITIAL_APP_DATA.settings },
        categories: validCategories.length > 0 ? validCategories : INITIAL_APP_DATA.categories,
        transactions: validTransactions,
      };

      return { success: true, data: cleanData };
    } catch (err: any) {
      return { success: false, error: 'Falha ao ler o arquivo: ' + (err.message || 'formato incorreto') };
    }
  }

  /**
   * Clears all user data and resets to clean initial state
   */
  static resetAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.saveData(INITIAL_APP_DATA);
    } catch (err) {
      console.error('[PingoStorage] Erro ao resetar dados:', err);
    }
  }
}
