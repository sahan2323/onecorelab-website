"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { OnycoreBot, type OnycoreMood } from "@/components/ui/onycore-bot";
import { AgentChat, type AgentMessage } from "@/components/ui/agent-chat";
import { STARTER_PROMPTS } from "@/lib/assistant-knowledge";
import { readConsent } from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";

/**
 * Onycore — a draggable, AssistiveTouch-style assistant that lives on every
 * page. Drag him anywhere; let go and he snaps to the nearest side and
 * remembers the spot. Tap him to open the chat.
 *
 * Performance notes (same rules as the rest of the site):
 * - Dragging writes `transform` straight to the DOM through refs. React only
 *   re-renders on drag start/end, never per pointer move.
 * - No backdrop-blur and no big blur filters on this fixed element.
 * - `touch-action: none` only on the robot itself, so swiping anywhere else
 *   still scrolls the page normally.
 */

const POS_KEY = "ocl_onycore_pos";
const SEEN_KEY = "ocl_onycore_seen";
const GREETED_KEY = "ocl_onycore_greeted";
const NUDGED_KEY = "ocl_onycore_nudged";
const INTRO_KEY = "ocl_intro_seen";

const MOBILE_QUERY = "(max-width: 639px)";
const NAV_CLEARANCE = 88; // keep clear of the fixed navbar
const PANEL_W = 380;
const PANEL_MAX_H = 540;
const TYPE_MS = 32;

type Side = "left" | "right";
type Bubble = { key: number; text: string; prompt?: string };
type PanelPos = { top: number; offset: number; height: number };

/** Page-aware nudges: one per page, at most three per visit. */
const NUDGES: { match: (path: string) => boolean; delay: number; text: string; prompt: string }[] = [
  {
    match: (p) => p.startsWith("/projects"),
    delay: 18000,
    text: "Want the story behind one of these builds? Just ask me.",
    prompt: "Tell me about one of your projects",
  },
  {
    match: (p) => p.startsWith("/services"),
    delay: 18000,
    text: "Not sure which service fits? I can help you choose.",
    prompt: "Which service is right for my business?",
  },
  {
    match: (p) => p.startsWith("/contact"),
    delay: 15000,
    text: "I can send your enquiry to the team for you. Want to try?",
    prompt: "Can you send an enquiry for me?",
  },
  {
    match: (p) => p.startsWith("/about"),
    delay: 20000,
    text: "Curious how we work? I'll explain it in 30 seconds.",
    prompt: "How do you work with clients?",
  },
  {
    match: (p) => p === "/",
    delay: 45000,
    text: "Wondering what a site like this costs? I can give you a rough idea.",
    prompt: "How much does a website cost?",
  },
];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Remembering where Onycore sits (and that you've met him) is a preference,
 * so it only survives between visits if the visitor allowed preference
 * storage in the cookie banner. Otherwise it lasts for this tab only.
 */
function prefStore(): Storage | null {
  try {
    return readConsent()?.categories.preferences ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readItem(storage: Storage | null | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeItem(storage: Storage | null | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Storage blocked (private mode etc.) — he just forgets, nothing breaks.
  }
}

/** Colours "core" in Onycore and "CoreLab" in oneCoreLab with the brand blue. */
function BrandText({ chars }: { chars: string[] }) {
  const mask = new Array<boolean>(chars.length).fill(false);
  for (let i = 0; i < chars.length; i++) {
    if (chars.slice(i, i + 7).join("") === "Onycore") for (let j = i + 3; j < i + 7; j++) mask[j] = true;
    if (chars.slice(i, i + 10).join("") === "oneCoreLab") for (let j = i + 3; j < i + 10; j++) mask[j] = true;
  }
  const parts: { blue: boolean; text: string }[] = [];
  chars.forEach((c, i) => {
    const last = parts[parts.length - 1];
    if (last && last.blue === mask[i]) last.text += c;
    else parts.push({ blue: mask[i], text: c });
  });
  return (
    <>
      {parts.map((p, i) =>
        p.blue ? (
          <span key={i} className="text-primary">
            {p.text}
          </span>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        )
      )}
    </>
  );
}

function GreetingBubble({
  bubble,
  side,
  onOpen,
  onClose,
}: {
  bubble: Bubble;
  side: Side;
  onOpen: () => void;
  onClose: () => void;
}) {
  // Full text is computed up front, so "Onycore" / "oneCoreLab" are coloured
  // correctly even while they're half typed.
  const chars = React.useMemo(() => Array.from(bubble.text), [bubble.text]);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(chars.length);
      return;
    }
    let i = 0;
    setCount(0);
    const t = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= chars.length) window.clearInterval(t);
    }, TYPE_MS);
    return () => window.clearInterval(t);
  }, [chars]);

  const typing = count < chars.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "absolute bottom-[58%] w-[min(244px,calc(100vw-6.5rem))]",
        side === "right" ? "right-full mr-1 origin-bottom-right" : "left-full ml-1 origin-bottom-left"
      )}
    >
      <div className="relative rounded-2xl border border-border bg-card text-card-foreground shadow-xl shadow-black/10">
        <button
          type="button"
          onClick={onOpen}
          className="block w-full rounded-2xl p-3 pr-8 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-tight">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>
              Ony<span className="text-primary">core</span>
            </span>
          </span>
          <span className="block text-sm leading-snug text-foreground/85" aria-hidden="true">
            <BrandText chars={chars.slice(0, count)} />
            {typing && (
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-primary" />
            )}
          </span>
          <span className="sr-only">{bubble.text}</span>
          {!typing && bubble.prompt && (
            <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Ask Onycore →
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss message"
          className="absolute right-1.5 top-1.5 rounded-full p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {/* Tail pointing at Onycore */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-[7px] h-3.5 w-3.5 rotate-45 border-b border-r border-border bg-card",
            side === "right" ? "right-4" : "left-4"
          )}
        />
      </div>
    </motion.div>
  );
}

