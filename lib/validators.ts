import { z } from "zod";

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(200),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  projectType: z.enum([
    "Website Development",
    "E-Commerce Store",
    "Mobile App",
    "SaaS Platform",
    "Landing Page",
    "Automation",
    "Other",
  ]),
  budget: z.enum([
    "Less than $5,000",
    "$5,000 - $10,000",
    "$10,000 - $25,000",
    "$25,000 - $50,000",
    "$50,000+",
  ]),
  message: z.string().trim().min(10, "Tell us a little more about the project").max(4000),
  // Honeypot field — real users never fill this in.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const projectFormSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  shortDescription: z.string().trim().min(1).max(280),
  fullDescription: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  client: z.string().trim().max(160).optional().or(z.literal("")),
  year: z.coerce.number().int().min(2000).max(2100),
  coverImage: z.string().trim().min(1),
  projectUrl: z.string().trim().url().optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
  technologies: z.string().trim().optional().or(z.literal("")),
  images: z.string().trim().optional().or(z.literal("")),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

export const staffFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(10, "Use at least 10 characters").max(200).optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF"]),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  active: z.coerce.boolean().default(true),
});

export type StaffFormInput = z.infer<typeof staffFormSchema>;

export const recordFormSchema = z.object({
  name: z.string().trim().min(1).max(160),
  client: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  status: z.enum(["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD", "CANCELLED"]),
  startDate: z.string().optional().or(z.literal("")),
  completionDate: z.string().optional().or(z.literal("")),
  quotedAmount: z.coerce.number().min(0).default(0),
  totalIncome: z.coerce.number().min(0).default(0),
  deposit: z.coerce.number().min(0).default(0),
  remainingAmount: z.coerce.number().min(0).default(0),
  expenses: z.coerce.number().min(0).default(0),
  technologies: z.string().trim().optional().or(z.literal("")),
  assignedStaffId: z.coerce.number().optional(),
  clientContactName: z.string().trim().max(160).optional().or(z.literal("")),
  clientContactEmail: z.string().trim().max(200).optional().or(z.literal("")),
  clientContactPhone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  internalNotes: z.string().trim().optional().or(z.literal("")),
});

export type RecordFormInput = z.infer<typeof recordFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
