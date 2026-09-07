"use server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { setSubmissionStatus } from "@/services/contact.service";

export async function markSubmissionReadAction(id: number, status: string) {
  const session = await getSession();
  if (!session || !permissions.viewContactSubmissions(session.role)) {
    throw new Error("You don't have permission to manage messages.");
  }
  await setSubmissionStatus(id, status);
  revalidatePath("/admin/submissions");
}
