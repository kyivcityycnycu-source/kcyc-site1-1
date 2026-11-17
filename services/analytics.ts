import ReactGA from "react-ga4";
import { hasAnalyticsConsent } from "../lib/cookieConsent";

/** Single GA4 property for the public site (confirm with digital team if unsure). */
const MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ||
  (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) ||
  "G-0Q3R03CYK3";

let initialized = false;

const setGaDisableFlag = (disabled: boolean) => {
  if (!MEASUREMENT_ID || typeof window === "undefined") return;
  // Official GA opt-out switch — blocks hits even if a tag somehow loads
  (window as unknown as Record<string, boolean>)[`ga-disable-${MEASUREMENT_ID}`] = disabled;
};

export const initGA = () => {
  if (initialized || !hasAnalyticsConsent()) return;
  if (!MEASUREMENT_ID) {
    console.warn("[Analytics] VITE_GA_MEASUREMENT_ID is not set");
    return;
  }
  setGaDisableFlag(false);
  ReactGA.initialize(MEASUREMENT_ID);
  initialized = true;
};

/** Call when user chooses «Necessary only» / revokes consent. */
export const disableGA = () => {
  initialized = false;
  setGaDisableFlag(true);
};

const ensureReady = (): boolean => {
  if (!hasAnalyticsConsent()) return false;
  if (!initialized) initGA();
  return initialized;
};

export const trackPageView = (path: string) => {
  if (!ensureReady()) return;
  ReactGA.send({ hitType: "pageview", page: path });
};

/**
 * Low-level GA4 event.
 * Only pass allowlisted enum-like params — never emails, phones, free-text errors.
 */
export const trackEvent = (
  name: string,
  params?: Record<string, string | number | boolean>
) => {
  if (!ensureReady()) return;
  ReactGA.event(name, params);
};

// —— Named events ——

export type CtaKind = "join" | "support" | "donate" | "view_all_projects";
export type CtaPlace =
  | "hero"
  | "navbar"
  | "navbar_mobile"
  | "footer"
  | "join_us"
  | "contacts"
  | "projects_home"
  | "projects_page";

export const trackCtaClick = (cta: CtaKind, place: CtaPlace) => {
  trackEvent("cta_click", { cta, place });
};

export type FormKind =
  | "join_team"
  | "support_initiative"
  | "opportunity"
  | "internship"
  | "newsletter";

const ALLOWED_OPP_TYPES = new Set(["Volunteering", "Education", "Job", "Event"]);

/** Firestore-style ids only — never titles or user text. */
const isSafeDocId = (id: string) => /^[A-Za-z0-9_-]{8,128}$/.test(id);

export const trackFormSubmit = (
  form: FormKind,
  result: "success" | "error" | "validation_error",
  extra?: { opportunity_type?: string }
) => {
  const params: Record<string, string> = { form, result };

  if (
    extra?.opportunity_type &&
    ALLOWED_OPP_TYPES.has(extra.opportunity_type)
  ) {
    params.opportunity_type = extra.opportunity_type;
  }

  // Diagnostic event (includes errors) — do NOT mark as key event as-is
  trackEvent("form_submit", params);

  // Clean conversion event for key events / funnel (success only)
  if (result === "success") {
    const successParams: Record<string, string> = { form };
    if (params.opportunity_type) {
      successParams.opportunity_type = params.opportunity_type;
    }
    trackEvent("form_submit_success", successParams);
  }
};

export const trackProjectOpen = (place: "card" | "modal", projectId?: string) => {
  const params: Record<string, string> = { place };
  if (projectId && isSafeDocId(projectId)) {
    params.project_id = projectId;
  }
  trackEvent("project_open", params);
};

export const trackOpportunityApply = (source: "list" | "modal") => {
  trackEvent("opportunity_apply_click", { source });
};
