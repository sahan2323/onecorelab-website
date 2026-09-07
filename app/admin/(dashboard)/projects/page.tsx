import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProjectsForAdmin } from "@/services/projects.service";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { ProjectsTable } from "./projects-table";

export default async function AdminProjectsPage() {
  const [projects, session] = await Promise.all([getAllProjectsForAdmin(), getSession()]);
  const canPublish = session ? permissions.publishProjects(session.role) : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold tracking-tight text-2xl">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the portfolio shown on the public site.
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4" /> New Project
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <ProjectsTable projects={projects} canPublish={canPublish} />
      </div>
    </div>
  );
}
