"use client";
import { openCookieSettings } from "@/lib/cookie-consent";

/** Lets visitors revisit their cookie choice after dismissing the banner. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  );
}
