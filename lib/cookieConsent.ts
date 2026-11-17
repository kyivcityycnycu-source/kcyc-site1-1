export type CookieConsentValue = 'accepted' | 'rejected';

const STORAGE_KEY = 'kmmr_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'kmmr-cookie-consent';

export function getCookieConsent(): CookieConsentValue | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'accepted' || value === 'rejected') return value;
  } catch {
    // ignore
  }
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === 'accepted';
}

export function setCookieConsent(value: CookieConsentValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }

  // Lazy import avoided — call disable via dynamic to not create circular deps at module load
  void import('../services/analytics').then(({ disableGA, initGA }) => {
    if (value === 'rejected') {
      disableGA();
    } else if (value === 'accepted') {
      initGA();
    }
  });

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}
