import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { getAnalyticsSummary } from "@/services/analytics.service";
import { getFinancialSummary } from "@/services/records.service";
import { StatCard } from "@/components/admin/stat-card";
import { Eye, FolderKanban, Mail } from "lucide-react";
import { TrafficChart, RevenueChart, CategoryChart } from "./analytics-charts";

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session || !permissions.viewAnalytics(session.role)) {
    redirect("/admin");
  }

  const [analytics, financials] = await Promise.all([getAnalyticsSummary(), getFinancialSummary()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last 30 days of first-party site activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Page Views" value={String(analytics.pageViews)} icon={Eye} />
        <StatCard label="Project Views" value={String(analytics.projectViews)} icon={FolderKanban} />
        <StatCard label="Contact Submissions" value={String(analytics.contactSubmits)} icon={Mail} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-medium">Traffic Over Time</h2>
          <TrafficChart data={analytics.byDay} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-medium">Revenue vs. Expenses</h2>
          <RevenueChart data={financials.revenueByMonth} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-medium">Projects by Category</h2>
          <CategoryChart data={financials.byCategory} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-medium">Most Viewed Projects</h2>
          {analytics.popularProjects.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
              No project views recorded yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {analytics.popularProjects.map((p) => (
                <li key={p.projectId} className="flex items-center justify-between text-sm">
                  <span>{p.title ?? "Untitled"}</span>
                  <span className="font-medium">{p.views} views</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
