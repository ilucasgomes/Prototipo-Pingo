import { PaymentFrequency } from '../types';

export interface FinancialPeriod {
  frequency: PaymentFrequency;
  startDateStr: string; // YYYY-MM-DD
  endDateStr: string;   // YYYY-MM-DD
  periodLabel: string;  // e.g. "desta semana", "desta quinzena", "deste mês"
  periodNoun: string;   // e.g. "Semana", "Quinzena", "Mês"
  periodDescription: string; // e.g. "Você recebe semanalmente.", etc.
  periodGreetingContext: string;
  daysRemaining: number;
}

/**
 * Returns the current financial period bounds based on the payment frequency
 * using local Brazilian timezone calculations.
 */
export function getCurrentFinancialPeriod(frequency: PaymentFrequency = 'monthly', refDate: Date = new Date()): FinancialPeriod {
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-indexed
  const day = refDate.getDate();

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (frequency === 'weekly') {
    // Week: Monday to Sunday
    const dayOfWeek = refDate.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(refDate);
    monday.setDate(refDate.getDate() + distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const todayYMD = formatYMD(refDate);
    const sundayYMD = formatYMD(sunday);
    const diffTime = sunday.getTime() - refDate.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      frequency: 'weekly',
      startDateStr: formatYMD(monday),
      endDateStr: sundayYMD,
      periodLabel: 'desta semana',
      periodNoun: 'Semana',
      periodDescription: 'Você recebe semanalmente.',
      periodGreetingContext: 'Seu resumo desta semana',
      daysRemaining,
    };
  }

  if (frequency === 'biweekly') {
    // Biweekly in Brazilian labor context: 1st Quinzena (1-15) and 2nd Quinzena (16-last day)
    let startDate: Date;
    let endDate: Date;

    if (day <= 15) {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month, 15);
    } else {
      startDate = new Date(year, month, 16);
      endDate = new Date(year, month + 1, 0); // Last day of month
    }

    const diffTime = endDate.getTime() - refDate.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      frequency: 'biweekly',
      startDateStr: formatYMD(startDate),
      endDateStr: formatYMD(endDate),
      periodLabel: 'desta quinzena',
      periodNoun: 'Quinzena',
      periodDescription: 'Você recebe a cada duas semanas.',
      periodGreetingContext: 'Seu resumo desta quinzena',
      daysRemaining,
    };
  }

  // Default: Monthly (1st to last day of month)
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const diffTime = endOfMonth.getTime() - refDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    frequency: 'monthly',
    startDateStr: formatYMD(startOfMonth),
    endDateStr: formatYMD(endOfMonth),
    periodLabel: 'deste mês',
    periodNoun: 'Mês',
    periodDescription: 'Você recebe mensalmente.',
    periodGreetingContext: 'Seu resumo deste mês',
    daysRemaining,
  };
}

/**
 * Checks whether a given transaction date string (YYYY-MM-DD) falls within the financial period.
 */
export function isDateInPeriod(dateStr: string, period: FinancialPeriod): boolean {
  if (!dateStr) return false;
  return dateStr >= period.startDateStr && dateStr <= period.endDateStr;
}
