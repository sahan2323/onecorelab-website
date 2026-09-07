import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { getAllStaff } from "@/services/staff.service";
import { RecordForm } from "@/components/admin/record-form";
import { createRecordAction } from "../actions";

export default async function NewRecordPage() {
  const session = await getSession();
  if (!session || !permissions.manageFinancialRecords(session.role)) redirect("/admin");

  const staff = await getAllStaff();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">New Project Record</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track scope, financials, and internal notes.</p>
      </div>
      <RecordForm action={createRecordAction} staff={staff} />
    </div>
  );
}
