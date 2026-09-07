/**
 * Public-facing domain types. These stay decoupled from the Drizzle schema
 * so pages/components never import db/schema.ts directly — only the
 * services layer talks to the database.
 */
import type {
  Project as DbProject,
  ProjectImage,
  ProjectTechnology,
  ProjectRecord as DbProjectRecord,
  User as DbUser,
  ContactSubmission as DbContactSubmission,
} from "@/db/schema";

export type ProjectWithRelations = DbProject & {
  images: ProjectImage[];
  technologies: ProjectTechnology[];
};

export type Project = DbProject;
export type ProjectRecord = DbProjectRecord;
export type ContactSubmission = DbContactSubmission;

export type StaffMember = Omit<DbUser, "passwordHash">;

export const PROJECT_CATEGORIES = [
  "Web Development",
  "Product / Web App",
  "Automation",
  "Dashboards",
  "Mobile",
  "Landing Page",
] as const;

export const PROJECT_STATUSES = [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
] as const;

export const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "STAFF"] as const;
