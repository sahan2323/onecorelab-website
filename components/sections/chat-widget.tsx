"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { AgentChat, type AgentMessage } from "@/components/ui/agent-chat";
import { STARTER_PROMPTS } from "@/lib/assistant-knowledge";

/**
 * Floating assistant bubble.
 *
 * Positioning note: ContactActionBar is already pinned to the bottom-centre
 * of the viewport, so this sits bottom-RIGHT and, on small screens, lifts
 * above that bar's height rather than landing on top of it.
 *
 * No backdrop-blur anywhere — it's a fixed, always-visible element, and a
 * blur there forces the compositor to re-sample the page behind it on every
 * scroll frame, which is what caused the mobile scroll stutter previously.
 */
export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<AgentMessage[]>([]);
  const [busy, setBusy] = React.useState(false);

  // Close on Escape.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = React.useCallback(
    async (text: string) => {
      const userMsg: AgentMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
      };
      const history = [...messages, userMsg];
      setMessages(history);
      setBusy(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
        });

        const data = (await res.json()) as { reply?: string; error?: string };

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              data.reply ??
              "Sorry — something went wrong on our side. Message us on WhatsApp (+1 437 707 8022) and we'll reply personally.",
            isError: !data.reply,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              "I couldn't reach the server just then. Message us on WhatsApp (+1 437 707 8022) or email onecorelabs7@gmail.com.",
            isError: true,
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [messages]
  );

  return (
    <>
      {/* Bubble — bottom-right, lifted above the contact bar on mobile */}
      <div className="fixed bottom-[5.5rem] right-4 z-40 sm:bottom-6 sm:right-6">
        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Close Onyxa" : "Chat with Onyxa"}
          aria-expanded={open}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 320, damping: 22 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-black/20 transition-transform hover:scale-105"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Quiet attention pulse, only before first open */}
          {!open && messages.length === 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
            </span>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Dimmer on mobile only — the panel is a sheet there */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            />

            <motion.div
              role="dialog"
              aria-label="oneCoreLab assistant"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3 bottom-[9.5rem] z-40 flex h-[65vh] max-h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[540px] sm:w-[380px]"
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold tracking-tight">
                                        Ony<span className="text-primary">xa</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Usually replies instantly
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <AgentChat
                messages={messages}
                onSend={send}
                status={busy ? "streaming" : "ready"}
                starters={STARTER_PROMPTS}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;