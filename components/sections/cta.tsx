"use client";
import { HandwritingText } from "@/components/ui/handwriting-text";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HelixChronoMatrix } from "@/components/ui/helix-chrono-matrix";
import { useHeavyEffects } from "@/lib/use-heavy-effects";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/animations/magnetic-button";

export function Cta() {
  const heavy = useHeavyEffects();

  return (
    <section className="relative overflow-hidden border-t border-border bg-[#050505] py-32 text-white sm:py-40">
      {heavy && (
        <div className="absolute inset-0 opacity-70">
          <HelixChronoMatrix opaque={false} mode="QUANTUM_RIBBONS" />
        </div>
      )}
      <div className="container-lab relative z-10 flex flex-col items-start">
        <p className="eyebrow mb-6 text-white/50">Let&rsquo;s build</p>
        <h2 className="max-w-3xl text-balance font-display font-semibold tracking-tight text-4xl leading-[1.05] sm:text-6xl">
          Ready to build something{" "}
          <HandwritingText text="that lasts" height="0.9em" className="text-[#5fa3ed]" duration={1.4} />?
        </h2>
        <Magnetic className="mt-10">
          <Button asChild size="lg" variant="primary" className="bg-royal-600 hover:bg-royal-500">
            <Link href="/contact">
              Start a Project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </Magnetic>
      </div>
    </section>
  );
}
