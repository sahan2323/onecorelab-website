import { HandwritingText } from "@/components/ui/handwriting-text";
import { Clock, MessageSquare, ShieldCheck } from "lucide-react";
import { QuickInquiryForm } from "@/components/inquiry/quick-inquiry-form";
import { WhatsAppIcon } from "@/components/ui/whatsapp-button";
import { WHATSAPP_LINK, WHATSAPP_NUMBER_DISPLAY, CONTACT_EMAIL } from "@/lib/constants";
import { Reveal } from "@/components/animations/reveal";

const POINTS = [
  { icon: Clock, text: "We reply within 24 hours — usually much sooner." },
  { icon: MessageSquare, text: "A real conversation first. No pushy sales call." },
  { icon: ShieldCheck, text: "A clear quote before any work starts." },
];

export function HomeInquiry() {
  return (
    <section id="inquiry" className="scroll-mt-24 border-t border-border bg-background py-20 sm:py-28">
      <div className="container-lab grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <p className="eyebrow mb-3">Get Started</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Tell us what you need.{" "}
            <HandwritingText text="We'll be honest" height="0.9em" className="text-primary" duration={1.6} />{" "}
            about what it takes.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Not sure where to start, or whether your idea is even possible?
            That&rsquo;s exactly the kind of question we like. Send a short
            message and we&rsquo;ll come back with honest advice.
          </p>

          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <p.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                </span>
                <span className="pt-1.5 text-sm text-foreground/90">{p.text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-sm">
            <span className="text-muted-foreground">Prefer to reach us directly?</span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a
                href={WHATSAPP_LINK("Hi! I'd like to ask about a project.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-medium text-[#25D366] hover:opacity-80"
              >
                <WhatsAppIcon className="h-4 w-4" /> {WHATSAPP_NUMBER_DISPLAY}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:opacity-80">
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-md border border-border bg-card p-6 shadow-sm sm:p-8">
            <QuickInquiryForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
