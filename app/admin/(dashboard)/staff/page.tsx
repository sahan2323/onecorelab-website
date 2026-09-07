import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getAllStaff } from "@/services/staff.service";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { StaffTable } from "./staff-table";

export default async function AdminStaffPage() {
  const session = await getSession();
  if (!session || !permissions.manageStaff(session.role)) {
    redirect("/admin");
  }

  const staff = await getAllStaff();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold tracking-tight text-2xl">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage who has access to the admin dashboard and what they can do.
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/staff/new">
            <Plus className="h-4 w-4" /> New Staff Account
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <StaffTable staff={staff} currentUserId={session.userId} />
      </div>
    </div>
  );
}
