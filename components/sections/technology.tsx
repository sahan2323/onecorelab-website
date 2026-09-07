"use client";
import { HandwritingText } from "@/components/ui/handwriting-text";
import * as React from "react";
import { Sparkles, Workflow } from "lucide-react";
import { ConstellationGrid } from "@/components/ui/constellation-grid";
import { IconSphere, type SphereIcon } from "@/components/ui/icon-sphere";
import { BrandIcon } from "@/components/ui/brand-icon";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { Reveal } from "@/components/animations/reveal";
import { useHeavyEffects } from "@/lib/use-heavy-effects";

const BRAND_KEYS = Object.keys(BRAND_ICONS) as (keyof typeof BRAND_ICONS)[];

const ITEMS: SphereIcon[] = [
  ...BRAND_KEYS.map((name) => ({
    id: name,
    name,
    render: () => <BrandIcon name={name} className="h-full w-full" color={`#${BRAND_ICONS[name].hex}`} />,
  })),
  {
    id: "claude",
    name: "Claude (Anthropic)",
    render: () => <Sparkles className="h-full w-full text-royal-600" strokeWidth={1.6} />,
  },
  {
    id: "automation",
    name: "Automation",
    render: () => <Workflow className="h-full w-full text-neutral-700" strokeWidth={1.6} />,
  },
];

export function Technology() {
  const heavy = useHeavyEffects();

  return (
    <section className="relative w-full overflow-hidden border-y border-border bg-[#050505] py-24 text-white sm:py-28">
      {heavy && (
        <div className="absolute inset-0 opacity-40">
          <ConstellationGrid influenceRadius={190} showHud={false} />
        </div>
      )}

      <div className="container-lab relative z-10">
        <Reveal>
          <p className="eyebrow mb-3 text-white/50">04 / The Stack</p>
          <h2 className="max-w-2xl text-balance font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
            We don&rsquo;t have a house stack. We have a{" "}
            <HandwritingText text="shortlist" height="0.88em" duration={1.2} className="text-[#5fa3ed]" />{" "}
            for every problem.
          </h2>
          <p className="mt-6 max-w-xl text-white/60">
            A marketing site and a real-time internal dashboard shouldn&rsquo;t
            be built the same way. We pick per project — from what fits the
            requirement, the budget, and the team who&rsquo;ll maintain it
            after we hand it over. Drag the sphere to look around.
          </p>
        </Reveal>
      </div>

      <div className="relative z-10 mt-6 flex justify-center px-6">
        {heavy ? (
          <IconSphere items={ITEMS} containerSize={560} sphereRadius={230} className="max-w-[560px]" />
        ) : (
          /* Touch devices get the same icons as a plain wrapped grid. The
             sphere needs a per-frame React re-render plus an O(n^2) overlap
             pass, which is the single most expensive thing on the page. */
          <ul className="flex max-w-[560px] flex-wrap justify-center gap-2.5">
            {ITEMS.map((item) => (
              <li
                key={item.id}
                title={item.name}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
              >
                <span className="sr-only">{item.name}</span>
                <span className="h-[58%] w-[58%]" aria-hidden>{item.render()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
