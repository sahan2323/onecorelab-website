"use client";
// Adapted from 21st.dev — serafimcloud/agent-chat.
// Kept: the message-list + auto-growing composer structure, user/assistant
// bubble split, error bubble and Enter-to-send behaviour.
// Changed for oneCoreLab: uses the project's own `cn` and design tokens
// instead of hardcoded neutral-* classes, drops the attachment/file-chip
// features (nothing uploads files here), adds a typing indicator and
// auto-scroll, and exposes starter prompts for the empty state.

import * as React from "react";
import { cn } from "@/lib/utils";

export type ChatStatus = "ready" | "streaming";

export type AgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
        {text}
      </div>
    </div>
  );
}

function AssistantBubble({ text, isError }: { text: string; isError?: boolean }) {
  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md px-3.5 py-2 text-sm leading-relaxed",
          isError
            ? "border border-destructive/30 bg-destructive/10 text-destructive"
            : "bg-muted text-foreground"
        )}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AgentChat({
  messages,
  onSend,
  status = "ready",
  starters = [],
  emptyTitle = "Ask us anything",
  emptyBody = "Services, rough pricing, timelines — or just tell us what you're trying to build.",
  className,
}: {
  messages: AgentMessage[];
  onSend: (text: string) => void;
  status?: ChatStatus;
  starters?: string[];
  emptyTitle?: string;
  emptyBody?: string;
  className?: string;
}) {
  const [draft, setDraft] = React.useState("");
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);
  const isBusy = status === "streaming";
  const isEmpty = messages.length === 0;

  // Auto-grow the textarea up to a cap.
  React.useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0";
    const next = Math.min(el.scrollHeight, 110);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > 110 ? "auto" : "hidden";
  }, [draft]);

  // Keep the newest message in view.
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, isBusy]);

  const submit = React.useCallback(
    (text?: string) => {
      const value = (text ?? draft).trim();
      if (!value || isBusy) return;
      onSend(value);
      setDraft("");
    },
    [draft, isBusy, onSend]
  );

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" data-lenis-prevent>
        {isEmpty ? (
          <div className="flex h-full flex-col justify-center">
            <p className="font-display text-base font-semibold tracking-tight">{emptyTitle}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{emptyBody}</p>
            {starters.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} text={m.content} />
              ) : (
                <AssistantBubble key={m.id} text={m.content} isError={m.isError} />
              )
            )}
            {isBusy && <TypingIndicator />}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <div
          className="flex items-end gap-2 rounded-xl border border-input bg-surface px-3 py-2 focus-within:border-primary"
          onClick={() => taRef.current?.focus()}
        >
          <textarea
            ref={taRef}
            value={draft}
            rows={1}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type your message…"
            aria-label="Message"
            data-lenis-prevent
            className="max-h-[110px] w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => submit()}
            disabled={!draft.trim() || isBusy}
            aria-label="Send message"
            className={cn(
              "mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
              draft.trim() && !isBusy
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground"
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Automated assistant — for anything specific we&rsquo;ll reply personally.
        </p>
      </div>
    </div>
  );
}

export default AgentChat;