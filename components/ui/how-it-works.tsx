"use client";
// Adapted from the provided HowItWorks reference component. Interaction
// pattern (diagonally offset cards + animated dashed connector path + pin
// icon + oversized step number) kept faithful; the default orange/blue/
// purple theme trio was replaced with royal-blue/ink/slate variants so the
// section stays within the oneCoreLab royal-blue + black + white palette.

import * as React from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { cn } from "@/lib/utils";

const Pin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

type Theme = "royal" | "ink" | "slate";

const THEME_STYLES: Record<Theme, { bg: string; text: string; border: string }> = {
  royal: {
    bg: "bg-royal-50 dark:bg-royal-500/10",
    text: "text-royal-600 dark:text-royal-400",
    border: "border-royal-100 dark:border-royal-500/20",
  },
  ink: {
    bg: "bg-neutral-100 dark:bg-white/10",
    text: "text-neutral-800 dark:text-neutral-200",
    border: "border-neutral-200 dark:border-white/15",
  },
  slate: {
    bg: "bg-slate-50 dark:bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-100 dark:border-slate-500/20",
  },
};

function Card({
  number,
  title,
  description,
  theme = "royal",
  className,
  rotate,
}: {
  number: string;
  title: string;
  description: string;
  theme?: Theme;
  className?: string;
  rotate?: string;
}) {
  const colors = THEME_STYLES[theme];

  return (
    <div className={`relative w-full transition-transform duration-300 md:w-[280px] hover:z-30 hover:scale-105 ${rotate} ${className}`}>
      <div className="rounded-[25px] border border-neutral-100 bg-white p-2 shadow-[0px_10px_20px_0px_#D3D3D3] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
        <Pin className={cn("z-20 mx-auto mb-6 h-8 w-8", colors.text)} />
        <div className={cn("relative flex h-full flex-col overflow-hidden rounded-[15px] border p-[15px]", colors.bg, colors.border)}>
          <span className={cn("mb-5 font-mono text-3xl font-semibold", colors.text)}>{number}</span>
          <h3 className="mb-[10px] text-2xl font-semibold leading-none text-neutral-800 dark:text-neutral-100">{title}</h3>
          <p className="text-sm/5 tracking-tight text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

export interface ProcessStep {
  title: string;
  description: string;
  theme?: Theme;
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

const DEFAULT_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-6" },
  { className: "md:absolute md:top-[120px] md:right-[15%]", rotate: "-rotate-6" },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "rotate-6" },
  { className: "md:absolute md:top-[570px] md:right-[10%]", rotate: "-rotate-6" },
];

export function HowWeWork({
  steps,
  positions = DEFAULT_POSITIONS,
  className,
}: {
  steps: ProcessStep[];
  positions?: StepPosition[];
  className?: string;
}) {
  const height =
    steps.length <= 1 ? 400 : steps.length === 2 ? 450 : steps.length === 3 ? 800 : steps.length === 4 ? 900 : 1130;

  return (
    <LazyMotion features={domAnimation}>
      <div className={cn("relative bg-background", className)}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.1]"
          style={{ backgroundImage: "linear-gradient(currentColor 1px, transparent 1px)", backgroundSize: "100% 32px" }}
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div
            className="relative mx-auto flex h-auto w-full max-w-[1000px] flex-col space-y-8 md:h-[var(--md-height)] md:space-y-0 md:block"
            style={{ "--md-height": `${height}px` } as React.CSSProperties}
          >
            {steps.length > 1 && (
              <svg className="absolute inset-0 z-0 hidden h-full w-full pointer-events-none md:block" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none">
                {(() => {
                  const pathD = steps.reduce((acc, _, index) => {
                    if (index >= steps.length - 1) return acc;
                    if (index === 0) return "M 290 150 C 500 150, 550 270, 710 270";
                    if (index === 1) return acc + " C 850 270, 500 350, 290 450";
                    if (index === 2) return acc + " C 290 600, 550 720, 750 720";
                    if (index === 3) return acc + " C 950 720, 500 800, 290 850";
                    return acc;
                  }, "");
                  return (
                    <m.path
                      d={pathD}
                      stroke="currentColor"
                      className="text-royal-300 dark:text-royal-900"
                      strokeWidth="2"
                      strokeDasharray="8 6"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -140 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  );
                })()}
              </svg>
            )}

            {steps.map((step, index) => {
              const position = positions[index % positions.length];
              return (
                <Card
                  key={step.title}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  theme={step.theme ?? (index % 2 === 0 ? "royal" : "ink")}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}

export default HowWeWork;
