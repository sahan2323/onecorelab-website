"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { recordFormSchema } from "@/lib/validators";
import { createRecord, updateRecord, deleteRecord } from "@/services/records.service";

export type RecordActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

async function requireFinancialAccess() {
  const session = await getSession();
  if (!session || !permissions.manageFinancialRecords(session.role)) {
    throw new Error("Only Admins and above can manage financial project records.");
  }
  return session;
}

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return recordFormSchema.safeParse(raw);
}

export async function createRecordAction(
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  await requireFinancialAccess();
  const parsed = parse(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const id = await createRecord(parsed.data);
  revalidatePath("/admin/data");
  redirect(`/admin/data/${id}`);
}

export async function updateRecordAction(
  id: number,
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  await requireFinancialAccess();
  const parsed = parse(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  await updateRecord(id, parsed.data);
  revalidatePath("/admin/data");
  return { status: "idle" };
}

export async function deleteRecordAction(id: number) {
  await requireFinancialAccess();
  await deleteRecord(id);
  revalidatePath("/admin/data");
}
