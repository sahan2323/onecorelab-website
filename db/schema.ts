import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  pgEnum,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "ADMIN", "STAFF"]);
export const projectStatusEnum = pgEnum("project_status", [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
]);

// ── Users / Staff ────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("STAFF"),
  title: varchar("title", { length: 120 }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Public projects (portfolio) ──────────────────────────────────────────
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  client: varchar("client", { length: 160 }),
  year: integer("year").notNull(),
  coverImage: text("cover_image").notNull(),
  projectUrl: text("project_url"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectImages = pgTable("project_images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 200 }),
  displayOrder: integer("display_order").notNull().default(0),
});

export const projectTechnologies = pgTable("project_technologies", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 60 }).notNull(),
});

// ── Internal project records (financials — never exposed publicly) ──────
export const projectRecords = pgTable("project_records", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 160 }).notNull(),
  client: varchar("client", { length: 160 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  status: projectStatusEnum("status").notNull().default("PLANNING"),
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  quotedAmount: numeric("quoted_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  totalIncome: numeric("total_income", { precision: 12, scale: 2 }).notNull().default("0"),
  deposit: numeric("deposit", { precision: 12, scale: 2 }).notNull().default("0"),
  remainingAmount: numeric("remaining_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  expenses: numeric("expenses", { precision: 12, scale: 2 }).notNull().default("0"),
  technologies: text("technologies"),
  assignedStaffId: integer("assigned_staff_id").references(() => users.id, {
    onDelete: "set null",
  }),
  clientContactName: varchar("client_contact_name", { length: 160 }),
  clientContactEmail: varchar("client_contact_email", { length: 200 }),
  clientContactPhone: varchar("client_contact_phone", { length: 40 }),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Contact submissions ───────────────────────────────────────────────────
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  company: varchar("company", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  projectType: varchar("project_type", { length: 80 }).notNull(),
  budget: varchar("budget", { length: 40 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("NEW"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Analytics (lightweight, first-party) ─────────────────────────────────
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 40 }).notNull(), // page_view | project_view | contact_submit
  path: text("path"),
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Relations ─────────────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
  technologies: many(projectTechnologies),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
  project: one(projects, {
    fields: [projectTechnologies.projectId],
    references: [projects.id],
  }),
}));

export const projectRecordsRelations = relations(projectRecords, ({ one }) => ({
  project: one(projects, {
    fields: [projectRecords.projectId],
    references: [projects.id],
  }),
  assignedStaff: one(users, {
    fields: [projectRecords.assignedStaffId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectImage = typeof projectImages.$inferSelect;
export type ProjectTechnology = typeof projectTechnologies.$inferSelect;
export type ProjectRecord = typeof projectRecords.$inferSelect;
export type NewProjectRecord = typeof projectRecords.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
