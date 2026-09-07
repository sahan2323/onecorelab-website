import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/rbac";
import { getAllSubmissions } from "@/services/contact.service";
import { SubmissionsList } from "./submissions-list";

export default async function AdminSubmissionsPage() {
  const session = await getSession();
  if (!session || !permissions.viewContactSubmissions(session.role)) {
    redirect("/admin");
  }

  const submissions = await getAllSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Submissions from the public contact form.</p>
      </div>
      <SubmissionsList submissions={submissions} />
    </div>
  );
}
