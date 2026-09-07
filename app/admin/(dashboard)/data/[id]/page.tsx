import { notFound, redirect } from "next/navigation";
import { getRecordById } from "@/services/records.service";
import { getAllStaff } from "@/services/staff.service";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { RecordForm } from "@/components/admin/record-form";
import { updateRecordAction } from "../actions";

export default async function EditRecordPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !permissions.manageFinancialRecords(session.role)) redirect("/admin");

  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const [record, staff] = await Promise.all([getRecordById(id), getAllStaff()]);
  if (!record) notFound();

  const boundAction = updateRecordAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">Edit Project Record</h1>
        <p className="mt-1 text-sm text-muted-foreground">{record.name}</p>
      </div>
      <RecordForm action={boundAction} record={record} staff={staff} />
    </div>
  );
}
