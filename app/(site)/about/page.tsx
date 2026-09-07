import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ShieldCheck, Users, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { HandwritingText } from "@/components/ui/handwriting-text";
import { Eye, HandshakeIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "We are a team of visionaries, developers, and creators dedicated to transforming ideas into powerful digital realities.",
};

const STATS = [
  { value: "5+", label: "Years Experience" },
  { value: "50+", label: "Projects Delivered" },
  { value: "30+", label: "Happy Clients" },
  { value: "24/7", label: "Support Available" },
];

const VALUES = [
  { icon: Sparkles, title: "Innovation", description: "We constantly explore new technologies to keep you ahead of the curve." },
  { icon: ShieldCheck, title: "Quality", description: "We don't cut corners. Excellence is embedded in our code and design." },
  { icon: Users, title: "Client Focus", description: "Your success is our success. We treat your business like our own." },
  { icon: Compass, title: "Integrity", description: "Honest communication and transparent processes, always." },
];

export default function AboutPage() {
  return (
    <div className="pt-32 sm:pt-40">
      <section className="container-lab pb-16 sm:pb-24">
        <p className="eyebrow mb-4">Who We Are</p>
        <h1 className="max-w-3xl text-balance font-display font-semibold tracking-tight text-4xl leading-[1.05] sm:text-6xl">
          Driving digital{" "}
          <HandwritingText
            text="innovation."
            height="0.95em"
            className="text-primary"
            duration={1.6}
            delay={0.35}
          />
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          We are a team of visionaries, developers, and creators dedicated to
          transforming ideas into powerful digital realities.
        </p>
        <Button asChild size="lg" variant="primary" className="mt-8">
          <Link href="/contact">
            Let&rsquo;s Connect <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="border-y border-border bg-surface/60 py-14">
        <div className="container-lab grid grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display font-semibold tracking-tight text-3xl sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-lab py-24">
        <Reveal className="mb-12 max-w-2xl">
          <p className="eyebrow mb-3">Vision &amp; Promise</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            What drives us, and what you can hold us to.
          </h2>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <TiltCard className="h-full">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Eye className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </span>
              <p className="eyebrow mt-6">Our Vision</p>
              <p className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                To empower businesses with digital solutions that solve real
                problems and open new opportunities for growth.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Good software should remove friction, not add it. We measure our
                work by whether it made something genuinely easier for the people
                who use it every day.
              </p>
            </TiltCard>
          </Reveal>

          <Reveal delay={0.08}>
            <TiltCard className="h-full">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <HandshakeIcon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </span>
              <p className="eyebrow mt-6">Our Promise</p>
              <p className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                Transparency, excellence, and real care in every line of code we
                write for you.
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>Clear quotes before work starts — no surprise invoices.</li>
                <li>Honest timelines, and a heads-up early if anything shifts.</li>
                <li>We stay reachable after launch, not just before it.</li>
              </ul>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-surface/60 py-24">
        <div className="container-lab">
          <p className="eyebrow mb-4">More Than Just An Agency</p>
          <h2 className="max-w-2xl font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
            We don&rsquo;t just build websites; we build relationships.
          </h2>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            Every business is unique, so we take a tailored approach to every
            project. From initial concept to final launch, we work closely
            with you to ensure your vision isn&rsquo;t just met, but exceeded.
          </p>
        </div>
      </section>

      <section className="container-lab py-24">
        <p className="eyebrow mb-4">Our Core Values</p>
        <h2 className="mb-14 font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
          The principles behind every decision.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <Reveal key={v.title} className="rounded-2xl border border-border bg-surface p-6">
              <v.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display font-semibold tracking-tight text-lg">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-[#050505] py-24 text-white">
        <div className="container-lab text-center">
          <h2 className="font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
            Ready to start your journey?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/60">
            Let&rsquo;s build something amazing together — reach out today.
          </p>
          <Button asChild size="lg" variant="primary" className="mt-8 bg-royal-600 hover:bg-royal-500">
            <Link href="/contact">
              Get Started Now <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
