/**
 * Cookie consent storage + a tiny pub/sub so any component can react to the
 * current choice. Stored in localStorage under a versioned key: bumping
 * CONSENT_VERSION re-prompts everyone, which is what you want if the cookie
 * categories ever change materially.
 */
export const CONSENT_KEY = "ocl_cookie_consent_v1";
export const CONSENT_VERSION = 1;

export type ConsentCategories = {
  necessary: true; // always on — cannot be disabled
  analytics: boolean;
  preferences: boolean;
};

export type ConsentRecord = {
  version: number;
  decidedAt: string;
  categories: ConsentCategories;
};

export const DEFAULT_CATEGORIES: ConsentCategories = {
  necessary: true,
  analytics: false,
  preferences: false,
};

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(categories: ConsentCategories) {
  if (typeof window === "undefined") return;
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    categories: { ...categories, necessary: true },
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    // Storage can be unavailable (private mode, blocked). Failing to persist
    // shouldn't break the page — the banner simply shows again next visit.
  }
  window.dispatchEvent(new CustomEvent("ocl:consent", { detail: record }));
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.categories.analytics ?? false;
}

/** Lets the footer "Cookie settings" link reopen the preferences panel. */
export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent("ocl:open-cookie-settings"));
}
