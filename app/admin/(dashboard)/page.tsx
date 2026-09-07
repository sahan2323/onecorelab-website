import Link from "next/link";
import { FolderKanban, Mail, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { getAllProjectsForAdmin } from "@/services/projects.service";
import { getAllSubmissions } from "@/services/contact.service";
import { getFinancialSummary } from "@/services/records.service";
import { StatCard } from "@/components/admin/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const canViewFinancials = session ? permissions.viewFinancialRecords(session.role) : false;

  const [projects, submissions, financials] = await Promise.all([
    getAllProjectsForAdmin(),
    getAllSubmissions(),
    canViewFinancials ? getFinancialSummary() : Promise.resolve(null),
  ]);

  const published = projects.filter((p) => p.published).length;
  const newSubmissions = submissions.filter((s) => s.status === "NEW").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">
          Welcome back{session ? `, ${session.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&rsquo;s what&rsquo;s happening across oneCoreLab.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={String(projects.length)} icon={FolderKanban} hint={`${published} published`} />
        <StatCard label="New Messages" value={String(newSubmissions)} icon={Mail} hint={`${submissions.length} total`} />
        {financials && (
          <>
            <StatCard label="Net Profit" value={formatCurrency(Math.round(financials.netProfit * 100))} icon={DollarSign} hint="All-time" />
            <StatCard label="Avg. Project Value" value={formatCurrency(Math.round(financials.averageProjectValue * 100))} icon={TrendingUp} hint={`${financials.totalProjects} records`} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Recent Projects</h2>
            <Link href="/admin/projects" className="flex items-center gap-1 text-xs text-royal-600 hover:text-royal-700">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {projects.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <span>{p.title}</span>
                <span className={`text-xs ${p.published ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
              </li>
            ))}
            {projects.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No projects yet.</p>}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Recent Messages</h2>
            <Link href="/admin/submissions" className="flex items-center gap-1 text-xs text-royal-600 hover:text-royal-700">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {submissions.slice(0, 5).map((s) => (
              <li key={s.id} className="py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.firstName} {s.lastName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.message}</p>
              </li>
            ))}
            {submissions.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No messages yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
