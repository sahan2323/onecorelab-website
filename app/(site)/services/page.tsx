import { HandwritingText } from "@/components/ui/handwriting-text";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowUpRight, Globe, LayoutDashboard, Workflow, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/ui/pricing-card";
import { FeatureGrid, type GridFeature } from "@/components/ui/grid-feature-cards";
import { Reveal } from "@/components/animations/reveal";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web development, product dashboards, automation and ongoing support — pricing that scales with your business.",
};

const CAPABILITIES: GridFeature[] = [
  {
    title: "Web Development",
    icon: Globe,
    description: "Fast, responsive marketing sites and landing pages that make a lasting impression.",
  },
  {
    title: "Product & Dashboards",
    icon: LayoutDashboard,
    description: "Web apps and internal dashboards built around how your team actually works.",
  },
  {
    title: "Smart Automation",
    icon: Workflow,
    description: "Automated workflows that save time and remove repetitive manual work.",
  },
  {
    title: "Ongoing Support",
    icon: LifeBuoy,
    description: "Maintenance and technical support so launch day isn't the finish line.",
  },
];

const PLANS = [
  {
    name: "Starter",
    tag: "Perfect for small businesses",
    setup: "$599 one-time",
    monthly: "$50–$100 /month",
    features: [
      "5-page professional website",
      "Fully responsive design",
      "Basic SEO setup",
      "Monthly maintenance & updates",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Professional",
    tag: "For growing businesses",
    setup: "$999 one-time",
    monthly: "$75–$150 /month",
    features: [
      "Unlimited pages",
      "Custom unique design",
      "Advanced SEO & CMS",
      "Priority support",
      "Basic automation tools",
      "Weekly analytics reports",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    tag: "For large organizations",
    setup: "Custom pricing",
    monthly: "Let's talk",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom integrations",
      "Advanced automation",
      "SLA guarantee",
    ],
    featured: false,
    ctaLabel: "Contact Sales",
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-32 sm:pt-40">
      <section className="container-lab pb-16 sm:pb-24">
        <p className="eyebrow mb-4">Services</p>
        <h1 className="max-w-3xl text-balance font-display font-semibold tracking-tight text-4xl leading-[1.05] sm:text-6xl">
          Pricing that scales with your{" "}
          <HandwritingText text="success" height="0.88em" duration={1.3} className="text-primary" />.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          A one-time setup fee plus a flexible monthly subscription based on
          what your business actually needs.
        </p>
      </section>

      <section className="container-lab pb-24">
        <FeatureGrid features={CAPABILITIES} className="sm:grid-cols-2 lg:grid-cols-2" />
      </section>

      <section className="border-t border-border bg-surface/60 py-24">
        <div className="container-lab">
          <p className="eyebrow mb-4">Plans</p>
          <h2 className="mb-14 font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
            Choose your plan.
          </h2>

          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-lab flex flex-col items-start gap-6 py-24 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="max-w-lg font-display font-semibold tracking-tight text-2xl leading-[1.15] sm:text-4xl">
          Not sure which plan fits?{" "}
          <HandwritingText text="Let's talk" height="0.88em" duration={1.3} className="text-primary" /> it through.
        </h2>
        <Button asChild size="lg" variant="primary">
          <Link href="/contact">
            Get a Free Consultation <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
