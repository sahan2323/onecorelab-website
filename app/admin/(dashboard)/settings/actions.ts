"use server";
import { getSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getUserByEmailWithPassword, updateStaff } from "@/services/staff.service";
import { z } from "zod";

export type SettingsActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(10, "Use at least 10 characters"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await getSession();
  if (!session) {
    return { status: "error", message: "Your session has expired. Please sign in again." };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check your input." };
  }

  const user = await getUserByEmailWithPassword(session.email);
  if (!user) {
    return { status: "error", message: "Account not found." };
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { status: "error", message: "Current password is incorrect." };
  }

  await updateStaff(user.id, {
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title ?? "",
    active: user.active,
    password: parsed.data.newPassword,
  });

  return { status: "success", message: "Password updated." };
}
