import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStaffById } from "@/services/staff.service";
import { AdminShell } from "@/components/admin/shell";

/**
 * This layout only wraps routes inside the (dashboard) route group —
 * /admin, /admin/projects, /admin/staff, etc. /admin/login is a sibling
 * route outside this group, so it never gets wrapped (and never redirects
 * to itself). Middleware also redirects unauthenticated requests before
 * they reach here, but this check runs regardless — a server layout must
 * never rely solely on edge middleware for something this sensitive.
 *
 * The JWT itself is stateless, so we also re-check the account is still
 * active on every load here: if a Super Admin disables someone mid-session,
 * that person is locked out on their very next request rather than staying
 * signed in until an up-to-8-hour-old token happens to expire. Server
 * Components can't clear cookies (only Server Actions/Route Handlers can),
 * so we don't try to delete the stale cookie here — it simply keeps failing
 * this same check on every subsequent request until it expires or the
 * person explicitly logs out.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const current = await getStaffById(session.userId);
  if (!current || !current.active) {
    redirect("/admin/login");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
