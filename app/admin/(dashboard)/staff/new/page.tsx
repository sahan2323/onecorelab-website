import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { StaffForm } from "@/components/admin/staff-form";
import { createStaffAction } from "../actions";

export default async function NewStaffPage() {
  const session = await getSession();
  if (!session || !permissions.manageStaff(session.role)) redirect("/admin");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">New Staff Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create sign-in access for a team member.</p>
      </div>
      <StaffForm action={createStaffAction} currentUserId={session.userId} />
    </div>
  );
}