export function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<AgentMessage[]>([]);
  const [busy, setBusy] = React.useState(false);

  const [ready, setReady] = React.useState(false);
  const [side, setSide] = React.useState<Side>("right");
  const [dragging, setDragging] = React.useState(false);
  const [waving, setWaving] = React.useState(false);
  const [happy, setHappy] = React.useState(false);
  const [sleepy, setSleepy] = React.useState(false);
  const [bubble, setBubble] = React.useState<Bubble | null>(null);
  const [starter, setStarter] = React.useState<string | null>(null);
  const [panel, setPanel] = React.useState<PanelPos | null>(null);

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const tiltRef = React.useRef<HTMLDivElement>(null);
  const pos = React.useRef({ x: 0, y: 0 });
  const sideRef = React.useRef<Side>("right");
  const drag = React.useRef<{
    id: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    lastX: number;
    lastT: number;
    vx: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = React.useRef(false);
  const openRef = React.useRef(false);
  const openedOnce = React.useRef(false);
  const sleepyRef = React.useRef(false);
  const dismissals = React.useRef(0);
  const lastWave = React.useRef(0);
  const timers = React.useRef<{ wave?: number; happy?: number; bubble?: number }>({});

  openRef.current = open;

  /* ---------------------------------------------------------------- *
   * Geometry
   * ---------------------------------------------------------------- */

  const metrics = React.useCallback(() => {
    const el = wrapRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const w = el?.offsetWidth ?? 64;
    const h = el?.offsetHeight ?? 68;
    const edge = mobile ? 8 : 16;
    // On phones the contact bar sits along the bottom — stay above it.
    const bottom = mobile ? 92 : 16;
    const minY = NAV_CLEARANCE;
    const maxY = Math.max(minY, vh - h - bottom);
    return { vw, vh, w, h, edge, minY, maxY, mobile };
  }, []);

  const place = React.useCallback((x: number, y: number, animate: boolean) => {
    const el = wrapRef.current;
    if (!el) return;
    pos.current = { x, y };
    el.style.transition = animate ? "transform 560ms cubic-bezier(.2,1.3,.35,1)" : "none";
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  const snap = React.useCallback(
    (s: Side, y: number, animate: boolean) => {
      const m = metrics();
      const cy = clamp(y, m.minY, m.maxY);
      const x = s === "left" ? m.edge : m.vw - m.w - m.edge;
      sideRef.current = s;
      setSide(s);
      place(x, cy, animate);
      return { y: cy, vh: m.vh };
    },
    [metrics, place]
  );

  const updatePanel = React.useCallback(() => {
    const m = metrics();
    if (m.mobile) {
      setPanel(null);
      return;
    }
    const height = Math.min(PANEL_MAX_H, m.vh - NAV_CLEARANCE - 16);
    // Bottom of the panel lines up with Onycore's feet.
    const top = clamp(pos.current.y + m.h - height, NAV_CLEARANCE, Math.max(NAV_CLEARANCE, m.vh - height - 16));
    // Sit beside him, unless the window is too narrow — then just inset.
    const beside = m.w + m.edge + 10;
    const offset = m.vw - beside - PANEL_W >= 16 ? beside : 16;
    setPanel({ top, offset, height });
  }, [metrics]);

  // Initial position (restored if remembered) + keep in bounds on resize.
  React.useEffect(() => {
    let saved: { side?: string; y?: number } | null = null;
    try {
      const raw = readItem(window.localStorage, POS_KEY) ?? readItem(window.sessionStorage, POS_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {
      saved = null;
    }
    const m = metrics();
    const s: Side = saved?.side === "left" ? "left" : "right";
    const y = typeof saved?.y === "number" ? saved.y * m.vh : m.maxY;
    snap(s, y, false);
    setReady(true);

    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (drag.current?.moved) return;
        // Clamp only, so a mobile URL bar collapsing doesn't nudge him around.
        snap(sideRef.current, pos.current.y, false);
        if (openRef.current) updatePanel();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [metrics, snap, updatePanel]);

  /* ---------------------------------------------------------------- *
   * Personality
   * ---------------------------------------------------------------- */

  const wave = React.useCallback(() => {
    lastWave.current = Date.now();
    setWaving(false);
    // Next frame, so the CSS animation restarts even if he was mid-wave.
    requestAnimationFrame(() => setWaving(true));
    window.clearTimeout(timers.current.wave);
    timers.current.wave = window.setTimeout(() => setWaving(false), 1900);
  }, []);

  const smile = React.useCallback((ms = 1200) => {
    setHappy(true);
    window.clearTimeout(timers.current.happy);
    timers.current.happy = window.setTimeout(() => setHappy(false), ms);
  }, []);

  const showBubble = React.useCallback((text: string, prompt?: string) => {
    setBubble({ key: Date.now(), text, prompt });
    window.clearTimeout(timers.current.bubble);
    timers.current.bubble = window.setTimeout(
      () => setBubble(null),
      Array.from(text).length * TYPE_MS + 8000
    );
  }, []);

  const dismissBubble = React.useCallback(() => {
    dismissals.current += 1;
    setBubble(null);
  }, []);

  // Clear any pending timers on unmount.
  React.useEffect(() => {
    const t = timers.current;
    return () => {
      window.clearTimeout(t.wave);
      window.clearTimeout(t.happy);
      window.clearTimeout(t.bubble);
    };
  }, []);

  // First hello — after the intro has finished and the cookie banner has
  // been answered (or ignored for 20s), so he never talks over either.
  React.useEffect(() => {
    if (!ready) return;
    if (readItem(window.sessionStorage, GREETED_KEY) === "1") return;

    const started = Date.now();
    let t = 0;

    const greet = () => {
      if (openRef.current) return;
      const store = prefStore();
      const returning = readItem(store, SEEN_KEY) === "1";
      writeItem(store, SEEN_KEY, "1");
      writeItem(window.sessionStorage, GREETED_KEY, "1");
      wave();
      smile(1800);
      showBubble(
        returning
          ? "Welcome back! 👋 Need a hand with anything today?"
          : "Hello! 👋 I'm Onycore, oneCoreLab's AI assistant. Ask me anything about your project."
      );
    };

    const check = () => {
      // Fallback after 8s in case session storage is blocked.
      const introDone = readItem(window.sessionStorage, INTRO_KEY) !== null || Date.now() - started > 8000;
      const consentDone = readConsent() !== null || Date.now() - started > 20000;
      if (introDone && consentDone) {
        t = window.setTimeout(greet, 1200);
        return;
      }
      t = window.setTimeout(check, 700);
    };
    t = window.setTimeout(check, 600);
    return () => window.clearTimeout(t);
  }, [ready, wave, smile, showBubble]);

  // Page-aware nudges — only for visitors who haven't opened the chat yet.
  React.useEffect(() => {
    if (!ready) return;
    const nudge = NUDGES.find((n) => n.match(pathname));
    if (!nudge) return;
    const t = window.setTimeout(() => {
      if (openRef.current || openedOnce.current || dismissals.current >= 2) return;
      if (readItem(window.sessionStorage, GREETED_KEY) !== "1") return;
      let done: string[] = [];
      try {
        done = JSON.parse(readItem(window.sessionStorage, NUDGED_KEY) || "[]");
      } catch {
        done = [];
      }
      if (done.includes(pathname) || done.length >= 3) return;
      writeItem(window.sessionStorage, NUDGED_KEY, JSON.stringify([...done, pathname]));
      wave();
      showBubble(nudge.text, nudge.prompt);
    }, nudge.delay);
    return () => window.clearTimeout(t);
  }, [pathname, ready, wave, showBubble]);

  // Dozes off after 45s of no activity; wakes up with a wave.
  React.useEffect(() => {
    let last = Date.now();
    const wake = () => {
      last = Date.now();
      if (sleepyRef.current) {
        sleepyRef.current = false;
        setSleepy(false);
        wave();
      }
    };
    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("pointermove", wake, opts);
    window.addEventListener("pointerdown", wake, opts);
    window.addEventListener("scroll", wake, opts);
    window.addEventListener("keydown", wake);
    const iv = window.setInterval(() => {
      if (!sleepyRef.current && !openRef.current && Date.now() - last > 45000) {
        sleepyRef.current = true;
        setSleepy(true);
      }
    }, 5000);
    return () => {
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("keydown", wake);
      window.clearInterval(iv);
    };
  }, [wave]);

  /* ---------------------------------------------------------------- *
   * Chat
   * ---------------------------------------------------------------- */

  // Warm the pages Onycore can open, so navigating feels instant.
  React.useEffect(() => {
    if (!open) return;
    for (const path of ["/projects", "/services", "/about", "/contact"]) router.prefetch(path);
  }, [open, router]);

  // Close on Escape.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const openChat = React.useCallback(
    (prompt?: string) => {
      setStarter(prompt ?? null);
      setBubble(null);
      updatePanel();
      setOpen(true);
      openedOnce.current = true;
      sleepyRef.current = false;
      setSleepy(false);
      wave();
      smile(1400);
    },
    [updatePanel, wave, smile]
  );

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

        const data = (await res.json()) as {
          reply?: string;
          error?: string;
          actions?: { label: string; navigate?: string }[];
        };

        // The agent asked to show a page. Only same-site paths, never a URL.
        const target = data.actions?.find((a) => a.navigate?.startsWith("/"))?.navigate;
        if (target && !target.startsWith("//")) {
          router.push(target);
          // If the soft navigation stalls (slow first load), fall back to a
          // normal page load so the visitor at least sees it happening.
          window.setTimeout(() => {
            if (window.location.pathname !== target) window.location.assign(target);
          }, 4000);
          // On phones the panel covers the page, so get out of the way.
          if (window.matchMedia(MOBILE_QUERY).matches) setOpen(false);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              data.reply ??
              "Sorry — something went wrong on our side. Message us on WhatsApp (+1 437 707 8022) and we'll reply personally.",
            isError: !data.reply,
            actions: data.actions?.map((a) => a.label),
          },
        ]);
        if (data.reply) smile(1400);
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
    [messages, router, smile]
  );

  /* ---------------------------------------------------------------- *
   * Drag (AssistiveTouch-style)
   * ---------------------------------------------------------------- */

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    suppressClick.current = false;
    // Capture straight away so a fast flick can't slip off him before the
    // drag starts. Clicks still fire normally on a captured button.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer already gone — nothing to capture.
    }
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.current.x,
      originY: pos.current.y,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.moved) {
      // Small wobble is still a tap.
      if (Math.hypot(dx, dy) < 6) return;
      d.moved = true;
      setDragging(true);
      setBubble(null);
    }

    const m = metrics();
    place(clamp(d.originX + dx, 0, m.vw - m.w), clamp(d.originY + dy, 8, m.vh - m.h - 8), false);

    // Lean into the direction of travel.
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.vx = d.vx * 0.6 + ((e.clientX - d.lastX) / dt) * 0.4;
    d.lastX = e.clientX;
    d.lastT = now;
    if (tiltRef.current) tiltRef.current.style.transform = `rotate(${clamp(d.vx * 14, -18, 18)}deg)`;
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;

    suppressClick.current = true;
    setDragging(false);
    if (tiltRef.current) tiltRef.current.style.transform = "";

    // A flick carries him to the side he was thrown towards.
    const m = metrics();
    const projected = pos.current.x + m.w / 2 + d.vx * 160;
    const s: Side = projected < m.vw / 2 ? "left" : "right";
    const r = snap(s, pos.current.y, true);
    writeItem(prefStore(), POS_KEY, JSON.stringify({ side: s, y: r.y / r.vh }));
    smile(900);
    if (openRef.current) updatePanel();
  };

  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (open) setOpen(false);
    else openChat();
  };

  const onMouseEnter = () => {
    smile(1000);
    if (Date.now() - lastWave.current > 5000) wave();
  };

  const mood: OnycoreMood = busy ? "thinking" : happy ? "happy" : sleepy ? "sleepy" : "idle";
  const starters = starter
    ? [starter, ...STARTER_PROMPTS.filter((p) => p !== starter)].slice(0, 4)
    : STARTER_PROMPTS;

  const panelStyle = panel
    ? ({
        "--oc-top": `${panel.top}px`,
        "--oc-off": `${panel.offset}px`,
        "--oc-h": `${panel.height}px`,
      } as React.CSSProperties)
    : undefined;

  return (
    <>
      {/* Onycore himself */}
      <div
        ref={wrapRef}
        className="fixed left-0 top-0 z-[45] will-change-transform"
        style={{ visibility: ready ? "visible" : "hidden" }}
      >
        <div
          className={cn(
            "relative transition-opacity duration-200",
            // On phones the chat is a sheet; he steps aside while it's open.
            open && "max-sm:pointer-events-none max-sm:opacity-0"
          )}
        >
          <AnimatePresence>
            {bubble && !open && !dragging && (
              <GreetingBubble
                key={bubble.key}
                bubble={bubble}
                side={side}
                onOpen={() => openChat(bubble.prompt)}
                onClose={dismissBubble}
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 24 }}
            animate={ready ? { opacity: 1, scale: 1, y: 0 } : undefined}
            transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 17 }}
          >
            <div ref={tiltRef} className="origin-bottom transition-transform duration-300 ease-out">
              <button
                type="button"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                aria-label={open ? "Close Onycore" : "Chat with Onycore, oneCoreLab's AI assistant"}
                aria-expanded={open}
                aria-haspopup="dialog"
                title={open ? "Close chat" : "Onycore · drag me anywhere"}
                className={cn(
                  "relative block h-[68px] w-[64px] touch-none select-none rounded-[40%] outline-none sm:h-[88px] sm:w-[84px]",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  dragging ? "cursor-grabbing" : "cursor-pointer"
                )}
              >
                <OnycoreBot
                  className="pointer-events-none h-full w-full"
                  mood={mood}
                  waving={waving}
                  dragging={dragging}
                  track
                />
                {/* Desktop: a small close badge while the chat is open */}
                {open && (
                  <span className="absolute -top-1 right-0 hidden h-6 w-6 items-center justify-center rounded-full bg-foreground text-background shadow-md sm:flex">
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
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
              className="fixed inset-0 z-[44] bg-black/40 sm:hidden"
            />

            <motion.div
              role="dialog"
              aria-label="Onycore, oneCoreLab's AI assistant"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{
                ...panelStyle,
                transformOrigin: side === "right" ? "100% 100%" : "0% 100%",
              }}
              className={[
                "fixed inset-x-3 bottom-3 z-[46] flex h-[72vh] max-h-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl",
                panel
                  ? "sm:inset-x-auto sm:bottom-auto sm:top-[var(--oc-top)] sm:h-[var(--oc-h)] sm:max-h-none sm:w-[380px]"
                  : "sm:inset-x-auto sm:bottom-24 sm:h-[540px] sm:w-[380px]",
                panel
                  ? side === "right"
                    ? "sm:left-auto sm:right-[var(--oc-off)]"
                    : "sm:right-auto sm:left-[var(--oc-off)]"
                  : "sm:right-6",
              ].join(" ")}
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#05070b] ring-1 ring-primary/30">
                  <OnycoreBot variant="head" mood={mood} className="h-9 w-9" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold tracking-tight">
                    Ony<span className="text-primary">core</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {busy ? "Thinking…" : "Your AI teammate · replies instantly"}
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
                starters={starters}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;