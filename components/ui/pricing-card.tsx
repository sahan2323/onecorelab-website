// Adapted from a 21st.dev pricing component (uilayout.contact/pricing).
// Kept: the checkmark-in-a-circle feature list, the "Popular" ring
// treatment, and the clean price/description hierarchy. Dropped: the
// monthly/yearly toggle and NumberFlow animated counter (our pricing is a
// one-time setup fee + a monthly range, not a single number that flips
// between two states) and the orange theme, recolored to royal blue.
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  name: string;
  tag: string;
  setup: string;
  monthly: string;
  features: string[];
  featured?: boolean;
  ctaLabel?: string;
}

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-8 transition-shadow",
        plan.featured ? "border-royal-600 bg-background shadow-xl shadow-royal-600/[0.08]" : "border-border bg-background"
      )}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-8 rounded-full bg-royal-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          Most Popular
        </span>
      )}

      <h3 className="font-display font-semibold tracking-tight text-2xl">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.tag}</p>

      <div className="mt-6">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{plan.setup}</p>
        <p className="mt-1 text-sm text-muted-foreground">plus {plan.monthly}</p>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                plan.featured ? "border-royal-600 bg-royal-600/10 text-royal-600" : "border-border text-muted-foreground"
              )}
            >
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <Button asChild variant={plan.featured ? "primary" : "outline"} className="mt-8">
        <Link href="/contact">{plan.ctaLabel ?? `Choose ${plan.name}`}</Link>
      </Button>
    </div>
  );
}
