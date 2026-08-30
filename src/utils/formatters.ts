/**
 * Utility functions for precise BRL financial calculations and formatting.
 * All monetary amounts are handled strictly as integer cents to avoid JavaScript float issues.
 */

export const BRL_CURRENCY_CONFIG = {
  locale: 'pt-BR',
  currency: 'BRL',
};

/**
 * Format integer cents into BRL string (e.g. 2450 -> "R$ 24,50")
 */
export function formatCentsToBRL(cents: number): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat(BRL_CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: BRL_CURRENCY_CONFIG.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeCents / 100);
}

/**
 * Convert user input (string or float number) into integer cents.
 * Handles "25,50", "25.50", "R$ 25,50", "1.250,50", etc.
 */
export function parseInputToCents(val: string | number): number {
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return 0;
    return Math.round(val * 100);
  }

  if (!val || typeof val !== 'string') return 0;

  // Remove currency symbols, spaces, and non-numeric characters except comma and dot
  let clean = val.replace(/[^\d.,]/g, '').trim();

  if (!clean) return 0;

  // Check if standard brazilian format with thousand dot and comma decimal (e.g. 1.250,50)
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      // 1.250,50 -> 1250.50
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,250.50 -> 1250.50
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    // 25,50 -> 25.50
    clean = clean.replace(',', '.');
  }

  const parsed = parseFloat(clean);
  if (isNaN(parsed) || !isFinite(parsed)) return 0;

  return Math.round(parsed * 100);
}

/**
 * Formats a date string (YYYY-MM-DD) to friendly Brazilian format (e.g., "Hoje", "Ontem", "qui., 28 de ago.")
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  
  const todayStr = getTodayDateString();
  
  // Calculate yesterday in local time (not UTC) to prevent timezone mismatch
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yYear = yesterday.getFullYear();
  const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

  if (dateStr === todayStr) {
    return 'Hoje';
  }
  if (dateStr === yesterdayStr) {
    return 'Ontem';
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      weekday: 'short',
    }).format(date);
  }

  return dateStr;
}

/**
 * Returns today's date in local YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current month string in YYYY-MM
 */
export function getCurrentMonthKey(): string {
  return getTodayDateString().slice(0, 7);
}

/**
 * Generate a unique collision-free ID for transactions/categories without external dependencies
 */
export function generateUniqueId(prefix = 'tx'): string {
  const time = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${time}_${randomPart}`;
}
