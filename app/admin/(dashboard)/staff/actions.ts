"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { staffFormSchema } from "@/lib/validators";
import { createStaff, updateStaff, deleteStaff, setStaffActive } from "@/services/staff.service";

export type StaffActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || !permissions.manageStaff(session.role)) {
    throw new Error("Only Super Admins can manage staff accounts.");
  }
  return session;
}

export async function createStaffAction(
  _prev: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  await requireSuperAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = staffFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }
  if (!parsed.data.password) {
    return { status: "error", message: "A password is required for new accounts.", fieldErrors: { password: "Required" } };
  }

  let id: number;
  try {
    id = await createStaff(parsed.data);
  } catch {
    return { status: "error", message: "A staff account with that email may already exist." };
  }
  revalidatePath("/admin/staff");
  redirect(`/admin/staff/${id}`);
}

export async function updateStaffAction(
  id: number,
  _prev: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  await requireSuperAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = staffFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  await updateStaff(id, parsed.data);
  revalidatePath("/admin/staff");
  return { status: "idle" };
}

export async function deleteStaffAction(id: number) {
  const session = await requireSuperAdmin();
  if (session.userId === id) {
    throw new Error("You can't delete your own account while signed in.");
  }
  await deleteStaff(id);
  revalidatePath("/admin/staff");
}

export async function setStaffActiveAction(id: number, active: boolean) {
  const session = await requireSuperAdmin();
  if (session.userId === id && !active) {
    throw new Error("You can't disable your own account.");
  }
  await setStaffActive(id, active);
  revalidatePath("/admin/staff");
}
