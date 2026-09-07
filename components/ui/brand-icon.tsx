import { BRAND_ICONS } from "@/lib/brand-icons";

/** Renders a verified brand SVG icon from local data — no remote requests. */
export function BrandIcon({
  name,
  className,
  color = "currentColor",
}: {
  name: keyof typeof BRAND_ICONS;
  className?: string;
  color?: string;
}) {
  const icon = BRAND_ICONS[name];
  if (!icon) return null;
  return (
    <svg role="img" viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}
