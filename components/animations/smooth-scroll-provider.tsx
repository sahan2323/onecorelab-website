"use client";
import * as React from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide smooth scroll. A single Lenis instance drives the whole page so
 * every GSAP ScrollTrigger and Framer Motion useScroll() hook stays in sync —
 * individual sections should never spin up their own Lenis instance.
 * Respects prefers-reduced-motion by not starting Lenis at all.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    // Touch devices keep native scrolling. Lenis only smooths the wheel, so
    // on a phone it adds a rAF loop and a scroll listener for no visual
    // benefit — and running it alongside momentum scrolling is a common
    // source of janky or "stuck" feeling scroll on mobile.
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (coarsePointer) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // NOTE: there used to be an unused `raf()` here that called
    // gsap.ticker.add(() => {}) on every invocation — each call appended
    // another empty callback to GSAP's ticker and none were ever removed.
    // The ticker below is the only one actually needed.
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
