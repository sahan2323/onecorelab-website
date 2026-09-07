"use client";
// Hardware/material treatment adapted from the supplied cinematic-hero
// reference: layered inset + drop shadows to build real physical depth, a
// pointer-tracked sheen, and a subtle 3D tilt driven by cursor position.
//
// Changed for oneCoreLab: the reference mocked up an iPhone showing a
// sobriety tracker; this is a laptop showing a client dashboard built from
// the services we actually sell (project pipeline, automation runs, uptime).
// The reference's 7000px pinned GSAP timeline was deliberately not carried
// over — that's heavier scroll-hijacking than the video hero already
// rejected. The depth and tilt are the parts worth keeping.

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const SCREEN_STYLES = `
  .ocl-laptop-lid {
    background: linear-gradient(160deg, #3a3d42 0%, #1b1d21 55%, #0e0f12 100%);
    box-shadow:
      0 40px 80px -20px rgba(0,0,0,0.55),
      0 12px 24px -8px rgba(0,0,0,0.35),
      inset 0 1px 1px rgba(255,255,255,0.18),
      inset 0 -2px 3px rgba(0,0,0,0.6);
  }
  .ocl-laptop-screen {
    background: linear-gradient(170deg, #0b1220 0%, #070a12 100%);
    box-shadow: inset 0 0 24px rgba(0,0,0,0.9);
  }
  .ocl-screen-glare {
    background: linear-gradient(112deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 42%);
  }
  .ocl-laptop-base {
    background: linear-gradient(180deg, #d3d6db 0%, #9aa0a8 45%, #6e747c 100%);
    box-shadow:
      0 22px 34px -12px rgba(0,0,0,0.45),
      inset 0 1px 1px rgba(255,255,255,0.7);
  }
  .ocl-laptop-notch {
    background: linear-gradient(180deg, #5c6169 0%, #3a3e45 100%);
  }
  .ocl-widget {
    background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%);
    box-shadow:
      0 8px 18px rgba(0,0,0,0.35),
      inset 0 1px 1px rgba(255,255,255,0.06),
      inset 0 -1px 1px rgba(0,0,0,0.45);
    border: 1px solid rgba(255,255,255,0.05);
  }
  .ocl-float-badge {
    background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%);
    /* backdrop-filter re-samples everything behind the element on every
       repaint. Only enable it where there's a precise pointer (desktop);
       touch devices get a solid tint that looks near-identical. */
    background-color: rgba(18, 26, 45, 0.82);
  }
  @media (hover: hover) and (pointer: fine) {
    .ocl-float-badge {
      background-color: transparent;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.10),
      0 22px 44px -14px rgba(0,0,0,0.55),
      inset 0 1px 1px rgba(255,255,255,0.20);
  }
  @media (prefers-reduced-motion: reduce) {
    .ocl-anim { animation: none !important; }
  }
`;

