import "dotenv/config";
import { db } from "./index";
import { users, projects, projectImages, projectTechnologies, projectRecords } from "./schema";
import { hashPassword } from "../lib/auth/password";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding oneCoreLab database…");

  // ── Super admin ──────────────────────────────────────────────────────
  const email = (process.env.SEED_SUPER_ADMIN_EMAIL ?? "founder@onecorelab.com").toLowerCase();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "ChangeThisPassword123!";

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!existing) {
    await db.insert(users).values({
      name: "oneCoreLab Founder",
      email,
      passwordHash: await hashPassword(password),
      role: "SUPER_ADMIN",
      title: "Founder",
      active: true,
    });
    console.log(`Created super admin: ${email} / ${password}`);
  } else {
    console.log(`Super admin ${email} already exists, skipping.`);
  }

  // ── Real portfolio pulled from the live onecorelab.com/projects page ──
  const seedProjects = [
    {
      title: "Maple Ceylon Media",
      slug: "maple-ceylon-media",
      shortDescription:
        "A Toronto-based media platform with a cinematic hero carousel, live YouTube and TikTok integration, and interactive maps.",
      fullDescription:
        "Maple Ceylon Media needed a home base that felt as dynamic as the content it publishes. We built a cinematic hero carousel, wired up live YouTube and TikTok feeds so new episodes surface automatically, and layered in an interactive Google Maps experience for location-based stories.",
      category: "Web Development",
      client: "Maple Ceylon Media",
      year: 2025,
      coverImage:
        "/projects/maple.png",
      projectUrl: "https://www.maple-ceylon.com/",
      featured: true,
      published: true,
      displayOrder: 0,
      technologies: ["React", "Framer Motion", "YouTube API", "TikTok API", "Google Maps"],
    },
    {
      title: "Buwana Tours",
      slug: "buwana-tours",
      shortDescription:
        "A modern site for a transport and tours company, built to showcase services and make booking effortless.",
      fullDescription:
        "Buwana Tours run a transport and travel business that lives or dies on trust and clarity. We designed a responsive marketing site that lays out every service plainly, keeps SEO fundamentals tight, and makes it easy for a prospective customer to reach out and book.",
      category: "Web Development",
      client: "Buwana Tours",
      year: 2025,
      coverImage:
        "/projects/buwana.png",
      projectUrl: "https://www.buwanatours.com/",
      featured: true,
      published: true,
      displayOrder: 1,
      technologies: ["Next.js", "Responsive Design", "SEO"],
    },
    {
      title: "Track My Habits",
      slug: "track-my-habits",
      shortDescription:
        "A clean habit-tracking web app that helps people build routines, stay consistent, and see their progress.",
      fullDescription:
        "Track My Habits is a focused product build: a dashboard-driven habit tracker with streaks, progress visualization, and a UI built to keep daily check-ins fast and frictionless.",
      category: "Product / Web App",
      client: "Internal Product",
      year: 2025,
      coverImage:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1600&auto=format&fit=crop",
      projectUrl: "https://track-my-habits-web-322.vercel.app/",
      featured: true,
      published: true,
      displayOrder: 2,
      technologies: ["React", "Dashboard UI", "Data Visualization"],
    },
    {
      title: "Event Buddy",
      slug: "event-buddy",
      shortDescription:
        "A sample event ticketing platform covering discovery, seat/ticket selection, and a smooth checkout flow.",
      fullDescription:
        "Event Buddy demonstrates a full ticketing journey — browsing events, selecting tickets, and checking out — built as a reference implementation for clients evaluating a ticketing product of their own.",
      category: "Product / Web App",
      client: "Internal Product",
      year: 2025,
      coverImage:
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1600&auto=format&fit=crop",
      projectUrl: "https://event-buddy-ticketing-platform-t53j-seven.vercel.app/",
      featured: false,
      published: true,
      displayOrder: 3,
      technologies: ["React", "Events", "Checkout Flow"],
    },
  ] as const;

  for (const p of seedProjects) {
    const found = await db.query.projects.findFirst({ where: eq(projects.slug, p.slug) });
    if (found) {
      console.log(`Project "${p.title}" already exists, skipping.`);
      continue;
    }
    const [created] = await db
      .insert(projects)
      .values({
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        fullDescription: p.fullDescription,
        category: p.category,
        client: p.client,
        year: p.year,
        coverImage: p.coverImage,
        projectUrl: p.projectUrl,
        featured: p.featured,
        published: p.published,
        displayOrder: p.displayOrder,
      })
      .returning({ id: projects.id });

    await db.insert(projectImages).values({
      projectId: created.id,
      url: p.coverImage,
      alt: p.title,
      displayOrder: 0,
    });
    await db.insert(projectTechnologies).values(
      p.technologies.map((name) => ({ projectId: created.id, name }))
    );
    console.log(`Created project "${p.title}"`);
  }

  // ── One internal financial record so the admin dashboard isn't empty ──
  const anyRecord = await db.select().from(projectRecords).limit(1);
  if (anyRecord.length === 0) {
    const mapleCeylon = await db.query.projects.findFirst({ where: eq(projects.slug, "maple-ceylon-media") });
    await db.insert(projectRecords).values({
      projectId: mapleCeylon?.id ?? null,
      name: "Maple Ceylon Media — Platform Rebuild",
      client: "Maple Ceylon Media",
      category: "Web Development",
      status: "COMPLETED",
      startDate: new Date("2025-02-01"),
      completionDate: new Date("2025-04-15"),
      quotedAmount: "9800.00",
      totalIncome: "9800.00",
      deposit: "3000.00",
      remainingAmount: "0.00",
      expenses: "1450.00",
      technologies: "React, Framer Motion, YouTube API, TikTok API",
      clientContactName: "Priya Fernando",
      clientContactEmail: "priya@mapleceylonmedia.com",
      notes: "Launched on schedule. Client opted into the maintenance retainer.",
      internalNotes: "Great reference case — ask for a testimonial next quarter.",
    });
    console.log("Created one sample internal project record.");
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
