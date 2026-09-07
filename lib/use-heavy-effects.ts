"use client";
import * as React from "react";

/**
 * Whether this device should run the expensive decorative effects —
 * canvas particle fields, the 3D icon sphere, the ribbon matrix.
 *
 * Returns false for touch devices and for prefers-reduced-motion. Phones
 * were running four independent requestAnimationFrame loops (plus, in the
 * sphere's case, a React re-render every frame), which is what made
 * scrolling stutter and the page feel stuck. Each effect has a cheap static
 * fallback; this hook is the single place that decides.
 *
 * Starts false so the server render and first paint are always the light
 * version, then upgrades on desktop after mount — no hydration mismatch.
 */
export function useHeavyEffects(): boolean {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(fine.matches && calm.matches);
    update();
    fine.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  return enabled;
}
