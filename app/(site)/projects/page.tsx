import { HandwritingText } from "@/components/ui/handwriting-text";
import type { Metadata } from "next";
import { getPublishedProjects } from "@/services/projects.service";
import { ProjectsGrid } from "./projects-grid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Quality over quantity — case studies from oneCoreLab's recent work.",
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  const categories = Array.from(new Set(projects.map((p) => p.category)));

  return (
    <div className="pt-32 sm:pt-40">
      <section className="container-lab pb-16 sm:pb-20">
        <p className="eyebrow mb-4">Our Portfolio</p>
        <h1 className="max-w-3xl text-balance font-display font-semibold tracking-tight text-4xl leading-[1.05] sm:text-6xl">
          Projects we&rsquo;re{" "}
          <HandwritingText text="proud of" height="0.88em" duration={1.4} className="text-primary" />.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Quality over quantity — each project represents a commitment to
          excellence and a system built to last.
        </p>
      </section>

      <section className="container-lab pb-24">
        <ProjectsGrid projects={projects} categories={categories} />
      </section>
    </div>
  );
}
