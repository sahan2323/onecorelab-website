"use server";
import { redirect } from "next/navigation";
import { loginFormSchema } from "@/lib/validators";
import { getUserByEmailWithPassword } from "@/services/staff.service";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";

export type LoginActionState = {
  status: "idle" | "error";
  message?: string;
};

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email and password." };
  }

  const user = await getUserByEmailWithPassword(parsed.data.email);
  if (!user || !user.active) {
    return { status: "error", message: "Invalid credentials or this account has been disabled." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { status: "error", message: "Invalid credentials or this account has been disabled." };
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const redirectTo = (formData.get("from") as string) || "/admin";
  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}

export async function logoutAction() {
  clearSessionCookie();
  redirect("/admin/login");
}
