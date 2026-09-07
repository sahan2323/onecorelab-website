import "server-only";
import { db } from "@/db";
import { analyticsEvents, projects } from "@/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";

export async function trackEvent(type: string, path?: string, projectId?: number) {
  try {
    await db.insert(analyticsEvents).values({ type, path, projectId: projectId ?? null });
  } catch {
    // Analytics should never break the request that triggered it.
  }
}

export async function getAnalyticsSummary() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const rows = await db
    .select()
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, since))
    .orderBy(desc(analyticsEvents.createdAt));

  const pageViews = rows.filter((r) => r.type === "page_view").length;
  const projectViews = rows.filter((r) => r.type === "project_view").length;
  const contactSubmits = rows.filter((r) => r.type === "contact_submit").length;

  const byDay = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      const key = r.createdAt.toISOString().slice(0, 10);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }));

  const popularProjectsRaw = await db
    .select({
      projectId: analyticsEvents.projectId,
      title: projects.title,
      views: sql<number>`count(*)`.as("views"),
    })
    .from(analyticsEvents)
    .leftJoin(projects, eq(analyticsEvents.projectId, projects.id))
    .where(eq(analyticsEvents.type, "project_view"))
    .groupBy(analyticsEvents.projectId, projects.title)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  return {
    pageViews,
    projectViews,
    contactSubmits,
    byDay,
    popularProjects: popularProjectsRaw.filter((p) => p.projectId !== null),
  };
}
