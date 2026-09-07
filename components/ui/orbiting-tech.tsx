"use client";
// Adapted from the "modern-animated-sign-in" reference block
// (OrbitingCircles / TechOrbitDisplay). Interaction pattern (orbiting icons
// at varying radii/speeds/directions) kept faithful; recolored to
// oneCoreLab's royal-blue/black/white palette and repurposed from a login
// decoration into the homepage "Technology" section, since oneCoreLab
// chooses tools per client rather than a single fixed stack.

import * as React from "react";
import { cn } from "@/lib/utils";

type OrbitingCirclesProps = {
  className?: string;
  children: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
};

export function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 24,
  delay = 0,
  radius = 100,
  path = false,
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute inset-0 size-full">
          <circle className="stroke-white/10" cx="50%" cy="50%" r={radius} fill="none" />
        </svg>
      )}
      <div
        style={
          {
            "--duration": duration,
            "--radius": radius,
            "--delay": -delay,
          } as React.CSSProperties
        }
        className={cn(
          "absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full [animation-delay:calc(var(--delay)*1000ms)]",
          { "[animation-direction:reverse]": reverse },
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

export type TechIconConfig = {
  name: string;
  duration?: number;
  delay?: number;
  radius?: number;
  reverse?: boolean;
  size?: number;
  render: () => React.ReactNode;
};

/** Small legible badge every orbiting icon sits in — guarantees contrast for
 *  both colored and black-on-transparent logos against the dark section. */
function IconBadge({ children, size = 44, label }: { children: React.ReactNode; size?: number; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-white shadow-lg shadow-black/30 ring-1 ring-black/5"
    >
      {children}
    </div>
  );
}

function DevIcon({ slug, label, pad = 9 }: { slug: string; label: string; pad?: number }) {
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}.svg`}
      alt={label}
      style={{ padding: pad }}
      className="h-full w-full"
      loading="lazy"
    />
  );
}

/** Icon radii/sizes below are authored against this reference container
 *  width; TechOrbitDisplay measures its actual box and scales everything
 *  down proportionally on smaller screens so nothing clips off-container. */
const REFERENCE_SIZE = 640;

export function TechOrbitDisplay({
  icons,
  title = "One core team.",
  subtitle = "Different stack for every client — we pick the tools that fit the job, not the other way around.",
}: {
  icons: TechIconConfig[];
  title?: string;
  subtitle?: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const box = Math.min(entry.contentRect.width, entry.contentRect.height);
      setScale(Math.min(1, box / REFERENCE_SIZE));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <div className="pointer-events-none relative z-10 max-w-md px-4 text-center">
        <p className="font-display font-semibold tracking-tight text-3xl text-white sm:text-4xl">{title}</p>
        <p className="mt-4 text-sm text-white/50 sm:text-base">{subtitle}</p>
      </div>

      {icons.map((icon) => (
        <OrbitingCircles
          key={icon.name}
          duration={icon.duration}
          delay={icon.delay}
          radius={(icon.radius ?? 100) * scale}
          reverse={icon.reverse}
        >
          <IconBadge size={(icon.size ?? 44) * Math.max(scale, 0.72)} label={icon.name}>
            {icon.render()}
          </IconBadge>
        </OrbitingCircles>
      ))}
    </div>
  );
}

export { DevIcon };
