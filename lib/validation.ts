export const FIELD_MAX = {
  name: 80,
  email: 100,
  /** Formatted UA phone: +380 XX XXX XX XX */
  phoneDisplay: 19,
  social: 40,
  shortText: 120,
  url: 200,
  longText: 2000,
} as const;

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/** UA: exactly +380 + 9 digits. Other countries: 10–15 digits. */
export const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('380')) return digits.length === 12;
  return digits.length >= 10 && digits.length <= 15;
};

/** Put +380 in the field on focus so the format example stays visible while typing. */
export const ensureUaPhonePrefix = (current: string): string => {
  const digits = current.replace(/\D/g, '');
  if (!digits || digits === '380') return '+380 ';
  return formatPhoneInput(current);
};

/**
 * Live phone mask for forms.
 * 067... / 67... / 380... → +380 67 123 45 67
 * Longer foreign numbers stay as +digits (max 15).
 */
export const formatPhoneInput = (raw: string): string => {
  let digits = raw.replace(/\D/g, '');
  if (!digits) {
    return raw.includes('+') ? '+' : '';
  }

  // 0XX… → 380XX…
  if (digits.startsWith('0')) {
    digits = '380' + digits.slice(1);
  }

  const looksUa =
    digits.startsWith('380') ||
    digits.startsWith('38') ||
    (!digits.startsWith('38') && digits.length <= 9);

  if (looksUa) {
    if (!digits.startsWith('380') && !digits.startsWith('38')) {
      digits = '380' + digits;
    }
    digits = digits.slice(0, 12);

    if (!digits.startsWith('380')) {
      return `+${digits}`;
    }

    const rest = digits.slice(3);
    let out = '+380';
    if (rest.length > 0) out += ` ${rest.slice(0, 2)}`;
    if (rest.length > 2) out += ` ${rest.slice(2, 5)}`;
    if (rest.length > 5) out += ` ${rest.slice(5, 7)}`;
    if (rest.length > 7) out += ` ${rest.slice(7, 9)}`;
    return out;
  }

  return `+${digits.slice(0, 15)}`;
};

/** Normalize + clamp a form field while typing. */
export const sanitizeFormValue = (name: string, value: string): string => {
  switch (name) {
    case 'phone':
      return formatPhoneInput(value);
    case 'email':
      return value.replace(/\s/g, '').slice(0, FIELD_MAX.email);
    case 'name':
    case 'repName':
      return value.slice(0, FIELD_MAX.name);
    case 'socialTag':
    case 'commTag':
      return value.replace(/\s/g, '').slice(0, FIELD_MAX.social);
    case 'orgName':
    case 'projectTitle':
    case 'university':
    case 'specialization':
      return value.slice(0, FIELD_MAX.shortText);
    case 'orgSocial':
      return value.trimStart().slice(0, FIELD_MAX.url);
    case 'motivation':
    case 'description':
    case 'message':
      return value.slice(0, FIELD_MAX.longText);
    default:
      return value.slice(0, FIELD_MAX.longText);
  }
};
