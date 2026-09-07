import Link from "next/link";
import { Instagram, Facebook, Linkedin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/ui/wordmark";
import { OneCoreLabLogo } from "@/components/ui/logo";
import { CookieSettingsLink } from "@/components/ui/cookie-settings-link";
import { WhatsAppInlineLink } from "@/components/ui/whatsapp-button";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const SERVICE_LINKS = [
  { href: "/services", label: "Web Development" },
  { href: "/services", label: "Product & Dashboards" },
  { href: "/services", label: "Automation" },
  { href: "/services", label: "AI-assisted Systems" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="container-lab py-16 pb-28 md:py-24 md:pb-32">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            {/* items-center + a block-level mark + leading-none on the text
                is what actually lines these up; any one of the three missing
                and the wordmark drifts off the mark's centre. */}
            <div className="flex items-center gap-3.5">
              <OneCoreLabLogo height={40} className="shrink-0" />
              <Wordmark
                className="text-3xl leading-none sm:text-[2.1rem]"
                blueClassName="text-primary"
                registered
              />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              We build intelligent, scalable and beautifully engineered digital
              products — websites, automation, and internal tools that hold up
              under real traffic.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/onecorelab"
                target="_blank"
                rel="noreferrer"
                aria-label="oneCoreLab on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1BtsquzmXX/?mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
                aria-label="oneCoreLab on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/onecorelab/"
                target="_blank"
                rel="noreferrer"
                aria-label="oneCoreLab on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Services</p>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Get In Touch</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:onecorelabs7@gmail.com" className="hover:text-foreground">
                  onecorelabs7@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+1234567890" className="hover:text-foreground">
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <WhatsAppInlineLink />
              </li>
              <li>Mon – Fri: 9AM – 6PM EST</li>
            </ul>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-royal-600 hover:text-royal-700"
            >
              Start a Project <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>
            © 2025 <Wordmark className="text-xs font-medium" /> All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">Terms &amp; Conditions</Link>
            <CookieSettingsLink className="transition-colors hover:text-foreground" />
          </div>
        </div>
      </div>
    </footer>
  );
}
