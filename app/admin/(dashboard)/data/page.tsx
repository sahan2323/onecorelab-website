import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getAllRecords, getFinancialSummary } from "@/services/records.service";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { formatCurrency } from "@/lib/utils";
import { RecordsTable } from "./records-table";

export default async function AdminDataPage() {
  const session = await getSession();
  if (!session || !permissions.viewFinancialRecords(session.role)) {
    redirect("/admin");
  }

  const [records, summary] = await Promise.all([getAllRecords(), getFinancialSummary()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold tracking-tight text-2xl">Project Data</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal financial records — never exposed on the public site.
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/data/new">
            <Plus className="h-4 w-4" /> New Record
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(Math.round(summary.totalRevenue * 100))} />
        <StatCard label="Total Expenses" value={formatCurrency(Math.round(summary.totalExpenses * 100))} />
        <StatCard label="Net Profit" value={formatCurrency(Math.round(summary.netProfit * 100))} />
        <StatCard label="Active Projects" value={String(summary.active)} hint={`${summary.completed} completed`} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <RecordsTable records={records} />
      </div>
    </div>
  );
}
