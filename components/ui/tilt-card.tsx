"use client";
import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A card that tilts toward the pointer with real perspective, plus a soft
 * specular highlight that follows the cursor.
 *
 * Deliberately inert on touch: a tilt driven by pointer position has no
 * meaning on a finger-driven device, and applying transforms mid-scroll
 * there tends to feel like lag rather than depth. Touch and
 * prefers-reduced-motion both fall back to a plain (still styled) card.
 */
export function TiltCard({
  children,
  className,
  intensity = 8,
}: {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees at the card's corners. */
  intensity?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [interactive, setInteractive] = React.useState(false);

  React.useEffect(() => {
    // Only enable on devices with a precise pointer (mouse/trackpad).
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setInteractive(mq.matches && !reduced);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced]);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springCfg = { stiffness: 180, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), springCfg);
  const rotateY = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), springCfg);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);

  // NOTE: this must stay at the top level with every other hook. It used to
  // live inline in the JSX below, which sits after the `!interactive` early
  // return — so the moment `interactive` flipped to true React saw more hooks
  // than on the previous render and threw. Hook count has to be identical on
  // every render regardless of which branch we take.
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]: string[]) =>
      `radial-gradient(400px circle at ${x} ${y}, hsl(var(--primary) / 0.08), transparent 70%)`
  );

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  if (!interactive) {
    return (
      <div className={cn("rounded-md border border-border bg-card p-6 sm:p-8", className)}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={cn(
          "group relative h-full overflow-hidden rounded-md border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-black/[0.07] sm:p-8",
          className
        )}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glare }}
        />
        <div style={{ transform: "translateZ(40px)" }} className="relative h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
