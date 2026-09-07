"use client";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { AdminTable, type AdminTableColumn } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { deleteRecordAction } from "./actions";

type Row = {
  id: number;
  name: string;
  client: string;
  status: string;
  totalIncome: string;
  expenses: string;
  assignedStaff: { name: string } | null;
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  PLANNING: "outline",
  IN_PROGRESS: "warning",
  REVIEW: "warning",
  COMPLETED: "success",
  ON_HOLD: "outline",
  CANCELLED: "destructive",
};

export function RecordsTable({ records }: { records: Row[] }) {
  const { toast } = useToast();

  const columns: AdminTableColumn<Row>[] = [
    {
      key: "name",
      header: "Project",
      render: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.client}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status.replace("_", " ")}</Badge>,
    },
    { key: "staff", header: "Assigned To", render: (r) => r.assignedStaff?.name ?? "Unassigned" },
    {
      key: "profit",
      header: "Net",
      render: (r) => {
        const net = Number(r.totalIncome) - Number(r.expenses);
        return <span className={net >= 0 ? "text-emerald-600" : "text-destructive"}>{formatCurrency(Math.round(net * 100))}</span>;
      },
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="icon" asChild title="Edit">
            <Link href={`/admin/data/${r.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" title="Delete">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title={`Delete "${r.name}"?`}
            description="This permanently removes this internal financial record. This can't be undone."
            onConfirm={async () => {
              await deleteRecordAction(r.id);
              toast({ title: "Record deleted", variant: "success" });
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      rows={records}
      columns={columns}
      searchPlaceholder="Search records…"
      searchFn={(r, q) => r.name.toLowerCase().includes(q) || r.client.toLowerCase().includes(q)}
      emptyMessage="No project records yet."
    />
  );
}
