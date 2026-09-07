import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { ProjectForm } from "@/components/admin/project-form";
import { createProjectAction } from "../actions";

export default async function NewProjectPage() {
  const session = await getSession();
  const canPublish = session ? permissions.publishProjects(session.role) : false;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">New Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a new project to the portfolio.</p>
      </div>
      <ProjectForm action={createProjectAction} canPublish={canPublish} />
    </div>
  );
}
