"use client";
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Globe,
  LayoutDashboard,
  Workflow,
  Sparkles,
  Plug,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CAPABILITIES = [
  {
    index: "01",
    key: "web",
    title: "Web",
    description: "Marketing sites and landing pages built to load fast and convert.",
    detail:
      "Responsive, SEO-minded builds on Next.js — the kind of site that still feels fast on a bad connection.",
    icon: Globe,
  },
  {
    index: "02",
    key: "product",
    title: "Product",
    description: "Web apps and internal dashboards your team will actually use.",
    detail:
      "From first wireframe to a dashboard with real-time data, built for the way your team already works.",
    icon: LayoutDashboard,
  },
  {
    index: "03",
    key: "automation",
    title: "Automation",
    description: "Workflows that quietly remove hours of manual work every week.",
    detail:
      "Form builders, notification pipelines, and integrations that connect the tools you already pay for.",
    icon: Workflow,
  },
  {
    index: "04",
    key: "ai",
    title: "AI Systems",
    description: "Applied AI features that solve a real problem, not a demo.",
    detail:
      "Search, summarization, and assistive tooling wired directly into your product — scoped to what actually helps.",
    icon: Sparkles,
  },
  {
    index: "05",
    key: "integrations",
    title: "Integrations",
    description: "Clean connections between the platforms your business runs on.",
    detail:
      "APIs, webhooks, and data pipelines that keep your stack talking to itself without duct tape.",
    icon: Plug,
  },
  {
    index: "06",
    key: "support",
    title: "Support",
    description: "Ongoing maintenance so launch day isn't the finish line.",
    detail:
      "Monitoring, updates, and a team that answers — support plans built around how much you actually need.",
    icon: LifeBuoy,
  },
] as const;

export function Capabilities() {
  const [active, setActive] = React.useState(0);
  const current = CAPABILITIES[active];

  return (
    <section className="border-b border-border bg-background py-24 sm:py-32">
      <div className="container-lab">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">02 / Capabilities</p>
            <h2 className="font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
              Six ways we get involved.
            </h2>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <ul className="divide-y divide-border border-y border-border">
            {CAPABILITIES.map((cap, i) => (
              <li key={cap.key}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group flex w-full items-baseline gap-5 py-5 text-left transition-colors sm:py-6",
                    active === i ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <span className="font-mono text-xs tabular-nums">{cap.index}</span>
                  <span className="font-display font-semibold tracking-tight text-2xl transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">
                    {cap.title}
                  </span>
                  <span
                    className={cn(
                      "ml-auto hidden max-w-[16rem] text-right text-sm transition-opacity sm:block",
                      active === i ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {cap.description}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-border bg-surface p-8 sm:min-h-[360px] sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-full flex-col"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-royal-600/10 text-royal-600 dark:text-royal-400">
                  <current.icon className="h-6 w-6" />
                </div>
                <p className="mt-8 max-w-md text-lg leading-relaxed text-foreground/90 sm:text-xl">
                  {current.detail}
                </p>
                <p className="mt-auto pt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {current.index} / 06 — {current.title}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