/** Small inline bar chart — no chart lib, no layout shift. */
function MiniBars() {
  const bars = [38, 52, 44, 66, 58, 78, 71, 88];
  return (
    <div className="flex h-16 items-end gap-1.5">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "w-full rounded-sm",
            i === bars.length - 1 ? "bg-[#4b91ea]" : "bg-white/15"
          )}
        />
      ))}
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="flex h-full w-full flex-col gap-3 p-4 text-white sm:gap-4 sm:p-5">
      {/* App chrome */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#4b91ea]" />
          <span className="text-[10px] font-semibold tracking-tight sm:text-xs">
            Client Dashboard
          </span>
        </div>
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { v: "12", l: "Active builds" },
          { v: "1.4k", l: "Tasks automated" },
          { v: "99.9%", l: "Uptime" },
        ].map((m) => (
          <div key={m.l} className="ocl-widget rounded-lg p-2 sm:p-2.5">
            <p className="text-sm font-bold leading-none tracking-tight sm:text-base">{m.v}</p>
            <p className="mt-1 text-[7px] uppercase tracking-wider text-white/40 sm:text-[8px]">
              {m.l}
            </p>
          </div>
        ))}
      </div>

      {/* Chart panel */}
      <div className="ocl-widget flex-1 rounded-lg p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[8px] uppercase tracking-wider text-white/40 sm:text-[9px]">
            Deployments this quarter
          </p>
          <p className="text-[8px] font-medium text-[#4b91ea] sm:text-[9px]">+24%</p>
        </div>
        <MiniBars />
      </div>

      {/* Task rows */}
      <div className="space-y-1.5 sm:space-y-2">
        {[
          { t: "Checkout flow rebuild", s: "Shipped" },
          { t: "Invoice sync automation", s: "Running" },
        ].map((row) => (
          <div key={row.t} className="ocl-widget flex items-center gap-2.5 rounded-lg p-2 sm:p-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#4b91ea]/15 sm:h-6 sm:w-6">
              <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5 text-[#4b91ea] sm:h-3 sm:w-3">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="flex-1 truncate text-[9px] font-medium sm:text-[10px]">{row.t}</span>
            <span className="shrink-0 text-[8px] text-white/35 sm:text-[9px]">{row.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LaptopMockup({
  className,
  /** Disable the pointer tilt when a parent (e.g. a scroll timeline) is
   *  already driving this element's transform — two transform sources on
   *  one node fight each other. */
  disableTilt = false,
}: {
  className?: string;
  disableTilt?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [interactive, setInteractive] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setInteractive(mq.matches && !reduced && !disableTilt);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced, disableTilt]);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const cfg = { stiffness: 120, damping: 20, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), cfg);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), cfg);
  const sheenX = useTransform(px, (v) => `${v * 100}%`);
  const sheenY = useTransform(py, (v) => `${v * 100}%`);
  // Hoisted with the other hooks — never call a hook inside JSX below a
  // conditional return, or the hook count changes between renders.
  const sheen = useTransform(
    [sheenX, sheenY],
    ([x, y]: string[]) =>
      `radial-gradient(600px circle at ${x} ${y}, rgba(255,255,255,0.07), transparent 45%)`
  );

  React.useEffect(() => {
    if (!interactive) return;
    const onMove = (e: MouseEvent) => {
      px.set(e.clientX / window.innerWidth);
      py.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, px, py]);

  return (
    <div className={cn("relative w-full", className)} style={{ perspective: 1400 }}>
      <style dangerouslySetInnerHTML={{ __html: SCREEN_STYLES }} />

      <motion.div
        ref={ref}
        style={
          interactive
            ? { rotateX, rotateY, transformStyle: "preserve-3d" }
            : { transformStyle: "preserve-3d" }
        }
        className={cn("relative mx-auto w-full max-w-[560px]", interactive && "will-change-transform")}
      >
        {/* Lid */}
        <div className="ocl-laptop-lid relative rounded-t-[10px] p-[7px] sm:rounded-t-[12px] sm:p-[9px]">
          <div className="ocl-laptop-screen relative aspect-[16/10.5] w-full overflow-hidden rounded-[3px] sm:rounded-[4px]">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-30"
              style={interactive ? { background: sheen } : undefined}
            />
            <div className="ocl-screen-glare pointer-events-none absolute inset-0 z-20" aria-hidden />
            {/* Camera */}
            <div className="absolute left-1/2 top-1.5 z-30 h-1 w-1 -translate-x-1/2 rounded-full bg-white/20" aria-hidden />
            <DashboardScreen />
          </div>
        </div>

        {/* Base / hinge */}
        <div className="relative">
          <div className="ocl-laptop-base h-3 w-full rounded-b-[4px] sm:h-3.5 sm:rounded-b-[5px]" />
          <div className="ocl-laptop-notch mx-auto h-1 w-16 rounded-b-[4px] sm:w-24" />
          {/* Cast shadow under the machine */}
          <div
            className="mx-auto mt-3 h-6 w-[78%] rounded-[50%] bg-black/25 blur-xl dark:bg-black/50"
            aria-hidden
          />
        </div>

        {/* Floating proof badges */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transform: "translateZ(60px)" }}
          className="ocl-float-badge absolute left-1 top-8 flex items-center gap-2 rounded-xl p-2 sm:-left-8 sm:gap-3 sm:p-3"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4b91ea]/20 text-xs sm:h-9 sm:w-9 sm:text-sm">
            ⚡
          </span>
          <div className="pr-1">
            <p className="text-[10px] font-semibold leading-tight text-white sm:text-xs">
              14 hrs / week saved
            </p>
            <p className="text-[9px] text-white/50 sm:text-[10px]">Automation live</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transform: "translateZ(60px)" }}
          className="ocl-float-badge absolute bottom-10 right-1 flex items-center gap-2 rounded-xl p-2 sm:-right-8 sm:gap-3 sm:p-3"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/20 text-xs sm:h-9 sm:w-9 sm:text-sm">
            ✓
          </span>
          <div className="pr-1">
            <p className="text-[10px] font-semibold leading-tight text-white sm:text-xs">
              Shipped on schedule
            </p>
            <p className="text-[9px] text-white/50 sm:text-[10px]">Every sprint</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LaptopMockup;
