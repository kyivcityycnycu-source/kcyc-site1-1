const UK_GENITIVE: Record<string, string> = {
  січня: 'January',
  лютого: 'February',
  березня: 'March',
  квітня: 'April',
  травня: 'May',
  червня: 'June',
  липня: 'July',
  серпня: 'August',
  вересня: 'September',
  жовтня: 'October',
  листопада: 'November',
  грудня: 'December',
};

/**
 * Display dates for the current UI language.
 * - ISO / Date-parseable → locale string
 * - Free text with Ukrainian month names → English months when lang=en
 */
export function formatDisplayDate(
  value: string | undefined | null,
  language: 'uk' | 'en'
): string {
  if (!value) return '';

  const trimmed = value.trim();
  const asDate = new Date(trimmed);
  if (!Number.isNaN(asDate.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return asDate.toLocaleDateString(language === 'uk' ? 'uk-UA' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (language === 'en') {
    let out = trimmed;
    for (const [uk, en] of Object.entries(UK_GENITIVE)) {
      out = out.replace(new RegExp(uk, 'gi'), en);
    }
    return out;
  }

  return trimmed;
}
