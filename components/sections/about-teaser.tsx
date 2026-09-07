import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";

export function AboutTeaser() {
  return (
    <section className="border-t border-border bg-background py-24 sm:py-32">
      <div className="container-lab grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-3">06 / About</p>
          <h2 className="font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
            More than just an agency.
          </h2>
        </div>
        <Reveal>
          <p className="text-balance text-xl leading-relaxed text-foreground/90 sm:text-2xl">
            We empower businesses with cutting-edge digital solutions that
            solve real problems and open up new opportunities for growth. From
            first concept to final launch, we work closely with you so the
            result exceeds the brief, not just meets it.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-royal-600 hover:text-royal-700"
          >
            More about oneCoreLab <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
