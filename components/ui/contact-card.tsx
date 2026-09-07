// Adapted from a 21st.dev "Contact Card" reference component. Structure
// kept faithful: a single bordered card, corner "+" marks, info grid on the
// left and a form slot on the right with a subtle fill + divider. The
// corner marks read as a small technical/lab detail that fits the brand
// rather than pure decoration. Our real ContactForm (with its own
// validation and server action) is passed in as children — this component
// only owns the shell and the info-list styling.
import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContactInfoItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function ContactCard({
  title,
  description,
  contactInfo,
  children,
  className,
}: {
  title: string;
  description: string;
  contactInfo: ContactInfoItem[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative grid rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-5", className)}>
      <Plus className="pointer-events-none absolute -left-3 -top-3 h-6 w-6 text-border" strokeWidth={1.5} />
      <Plus className="pointer-events-none absolute -right-3 -top-3 h-6 w-6 text-border" strokeWidth={1.5} />
      <Plus className="pointer-events-none absolute -bottom-3 -left-3 h-6 w-6 text-border" strokeWidth={1.5} />
      <Plus className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 text-border" strokeWidth={1.5} />

      <div className="flex flex-col justify-between lg:col-span-3">
        <div className="space-y-6 p-8 md:p-10">
          <div>
            <h2 className="font-display font-semibold tracking-tight text-2xl">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {contactInfo.map((info) => (
              <div key={info.label} className={cn("flex items-start gap-3", info.className)}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface">
                  <info.icon className="h-4 w-4 text-royal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{info.label}</p>
                  <div className="text-xs text-muted-foreground">{info.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center border-t border-border bg-surface/50 p-6 md:p-8 lg:col-span-2 lg:border-l lg:border-t-0">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
