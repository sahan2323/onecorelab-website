import "server-only";
import { db } from "@/db";
import { projects, projectImages, projectTechnologies } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import type { ProjectFormInput } from "@/lib/validators";
import type { ProjectWithRelations } from "@/models";

export async function getPublishedProjects(): Promise<ProjectWithRelations[]> {
  const rows = await db.query.projects.findMany({
    where: eq(projects.published, true),
    orderBy: [desc(projects.featured), asc(projects.displayOrder), desc(projects.year)],
    with: { images: true, technologies: true },
  });
  return rows;
}

export async function getFeaturedProjects(limit = 4): Promise<ProjectWithRelations[]> {
  const rows = await db.query.projects.findMany({
    where: and(eq(projects.published, true), eq(projects.featured, true)),
    orderBy: [asc(projects.displayOrder)],
    with: { images: true, technologies: true },
    limit,
  });
  return rows;
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithRelations | undefined> {
  return db.query.projects.findFirst({
    where: and(eq(projects.slug, slug), eq(projects.published, true)),
    with: { images: true, technologies: true },
  });
}

export async function getAllProjectsForAdmin(): Promise<ProjectWithRelations[]> {
  return db.query.projects.findMany({
    orderBy: [asc(projects.displayOrder), desc(projects.createdAt)],
    with: { images: true, technologies: true },
  });
}

export async function getProjectByIdForAdmin(id: number): Promise<ProjectWithRelations | undefined> {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { images: true, technologies: true },
  });
}

function parseLines(value?: string) {
  return (value ?? "")
    .split(/\r?\n|,/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function createProject(input: ProjectFormInput) {
  const [created] = await db
    .insert(projects)
    .values({
      title: input.title,
      slug: input.slug,
      shortDescription: input.shortDescription,
      fullDescription: input.fullDescription,
      category: input.category,
      client: input.client || null,
      year: input.year,
      coverImage: input.coverImage,
      projectUrl: input.projectUrl || null,
      featured: input.featured,
      published: input.published,
      displayOrder: input.displayOrder,
    })
    .returning({ id: projects.id });

  await syncTechnologiesAndImages(created.id, input);
  return created.id;
}

export async function updateProject(id: number, input: ProjectFormInput) {
  await db
    .update(projects)
    .set({
      title: input.title,
      slug: input.slug,
      shortDescription: input.shortDescription,
      fullDescription: input.fullDescription,
      category: input.category,
      client: input.client || null,
      year: input.year,
      coverImage: input.coverImage,
      projectUrl: input.projectUrl || null,
      featured: input.featured,
      published: input.published,
      displayOrder: input.displayOrder,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  await db.delete(projectTechnologies).where(eq(projectTechnologies.projectId, id));
  await db.delete(projectImages).where(eq(projectImages.projectId, id));
  await syncTechnologiesAndImages(id, input);
}

async function syncTechnologiesAndImages(projectId: number, input: ProjectFormInput) {
  const techs = parseLines(input.technologies);
  if (techs.length) {
    await db.insert(projectTechnologies).values(
      techs.map((name) => ({ projectId, name }))
    );
  }

  const images = parseLines(input.images);
  if (images.length) {
    await db.insert(projectImages).values(
      images.map((url, i) => ({ projectId, url, displayOrder: i }))
    );
  }
}

export async function deleteProject(id: number) {
  await db.delete(projects).where(eq(projects.id, id));
}

export async function setProjectPublished(id: number, published: boolean) {
  await db.update(projects).set({ published, updatedAt: new Date() }).where(eq(projects.id, id));
}

export async function setProjectFeatured(id: number, featured: boolean) {
  await db.update(projects).set({ featured, updatedAt: new Date() }).where(eq(projects.id, id));
}

export async function reorderProject(id: number, displayOrder: number) {
  await db.update(projects).set({ displayOrder, updatedAt: new Date() }).where(eq(projects.id, id));
}
