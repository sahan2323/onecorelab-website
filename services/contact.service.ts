import "server-only";
import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { ContactFormInput } from "@/lib/validators";

/**
 * projectType/budget are widened to plain strings here because two different
 * forms feed this table: the full /contact form and the short quick-inquiry
 * form, which offers a simpler, more client-friendly set of options (and no
 * budget question at all). Both validate their own allowed values with zod
 * before calling in, and the DB columns are varchar.
 */
type CreateSubmissionInput = Omit<ContactFormInput, "website" | "projectType" | "budget"> & {
  projectType: string;
  budget: string;
};

export async function createContactSubmission(input: CreateSubmissionInput) {
  const [created] = await db
    .insert(contactSubmissions)
    .values({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      company: input.company || null,
      phone: input.phone || null,
      projectType: input.projectType,
      budget: input.budget,
      message: input.message,
    })
    .returning({ id: contactSubmissions.id });
  return created.id;
}

export async function getAllSubmissions() {
  return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
}

export async function setSubmissionStatus(id: number, status: string) {
  await db.update(contactSubmissions).set({ status }).where(eq(contactSubmissions.id, id));
}
