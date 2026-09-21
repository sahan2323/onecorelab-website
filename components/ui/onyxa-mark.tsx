import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Onyxa's avatar mark — a faceted onyx gem, since the name comes from onyx.
 * Dark "onyx" disc with brand-blue facets, plus a faint rim so the disc keeps
 * its edge on dark backgrounds. Self-contained: it brings its own disc, so
 * don't wrap it in a coloured circle.
 *
 * Gradient ids go through useId() so two marks on one page can't clash.
 */
export function OnyxaMark({ className }: { className?: string }) {
  const uid = React.useId().replace(/:/g, "");
  const bg = `onyxa-bg-${uid}`;
  const crown = `onyxa-crown-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="Onyxa"
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b2433" />
          <stop offset="1" stopColor="#05070b" />
        </linearGradient>
        <linearGradient id={crown} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fc0ff" />
          <stop offset="1" stopColor="#1164B7" />
        </linearGradient>
      </defs>

      <circle cx="16" cy="16" r="16" fill={`url(#${bg})`} />
      <circle cx="16" cy="16" r="15.5" fill="none" stroke="#ffffff" strokeOpacity="0.14" />

      <g transform="translate(16 16.4) scale(1.13) translate(-16 -17)">
        <polygon
          points="11,9 21,9 25,14 16,25 7,14"
          fill="#0b1220"
          stroke="#5fa3ed"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <polygon points="11,9 16,9 13.5,14 7,14" fill={`url(#${crown})`} />
        <polygon points="16,9 21,9 25,14 18.5,14" fill="#1164B7" opacity="0.55" />
        <polygon points="16,9 18.5,14 13.5,14" fill="#2f82dc" opacity="0.8" />
        <polygon points="7,14 13.5,14 16,25" fill="#1164B7" opacity="0.35" />
        <polygon points="13.5,14 18.5,14 16,25" fill="#5fa3ed" opacity="0.25" />
        <path
          d="M7 14 H25 M13.5 14 L16 25 M18.5 14 L16 25 M13.5 14 L16 9 L18.5 14"
          stroke="#9ecbff"
          strokeWidth="0.6"
          strokeOpacity="0.7"
          fill="none"
          strokeLinejoin="round"
        />
        <circle cx="12.3" cy="10.8" r="0.9" fill="#ffffff" opacity="0.9" />
      </g>
    </svg>
  );
}

export default OnyxaMark;