"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, LayoutGroup } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectWithRelations } from "@/models";

export function ProjectsGrid({
  projects,
  categories,
}: {
  projects: ProjectWithRelations[];
  categories: string[];
}) {
  const [filter, setFilter] = React.useState<string>("All");
  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-16 text-center text-muted-foreground">
        <p className="font-display font-semibold tracking-tight text-xl">More projects coming soon.</p>
        <p className="mt-2 text-sm">We&rsquo;re currently working on new projects — check back shortly.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              filter === cat
                ? "border-royal-600 bg-royal-600 text-white"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <LayoutGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          {visible.map((project) => (
            <motion.div key={project.id} layout>
              <Link
                href={`/projects/${project.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-surface"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    sizes="(min-width: 640px) 45vw, 90vw"
                    className="object-cover transition-transform duration-700 ease-lab group-hover:scale-[1.05]"
                  />
                </div>
                <div className="p-6">
                  <p className="eyebrow mb-2">
                    {project.category} — {project.year}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display font-semibold tracking-tight text-lg">{project.title}</h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-royal-600" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {project.shortDescription}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}
