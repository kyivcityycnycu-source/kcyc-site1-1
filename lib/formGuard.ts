/** Client-side anti-spam helpers (honeypot + rate limit + min fill time). */

export type FormSpamCode = 'honeypot' | 'rate_limit' | 'too_fast';

export class FormSpamError extends Error {
  code: FormSpamCode;

  constructor(code: FormSpamCode) {
    super(code);
    this.name = 'FormSpamError';
    this.code = code;
  }
}

const STORAGE_PREFIX = 'kmmr_form_rl_';

type RateState = { timestamps: number[] };

const defaultLimits = {
  maxPerWindow: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  minMs: 2500, // too fast = bot
};

function readRate(formKey: string): RateState {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + formKey);
    if (!raw) return { timestamps: [] };
    const parsed = JSON.parse(raw) as RateState;
    return Array.isArray(parsed.timestamps) ? parsed : { timestamps: [] };
  } catch {
    return { timestamps: [] };
  }
}

function writeRate(formKey: string, state: RateState) {
  try {
    localStorage.setItem(STORAGE_PREFIX + formKey, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Throws FormSpamError if the submission looks automated or too frequent.
 * Call before writing to Firestore. Silent honeypot failures should look like success to bots.
 */
export function assertFormAllowed(options: {
  formKey: string;
  honeypot?: string;
  openedAt: number;
  maxPerWindow?: number;
  windowMs?: number;
  minMs?: number;
}): void {
  const {
    formKey,
    honeypot = '',
    openedAt,
    maxPerWindow = defaultLimits.maxPerWindow,
    windowMs = defaultLimits.windowMs,
    minMs = defaultLimits.minMs,
  } = options;

  if (honeypot.trim().length > 0) {
    throw new FormSpamError('honeypot');
  }

  const elapsed = Date.now() - openedAt;
  if (!openedAt || elapsed < minMs) {
    throw new FormSpamError('too_fast');
  }

  const now = Date.now();
  const state = readRate(formKey);
  const recent = state.timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxPerWindow) {
    throw new FormSpamError('rate_limit');
  }

  recent.push(now);
  writeRate(formKey, { timestamps: recent });
}

export function isFormSpamError(error: unknown): error is FormSpamError {
  return error instanceof FormSpamError;
}
