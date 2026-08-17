export type DiaryType = 'full' | 'half' | 'absence';

export type DiaryRecord = {
  id: string;
  date: string;
  type: DiaryType;
  amount: number;
  note?: string;
  createdAt: string;
};

export type DiarySettings = {
  defaultAmount: number;
  name: string;
  accessibilityMode: boolean;
};

export const DEFAULT_SETTINGS: DiarySettings = {
  defaultAmount: 120,
  name: '',
  accessibilityMode: false,
};

export const STORAGE_KEYS = {
  records: '@minhas-diarias/records',
  settings: '@minhas-diarias/settings',
};

export function toDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(dateKey: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateFromKey(dateKey));
}

export function formatLongDate(dateKey: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(dateFromKey(dateKey));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function typeLabel(type: DiaryType): string {
  if (type === 'half') return 'Meia diária';
  if (type === 'absence') return 'Falta';
  return 'Diária completa';
}

export function amountForType(defaultAmount: number, type: DiaryType): number {
  if (type === 'half') return defaultAmount / 2;
  if (type === 'absence') return 0;
  return defaultAmount;
}

export function makeDiaryRecord(
  date: string,
  defaultAmount: number,
  type: DiaryType = 'full',
): DiaryRecord {
  return {
    id: `${date}-${type}`,
    date,
    type,
    amount: amountForType(defaultAmount, type),
    createdAt: new Date().toISOString(),
  };
}
