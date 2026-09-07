import { HandwritingText } from "@/components/ui/handwriting-text";
import { Globe, ShoppingCart, LayoutDashboard, Workflow, Smartphone, LifeBuoy } from "lucide-react";
import { FeatureGrid, type GridFeature } from "@/components/ui/grid-feature-cards";
import { Reveal } from "@/components/animations/reveal";

/**
 * Replaces the old scroll-driven "positioning" section. Plain language,
 * no jargon: a visitor should be able to read six cards and immediately
 * know whether we build the thing they need.
 */
const FEATURES: GridFeature[] = [
  {
    title: "Websites",
    icon: Globe,
    description:
      "Fast, modern business websites that look right on every screen and actually bring in enquiries.",
  },
  {
    title: "Online Stores",
    icon: ShoppingCart,
    description:
      "Sell online with a store that's simple for your customers to buy from and simple for you to run.",
  },
  {
    title: "Web Apps & Dashboards",
    icon: LayoutDashboard,
    description:
      "Custom internal tools that replace the spreadsheets your team has outgrown.",
  },
  {
    title: "Automation",
    icon: Workflow,
    description:
      "Connect the tools you already pay for and stop doing the same manual task twice a week.",
  },
  {
    title: "Mobile-Ready Builds",
    icon: Smartphone,
    description:
      "Everything we ship is built mobile-first, because that's where most of your visitors are.",
  },
  {
    title: "Ongoing Support",
    icon: LifeBuoy,
    description:
      "We don't disappear after launch. Updates, fixes and a real person to ask when something breaks.",
  },
];

export function WhatWeDo() {
  return (
    <section className="border-t border-border bg-surface py-20 sm:py-28">
      <div className="container-lab">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-3">What We Do</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Software that solves a{" "}
            <HandwritingText text="real" height="0.9em" className="text-primary" duration={1.1} /> problem.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Whether you need a first website or an internal tool your team
            depends on, we build it properly — and explain it in plain English
            along the way.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <FeatureGrid features={FEATURES} />
        </Reveal>
      </div>
    </section>
  );
}
