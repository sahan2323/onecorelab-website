"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { WHATSAPP_LINK, WHATSAPP_NUMBER_DISPLAY } from "@/lib/constants";

/** Minimal, recognizable WhatsApp glyph — lucide-react has no brand icon for it. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.02 3C9.4 3 4 8.37 4 14.98c0 2.11.55 4.09 1.52 5.8L3 29l8.44-2.47a12.9 12.9 0 0 0 4.58.83h.01c6.62 0 12.02-5.37 12.02-11.98C28.05 8.37 22.65 3 16.02 3Zm0 21.9h-.01a10 10 0 0 1-5.1-1.4l-.36-.21-5.01 1.47 1.5-4.87-.24-.38a9.86 9.86 0 0 1-1.52-5.43c0-5.46 4.46-9.9 9.95-9.9 2.66 0 5.15 1.03 7.03 2.9a9.83 9.83 0 0 1 2.91 7c0 5.46-4.46 9.9-9.95 9.9Zm5.45-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

/**
 * Persistent floating WhatsApp button, shown site-wide (mounted once in the
 * root layout). Expands to a small confirmation card on click rather than
 * navigating away silently, so it's obvious to the visitor what's about to
 * happen before WhatsApp opens in a new tab.
 */
export function WhatsAppFloatingButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-64 rounded-2xl border border-border bg-card p-4 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">Chat with oneCoreLab</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Message us on WhatsApp — {WHATSAPP_NUMBER_DISPLAY}
            </p>
            <a
              href={WHATSAPP_LINK("Hi! I'd like to ask about a project.")}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon className="h-4 w-4" /> Open WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat on WhatsApp"
        whileTap={{ scale: 0.92 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition-transform hover:scale-105"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <WhatsAppIcon className="h-7 w-7" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

/** Inline WhatsApp CTA for use inside the Footer, Contact page, etc. */
export function WhatsAppInlineLink({
  className,
  label = "Chat on WhatsApp",
  message,
}: {
  className?: string;
  label?: string;
  message?: string;
}) {
  return (
    <a
      href={WHATSAPP_LINK(message)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:opacity-80",
        className
      )}
    >
      <WhatsAppIcon className="h-4 w-4" /> {label}
    </a>
  );
}

export { WhatsAppIcon };
