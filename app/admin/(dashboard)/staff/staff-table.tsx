"use client";
import Link from "next/link";
import { Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { AdminTable, type AdminTableColumn } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { StaffMember } from "@/models";
import { deleteStaffAction, setStaffActiveAction } from "./actions";

export function StaffTable({ staff, currentUserId }: { staff: StaffMember[]; currentUserId: number }) {
  const { toast } = useToast();

  const columns: AdminTableColumn<StaffMember>[] = [
    {
      key: "name",
      header: "Name",
      render: (s) => (
        <div>
          <p className="font-medium">
            {s.name} {s.id === currentUserId && <span className="text-xs text-muted-foreground">(you)</span>}
          </p>
          <p className="text-xs text-muted-foreground">{s.email}</p>
        </div>
      ),
    },
    { key: "title", header: "Title", render: (s) => s.title ?? "—" },
    {
      key: "role",
      header: "Role",
      render: (s) => <Badge variant={s.role === "SUPER_ADMIN" ? "royal" : "default"}>{s.role.replace("_", " ")}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <Badge variant={s.active ? "success" : "destructive"}>{s.active ? "Active" : "Disabled"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            title={s.active ? "Disable account" : "Enable account"}
            disabled={s.id === currentUserId}
            onClick={async () => {
              await setStaffActiveAction(s.id, !s.active);
              toast({ title: s.active ? "Account disabled" : "Account enabled", variant: "success" });
            }}
          >
            {s.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" asChild title="Edit">
            <Link href={`/admin/staff/${s.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" title="Delete" disabled={s.id === currentUserId}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title={`Remove ${s.name}?`}
            description="This permanently deletes their account. They will lose access immediately."
            onConfirm={async () => {
              await deleteStaffAction(s.id);
              toast({ title: "Staff account removed", variant: "success" });
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      rows={staff}
      columns={columns}
      searchPlaceholder="Search staff…"
      searchFn={(s, q) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)}
      emptyMessage="No staff accounts yet."
    />
  );
}
