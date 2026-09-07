"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";
import {
  readConsent,
  writeConsent,
  DEFAULT_CATEGORIES,
  type ConsentCategories,
} from "@/lib/cookie-consent";

const CATEGORY_COPY = [
  {
    key: "necessary" as const,
    title: "Strictly necessary",
    body: "Required for the site to work — remembering this cookie choice and keeping staff signed in. Always on.",
    locked: true,
  },
  {
    key: "analytics" as const,
    title: "Analytics",
    body: "First-party only. Tells us which pages and projects people actually look at, so we know what's worth improving.",
    locked: false,
  },
  {
    key: "preferences" as const,
    title: "Preferences",
    body: "Remembers choices like light or dark mode between visits.",
    locked: false,
  },
];

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);
  const [customizing, setCustomizing] = React.useState(false);
  const [categories, setCategories] = React.useState<ConsentCategories>(DEFAULT_CATEGORIES);

  React.useEffect(() => {
    // Only prompt if no valid decision is stored. Shown after ~5s so it
    // doesn't collide with the intro sequence or first paint.
    if (readConsent()) return;
    const t = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Allow the footer link to reopen preferences after a decision was made.
  React.useEffect(() => {
    const reopen = () => {
      const existing = readConsent();
      if (existing) setCategories(existing.categories);
      setCustomizing(true);
      setVisible(true);
    };
    window.addEventListener("ocl:open-cookie-settings", reopen);
    return () => window.removeEventListener("ocl:open-cookie-settings", reopen);
  }, []);

  function decide(next: ConsentCategories) {
    writeConsent(next);
    setVisible(false);
    setCustomizing(false);
  }

  const acceptAll = () => decide({ necessary: true, analytics: true, preferences: true });
  const rejectAll = () => decide({ necessary: true, analytics: false, preferences: false });
  const saveChoice = () => decide(categories);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {customizing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-sm"
              onClick={() => setCustomizing(false)}
            />
          )}

          <motion.div
            role="dialog"
            aria-modal={customizing}
            aria-label="Cookie preferences"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[96] flex justify-center px-4 pb-4 sm:px-6 sm:pb-6"
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-md border border-border bg-card shadow-2xl">
              <div className="flex items-start gap-4 p-5 sm:p-6">
                <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:flex">
                  <Cookie className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-base font-semibold tracking-tight">
                      Cookies on <Wordmark className="text-base" />
                    </h2>
                    {customizing && (
                      <button
                        onClick={() => setCustomizing(false)}
                        aria-label="Close preferences"
                        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    We use strictly necessary cookies to run this site, and
                    optional ones to understand what&rsquo;s useful. You choose.{" "}
                    <a href="/privacy" className="text-primary underline underline-offset-4">
                      Privacy Policy
                    </a>
                  </p>

                  <AnimatePresence initial={false}>
                    {customizing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 space-y-3 border-t border-border pt-5">
                          {CATEGORY_COPY.map((c) => {
                            const checked = c.locked ? true : categories[c.key];
                            return (
                              <label
                                key={c.key}
                                className={`flex items-start gap-3 rounded-sm p-3 transition-colors ${
                                  c.locked ? "opacity-70" : "cursor-pointer hover:bg-surface"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={c.locked}
                                  onChange={(e) =>
                                    setCategories((prev) => ({ ...prev, [c.key]: e.target.checked }))
                                  }
                                  className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                                />
                                <span>
                                  <span className="block text-sm font-medium">
                                    {c.title}
                                    {c.locked && (
                                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                                        Always on
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                                    {c.body}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                    {customizing ? (
                      <>
                        <Button size="sm" variant="primary" onClick={saveChoice} className="sm:min-w-[9rem]">
                          Save preferences
                        </Button>
                        <Button size="sm" variant="outline" onClick={acceptAll}>
                          Accept all
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="primary" onClick={acceptAll} className="sm:min-w-[7rem]">
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setCustomizing(true)}>
                          Customize
                        </Button>
                        <Button size="sm" variant="ghost" onClick={rejectAll}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
