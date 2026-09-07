"use client";
// Single, static hero — laptop mockup plus the pitch.
//
// The scroll-scrubbed "cinematic card" that used to live here was removed
// deliberately. Even hidden behind `display:none` on mobile it stayed
// mounted, so phones still paid for its scroll listeners, its second
// particle canvas and a second copy of the laptop. Together with its
// full-bleed 90vw/100vw card it was also the main source of horizontal
// overflow, which is why the page didn't sit inside the screen. One hero,
// no scroll hijacking, same content.

import { HandwritingText } from "@/components/ui/handwriting-text";
import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { AsciiParticleField } from "@/components/ui/ascii-particle-field";
import { LaptopMockup } from "@/components/ui/laptop-mockup";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/animations/magnetic-button";
import { useHeavyEffects } from "@/lib/use-heavy-effects";

const SERVICES = ["Websites", "Online stores", "Dashboards", "Automation"];

const STATS = [
  { v: "50+", l: "Projects shipped" },
  { v: "30+", l: "Happy clients" },
  { v: "24/7", l: "Support" },
];

/** Backdrop: particles on desktop, a cheap static wash on touch devices. */
function HeroBackdrop() {
  const heavy = useHeavyEffects();

  return (
    <>
      <div className="ocl-hero-grid pointer-events-none absolute inset-0" aria-hidden />

      {heavy && (
        <div className="absolute inset-0">
          <AsciiParticleField className="opacity-55" />
        </div>
      )}

      {/* Painted as radial gradients rather than blurred elements. A
          `blur-[100px]` filter forces the browser to rasterise the element
          and run a large gaussian every time the area repaints, which is
          what was leaving unpainted bands while scrolling on mobile. A
          gradient costs effectively nothing and looks identical here. */}
      <div className="ocl-hero-wash pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
    </>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-background">
      <HeroBackdrop />

      <div className="container-lab relative z-10 flex flex-1 flex-col pb-28 pt-24 sm:pb-20 sm:pt-32">
        <p className="eyebrow">oneCoreLab® — Software Laboratory</p>

        <div className="mt-8 grid flex-1 items-center gap-10 lg:mt-2 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* Pitch */}
          <div>
            <h1 className="max-w-xl text-balance font-display text-[2rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Software that{" "}
              <HandwritingText
                text="actually works"
                height="0.88em"
                duration={1.6}
                delay={0.3}
                className="text-primary"
              />{" "}
              for your business.
            </h1>

            <p className="mt-5 max-w-md text-balance text-[15px] text-muted-foreground sm:mt-6 sm:text-lg">
              We design and build the websites, stores, dashboards and
              automations that growing companies actually run on — then stay on
              to support them.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2 sm:mt-7">
              {SERVICES.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.45 }}
                  className="rounded-full border border-border bg-background/60 px-3.5 py-1.5 font-label text-xs font-medium tracking-wide text-muted-foreground"
                >
                  {s}
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9">
              <Magnetic>
                <Button asChild size="lg" variant="primary">
                  <Link href="#inquiry">
                    Get a Free Quote <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Magnetic>
              <Button asChild size="lg" variant="outline">
                <Link href="/projects">See Our Work</Link>
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-border pt-6">
              {STATS.map((s) => (
                <div key={s.l}>
                  <p className="font-display text-xl font-bold tracking-tight">{s.v}</p>
                  <p className="font-label text-[11px] uppercase tracking-wide text-muted-foreground">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:pl-4"
          >
            <LaptopMockup />
          </motion.div>
        </div>

        <div className="mt-10 hidden justify-center sm:flex">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <p className="font-label text-[10px] uppercase tracking-[0.25em]">Scroll</p>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ArrowDown className="h-3.5 w-3.5" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
