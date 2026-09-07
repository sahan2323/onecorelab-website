import { HandwritingText } from "@/components/ui/handwriting-text";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedProjects } from "@/services/projects.service";
import { Reveal, Parallax, MaskReveal } from "@/components/animations/reveal";

export async function SelectedWork() {
  const projects = await getFeaturedProjects(4);

  if (projects.length === 0) return null;

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="container-lab">
        <div className="mb-16 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">03 / Selected Work</p>
            <h2 className="text-balance font-display font-semibold tracking-tight text-3xl leading-[1.1] sm:text-5xl">
              Case studies, not{" "}
              <HandwritingText text="filler" height="0.9em" className="text-primary" duration={1.2} />.
            </h2>
          </div>
          <Link
            href="/projects"
            className="group hidden shrink-0 items-center gap-1.5 text-sm font-medium text-royal-600 hover:text-royal-700 sm:flex"
          >
            View all projects
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-lab group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="flex flex-col gap-24 sm:gap-32">
          {projects.map((project, i) => (
            <Reveal key={project.id}>
              <Link
                href={`/projects/${project.slug}`}
                className={`group grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* The image sits slightly taller than its frame and drifts
                    within it as you scroll — motion with a purpose (depth),
                    not a decorative float. */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Parallax speed={0.08} className="absolute -inset-y-[8%] inset-x-0">
                    <div className="relative h-full w-full">
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        sizes="(min-width: 768px) 45vw, 90vw"
                        className="object-cover transition-transform duration-700 ease-lab group-hover:scale-[1.04]"
                      />
                    </div>
                  </Parallax>
                </div>

                <div>
                  <p className="eyebrow mb-4">
                    {project.category} — {project.year}
                  </p>
                  <MaskReveal>
                    <h3 className="font-display font-semibold tracking-tight text-2xl sm:text-4xl">
                      {project.title}
                    </h3>
                  </MaskReveal>
                  <p className="mt-4 max-w-md text-muted-foreground">{project.shortDescription}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.technologies.map((t) => (
                      <span
                        key={t.id}
                        className="rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-royal-600">
                    View case study
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 ease-lab group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 flex justify-center sm:hidden">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-royal-600">
            View all projects <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
