// Adapted from 21st.dev — efferd/grid-feature-cards.
// Kept: the dashed-divider grid layout and the subtle generated grid-pattern
// texture behind each card. Adapted for oneCoreLab: the random pattern is
// now seeded from the card index instead of Math.random() so server and
// client render identically (the original re-randomised on every render,
// which causes a React hydration mismatch in Next.js), and sizing/weights
// follow the Stark Precision type scale.
import * as React from "react";
import { cn } from "@/lib/utils";

export type GridFeature = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

/** Deterministic pseudo-random so SSR and client markup match exactly. */
function seededPattern(seed: number, length = 5): number[][] {
  let s = seed * 9301 + 49297;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length }, () => [
    Math.floor(next() * 4) + 7,
    Math.floor(next() * 6) + 1,
  ]);
}

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<"svg"> & {
  width: number;
  height: number;
  x: string;
  y: string;
  squares?: number[][];
}) {
  const patternId = React.useId();
  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], i) => (
            <rect strokeWidth="0" key={i} width={width + 1} height={height + 1} x={sx * width} y={sy * height} />
          ))}
        </svg>
      )}
    </svg>
  );
}

export function FeatureCard({
  feature,
  index = 0,
  className,
  ...props
}: React.ComponentProps<"div"> & { feature: GridFeature; index?: number }) {
  const squares = React.useMemo(() => seededPattern(index + 1), [index]);

  return (
    <div className={cn("group relative overflow-hidden p-6 transition-colors sm:p-8", className)} {...props}>
      <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/[0.04] to-transparent [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={squares}
            className="absolute inset-0 h-full w-full fill-foreground/[0.04] stroke-foreground/20 mix-blend-overlay"
          />
        </div>
      </div>

      <feature.icon
        className="size-6 text-primary transition-transform duration-300 group-hover:scale-110"
        strokeWidth={1.5}
        aria-hidden
      />
      <h3 className="relative z-10 mt-8 font-display text-base font-semibold tracking-tight sm:text-lg">
        {feature.title}
      </h3>
      <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </div>
  );
}

/** The full grid: dashed dividers, no shadows — flat and structural. */
export function FeatureGrid({
  features,
  className,
}: {
  features: GridFeature[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 divide-x divide-y divide-dashed divide-border overflow-hidden rounded border border-dashed border-border bg-card sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {features.map((f, i) => (
        <FeatureCard key={f.title} feature={f} index={i} />
      ))}
    </div>
  );
}
