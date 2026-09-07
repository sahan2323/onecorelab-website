import { cn } from "@/lib/utils";

/**
 * The oneCoreLab wordmark, as text.
 *
 * Brand rule: "one" is always lowercase and takes the surrounding text
 * colour; "CoreLab" is always the royal/cobalt brand blue. Rendering this
 * as text (rather than an image) keeps it selectable, translatable,
 * accessible to screen readers, and crisp at any size — and guarantees the
 * casing can never drift.
 */
export function Wordmark({
  className,
  blueClassName = "text-primary",
  registered = false,
}: {
  className?: string;
  /** Override the "CoreLab" colour where the default lacks contrast. */
  blueClassName?: string;
  registered?: boolean;
}) {
  return (
    <span className={cn("font-display font-bold tracking-tight", className)}>
      one<span className={blueClassName}>CoreLab</span>
      {registered && <span className="align-super text-[0.5em]">®</span>}
    </span>
  );
}

/** Plain-text form for aria-labels, alt text and metadata strings. */
export const BRAND_NAME = "oneCoreLab";
