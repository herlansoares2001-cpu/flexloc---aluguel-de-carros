/**
 * Utility to get a Date object at local midnight from a 'YYYY-MM-DD' string.
 * This avoids timezone shifts compared to parsing with 'T00:00:00'.
 */
export const toLocalMidnight = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month - 1, day);
};

/**
 * Formats a Date object to 'YYYY-MM-DD' string.
 */
export const formatDateToLink = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Formats a 'YYYY-MM-DD' string or Date to Brazilian format 'DD/MM/YYYY'.
 */
export const formatBR = (date: string | Date): string => {
  const d = typeof date === 'string' ? toLocalMidnight(date) : date;
  if (!d) return '';
  return d.toLocaleDateString('pt-BR');
};
