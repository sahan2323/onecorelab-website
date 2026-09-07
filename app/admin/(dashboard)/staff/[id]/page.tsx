import { notFound, redirect } from "next/navigation";
import { getStaffById } from "@/services/staff.service";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { StaffForm } from "@/components/admin/staff-form";
import { updateStaffAction } from "../actions";

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !permissions.manageStaff(session.role)) redirect("/admin");

  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const staff = await getStaffById(id);
  if (!staff) notFound();

  const boundAction = updateStaffAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">Edit Staff Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">{staff.name}</p>
      </div>
      <StaffForm action={boundAction} staff={staff} currentUserId={session.userId} />
    </div>
  );
}
