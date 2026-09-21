import { notFound } from "next/navigation";
import { getProjectByIdForAdmin } from "@/services/projects.service";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { ProjectForm } from "@/components/admin/project-form";
import { updateProjectAction } from "../actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (Number.isNaN(id)) notFound();

  const [project, session] = await Promise.all([getProjectByIdForAdmin(id), getSession()]);
  if (!project) notFound();

  const canPublish = session ? permissions.publishProjects(session.role) : false;
  const boundAction = updateProjectAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">Edit Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">{project.title}</p>
      </div>
      <ProjectForm action={boundAction} project={project} canPublish={canPublish} />
    </div>
  );
}