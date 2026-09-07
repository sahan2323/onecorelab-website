"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HandwritingText } from "@/components/ui/handwriting-text";
import { Wordmark } from "@/components/ui/wordmark";

type Phase = "hello" | "wordmark" | "tagline" | "done";

const SESSION_KEY = "ocl_intro_seen";

/**
 * The opening sequence is intentionally light/glassy regardless of the
 * visitor's dark/light site preference — a deliberate, premium first
 * impression using the site's editorial display face (Bodoni Moda) in
 * italic, its most dramatic register.
 */
export function Intro() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>("hello");
  const [skip, setSkip] = React.useState(false);

  React.useEffect(() => {
    if (reduced || sessionStorage.getItem(SESSION_KEY)) {
      setSkip(true);
      setPhase("done");
    }
  }, [reduced]);

  React.useEffect(() => {
    if (phase === "done") {
      sessionStorage.setItem(SESSION_KEY, "1");
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  /**
   * Hard failsafe.
   *
   * The "hello" phase used to advance ONLY when HandwritingText called
   * onDrawn — and that only fires after two third-party requests succeed
   * (opentype.js from a CDN, plus the TTF from GitHub). On a phone with a
   * slow, metered or filtered connection either can hang or fail, in which
   * case the callback never came, the phase never changed, and the page was
   * left with `body { overflow: hidden }` behind a full-screen overlay —
   * i.e. completely frozen.
   *
   * This timer ends the intro regardless of what the network is doing.
   * Nothing on the page may depend on an external asset to become usable.
   */
  React.useEffect(() => {
    if (phase === "done") return;
    const bail = setTimeout(() => setPhase("done"), 6000);
    return () => clearTimeout(bail);
  }, [phase]);

  React.useEffect(() => {
    // Move on from "hello" on a timer as well as on the draw callback,
    // whichever lands first, so the sequence keeps its pacing when the
    // handwriting font is slow and still completes when it never arrives.
    if (phase === "hello") {
      const t = setTimeout(() => setPhase("wordmark"), 2600);
      return () => clearTimeout(t);
    }
    if (phase === "wordmark") {
      const t = setTimeout(() => setPhase("tagline"), 1500);
      return () => clearTimeout(t);
    }
    if (phase === "tagline") {
      const t = setTimeout(() => setPhase("done"), 1700);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (skip) return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 0,
            transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-white/95 text-neutral-900 md:bg-white/70 md:backdrop-blur-2xl"
        >
          {/* Soft blurred color blobs behind the glass pane for depth */}
          <div className="pointer-events-none absolute -left-24 -top-24 hidden h-96 w-96 rounded-full bg-[#1164B7]/25 blur-[100px] md:block" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 hidden h-96 w-96 rounded-full bg-[#1164B7]/15 blur-[100px] md:block" />
          <div className="pointer-events-none absolute inset-0 bg-white/40" />

          <button
            onClick={() => setPhase("done")}
            className="absolute bottom-6 right-6 z-10 font-mono text-[11px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-neutral-900"
          >
            Skip intro
          </button>

          <AnimatePresence mode="wait">
            {phase === "hello" && (
              <motion.div
                key="hello"
                className="relative z-10"
                exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.4 } }}
              >
                <HandwritingText
                  text="hello"
                  height="clamp(4rem, 14vw, 8rem)"
                  duration={1.4}
                  strokeWidth={1.4}
                  className="text-neutral-900"
                  onDrawn={() => setPhase((cur) => (cur === "hello" ? "wordmark" : cur))}
                />
              </motion.div>
            )}

            {phase === "wordmark" && (
              <motion.div
                key="wordmark"
                initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(10px)", transition: { duration: 0.4 } }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex items-center gap-4 sm:gap-6"
              >
                {/* Force the dark mark: the intro pane is always light-glass,
                    regardless of the visitor's site theme. */}
                <img
                  src="/onecorelabBlack.png"
                  alt=""
                  aria-hidden="true"
                  className="block h-11 w-11 shrink-0 sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem]"
                />
                <Wordmark
                  className="text-4xl leading-none text-neutral-900 sm:text-6xl md:text-7xl"
                  blueClassName="text-[#1164B7]"
                  registered
                />
              </motion.div>
            )}

            {phase === "tagline" && (
              <motion.p
                key="tagline"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16, transition: { duration: 0.4 } }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 px-6 text-center font-mono text-xs uppercase tracking-[0.35em] text-neutral-500 sm:text-sm"
              >
                Building the systems behind serious products
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
