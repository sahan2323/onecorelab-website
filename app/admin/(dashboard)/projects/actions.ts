"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { projectFormSchema } from "@/lib/validators";
import {
  createProject,
  updateProject,
  deleteProject,
  setProjectPublished,
  setProjectFeatured,
} from "@/services/projects.service";

export type ProjectActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

async function requireProjectPermission() {
  const session = await getSession();
  if (!session || !permissions.manageProjects(session.role)) {
    throw new Error("You don't have permission to manage projects.");
  }
  return session;
}

export async function createProjectAction(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const session = await requireProjectPermission();

  const raw = Object.fromEntries(formData.entries());
  const parsed = projectFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  // Only Admin+ can publish on creation — Staff can create drafts only.
  const published = permissions.publishProjects(session.role) ? parsed.data.published : false;

  const id = await createProject({ ...parsed.data, published });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  redirect(`/admin/projects/${id}`);
}

export async function updateProjectAction(
  id: number,
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const session = await requireProjectPermission();

  const raw = Object.fromEntries(formData.entries());
  const parsed = projectFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const published = permissions.publishProjects(session.role) ? parsed.data.published : undefined;

  await updateProject(id, { ...parsed.data, published: published ?? parsed.data.published });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath(`/projects/${parsed.data.slug}`);
  return { status: "idle" };
}

export async function deleteProjectAction(id: number) {
  const session = await getSession();
  if (!session || !permissions.manageProjects(session.role)) {
    throw new Error("You don't have permission to delete projects.");
  }
  await deleteProject(id);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function togglePublishedAction(id: number, next: boolean) {
  const session = await getSession();
  if (!session || !permissions.publishProjects(session.role)) {
    throw new Error("Only Admins and above can publish or unpublish a project.");
  }
  await setProjectPublished(id, next);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function toggleFeaturedAction(id: number, next: boolean) {
  const session = await getSession();
  if (!session || !permissions.manageProjects(session.role)) {
    throw new Error("You don't have permission to manage projects.");
  }
  await setProjectFeatured(id, next);
  revalidatePath("/admin/projects");
  revalidatePath("/");
}
