"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, CalendarCheck, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-button";
import { QuickInquiryForm } from "@/components/inquiry/quick-inquiry-form";
import { WHATSAPP_LINK, CONTACT_EMAIL, WHATSAPP_NUMBER_DISPLAY } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * A small, always-reachable contact bar pinned to the bottom-centre of the
 * viewport — three plain, labelled actions rather than a corner bubble, so
 * it reads as navigation instead of a chat widget. On mobile it sits above
 * the safe area and the labels collapse to icons + short text.
 */
export function ContactActionBar() {
  const [open, setOpen] = React.useState(false);

  // Close on Escape, and lock body scroll while the dialog is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "pointer-events-auto flex items-center gap-1 rounded-full border border-border p-1.5 shadow-lg shadow-black/[0.06]",
            // Solid background on touch. `backdrop-blur` on a fixed,
            // always-visible element forces the compositor to re-sample the
            // whole page behind it every scroll frame — that was a major
            // cause of the blank/unpainted bands while scrolling on mobile.
            "bg-background",
            "supports-[backdrop-filter]:md:bg-background/90 supports-[backdrop-filter]:md:backdrop-blur-xl"
          )}
        >
          <ActionLink
            href={WHATSAPP_LINK("Hi! I'd like to ask about a project.")}
            label="WhatsApp"
            title={`WhatsApp ${WHATSAPP_NUMBER_DISPLAY}`}
            icon={<WhatsAppIcon className="h-4 w-4 text-[#25D366]" />}
          />
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <ActionLink
            href={`mailto:${CONTACT_EMAIL}`}
            label="Email"
            title={`Email ${CONTACT_EMAIL}`}
            icon={<Mail className="h-4 w-4" />}
          />
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Free Consultation</span>
            <span className="sm:hidden">Free Quote</span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/50 md:bg-black/40 md:backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Request a free consultation"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-md border border-border bg-card p-6 shadow-2xl sm:rounded-md sm:p-8"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="eyebrow mb-2">Free Consultation</p>
              <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                Tell us what you need.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Four quick questions — no meeting required to get started.
              </p>

              <div className="mt-6">
                <QuickInquiryForm compact submitLabel="Send Request" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActionLink({
  href,
  label,
  title,
  icon,
}: {
  href: string;
  label: string;
  title: string;
  icon: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      title={title}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-2.5 text-[13px] font-medium text-foreground/80 transition-colors hover:bg-foreground/[0.05] hover:text-foreground sm:px-4"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
