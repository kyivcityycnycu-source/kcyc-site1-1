/**
 * Shared radius / control styles — one rule for the whole public UI.
 * Pills (CTAs) → rounded-full
 * Inputs / cards / surfaces → rounded-surface (12px)
 */
export const ui = {
  /** Primary / secondary CTA buttons (hero style) */
  btnPill: 'rounded-full',
  /** Text fields, selects, textareas */
  input: 'rounded-surface',
  /** Content cards, panels, modals shells */
  card: 'rounded-surface',
} as const;
