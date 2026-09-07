import { HandwritingText } from "@/components/ui/handwriting-text";
import type { Metadata } from "next";
import { Mail, Phone, Clock, Globe2 } from "lucide-react";
import { ContactForm } from "./contact-form";
import { ContactCard, type ContactInfoItem } from "@/components/ui/contact-card";
import { WhatsAppIcon } from "@/components/ui/whatsapp-button";
import { WHATSAPP_LINK, WHATSAPP_NUMBER_DISPLAY } from "@/lib/constants";
import { Reveal } from "@/components/animations/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Have a project in mind? Get in touch with oneCoreLab and let's discuss how we can help bring your vision to life.",
};

const FAQS = [
  {
    q: "How quickly can you start on my project?",
    a: "We typically start new projects within 1–2 weeks after the initial consultation and agreement. For urgent projects, we can often begin within 2–3 business days.",
  },
  {
    q: "What is your pricing structure?",
    a: "Our pricing varies based on project scope and complexity. We offer both fixed-price packages and hourly rates — get in touch for a free consultation and a custom quote.",
  },
  {
    q: "Do you offer ongoing support and maintenance?",
    a: "Yes. All projects include post-launch support, and we offer monthly maintenance packages that cover updates, security monitoring, backups, and technical support.",
  },
  {
    q: "Can you work with my existing team?",
    a: "Absolutely — we regularly collaborate with in-house teams, other agencies, and freelancers, and adapt to your workflow and communication preferences.",
  },
];

const CONTACT_INFO: ContactInfoItem[] = [
  {
    icon: WhatsAppIcon,
    label: "WhatsApp",
    value: (
      <a href={WHATSAPP_LINK("Hi! I'd like to ask about a project.")} target="_blank" rel="noreferrer" className="hover:text-foreground">
        {WHATSAPP_NUMBER_DISPLAY}
      </a>
    ),
  },
  {
    icon: Mail,
    label: "Email",
    value: (
      <a href="mailto:onecorelabs7@gmail.com" className="hover:text-foreground">
        onecorelabs7@gmail.com
      </a>
    ),
  },
  {
    icon: Phone,
    label: "Phone",
    value: (
      <a href="tel:+1234567890" className="hover:text-foreground">
        +1 (234) 567-890
      </a>
    ),
  },
  { icon: Clock, label: "Hours", value: "Mon – Fri, 9AM – 6PM EST" },
  { icon: Globe2, label: "Location", value: "Remote — serving clients globally", className: "sm:col-span-2" },
];

export default function ContactPage() {
  return (
    <div className="pt-32 sm:pt-40">
      <section className="container-lab pb-12 sm:pb-16">
        <p className="eyebrow mb-4">Get In Touch</p>
        <h1 className="max-w-3xl text-balance font-display font-semibold tracking-tight text-4xl leading-[1.05] sm:text-6xl">
          Let&rsquo;s build something{" "}
          <HandwritingText text="amazing" height="0.88em" duration={1.4} className="text-primary" /> together.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Have a project in mind? Tell us about it and we&rsquo;ll reply
          within 24 hours with next steps.
        </p>
      </section>

      <section className="container-lab pb-24">
        <Reveal>
          <ContactCard
            title="Tell us about your project"
            description="Fill out the form and we'll get back to you within 24 hours — or reach us directly using the details here."
            contactInfo={CONTACT_INFO}
          >
            <ContactForm />
          </ContactCard>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 sm:gap-x-12">
          <p className="eyebrow sm:col-span-2">FAQ</p>
          {FAQS.map((f) => (
            <div key={f.q}>
              <p className="text-sm font-medium">{f.q}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
