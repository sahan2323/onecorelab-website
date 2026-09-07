"use client";
import * as React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export interface OneCoreLabLogoProps {
  className?: string;
  /** px height; width scales automatically from the source image ratio. */
  height?: number;
  priority?: boolean;
}

/**
 * Renders the correct logo file for the active theme
 * (/public/onecorelabWhite.png in dark mode, /public/onecorelabBlack.png
 * in light mode) and swaps instantly on toggle — no flash of the wrong logo.
 */
export function OneCoreLabLogo({ className, height = 28, priority }: OneCoreLabLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Before hydration we don't know the theme yet — reserve the space with
  // zero opacity rather than guessing, to avoid a mismatched flash.
  // The brand mark is a square glyph (1:1), so width tracks height.
  const src = resolvedTheme === "light" ? "/onecorelabBlack.png" : "/onecorelabWhite.png";

  return (
    <span className={cn("inline-flex items-center", className)} style={{ opacity: mounted ? 1 : 0 }}>
      <Image
        src={src}
        alt="oneCoreLab"
        height={height}
        width={height}
        priority={priority}
        // `block` matters: Next renders <img> inline by default, so it sits
        // on the text baseline and leaves descender space underneath — which
        // is what pushed the mark out of line with the wordmark beside it.
        className="block"
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
