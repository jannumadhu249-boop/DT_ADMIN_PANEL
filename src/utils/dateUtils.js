/**
 * dateUtils.js
 * Standardized Date Formatting for Dollar Tax Admin.
 * Format: MM/DD/YYYY
 */

export function formatDate(dateInput, fallback = '—') {
  if (!dateInput) return fallback;

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed || trimmed === '—' || trimmed === 'N/A') return fallback;

    // Already MM/DD/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // YYYY-MM-DD without time part (avoid timezone shifts)
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (ymdMatch) {
      const [, y, m, d] = ymdMatch;
      return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
    }

    // YYYY-MM-DD with time (e.g. 2026-09-29T11:43:35.000Z)
    const isoPrefixMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoPrefixMatch) {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      }
    }
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return typeof dateInput === 'string' ? dateInput : fallback;
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function formatDateTime(dateInput, fallback = '—') {
  if (!dateInput) return fallback;
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return formatDate(dateInput, fallback);
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}`;
}
