import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { getProjectBySlug, getPublishedProjects } from "@/services/projects.service";
import { trackEvent } from "@/services/analytics.service";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/reveal";

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: [{ url: project.coverImage }],
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  await trackEvent("project_view", `/projects/${project.slug}`, project.id);

  return (
    <article className="pt-32 sm:pt-40">
      <div className="container-lab">
        <Link
          href="/projects"
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All Projects
        </Link>

        <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="eyebrow mb-4">
              {project.category} — {project.year}
              {project.client ? ` — ${project.client}` : ""}
            </p>
            <h1 className="max-w-3xl text-balance font-display font-semibold tracking-tight text-4xl leading-[1.05] sm:text-6xl">
              {project.title}
            </h1>
          </div>
          {project.projectUrl && (
            <Button asChild variant="outline" size="lg">
              <a href={project.projectUrl} target="_blank" rel="noreferrer">
                Visit Live Site <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{project.shortDescription}</p>
      </div>

      <div className="container-lab mt-14">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image src={project.coverImage} alt={project.title} fill sizes="90vw" className="object-cover" priority />
        </div>
      </div>

      <div className="container-lab mt-16 grid gap-14 pb-28 lg:grid-cols-[1fr_320px]">
        <Reveal className="prose prose-neutral max-w-none dark:prose-invert">
          <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {project.fullDescription}
          </p>
        </Reveal>

        <div className="space-y-8">
          {project.technologies.length > 0 && (
            <div>
              <p className="eyebrow mb-3">Technologies</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <span key={t.id} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.images.length > 1 && (
            <div>
              <p className="eyebrow mb-3">Gallery</p>
              <div className="grid grid-cols-2 gap-2">
                {project.images.slice(1).map((img) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <Image src={img.url} alt={img.alt ?? project.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="font-display font-semibold tracking-tight text-lg">Have a similar project in mind?</p>
            <Button asChild variant="primary" className="mt-4 w-full">
              <Link href="/contact">
                Start a Project <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
