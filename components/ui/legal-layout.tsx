import type { ReactNode } from "react";

/** Shared shell for Privacy / Terms so both stay on the design system. */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="pt-32 sm:pt-40">
      <section className="container-lab pb-12">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {updated}</p>
      </section>

      <section className="container-lab pb-24">
        <div className="max-w-3xl space-y-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-muted-foreground [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
      </section>
    </div>
  );
}
