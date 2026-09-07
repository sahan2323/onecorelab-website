import { getSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "./change-password-form";

export default async function AdminSettingsPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display font-semibold tracking-tight text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your account details and security.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium">Account</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{session?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{session?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Role</dt>
            <dd>{session?.role.replace("_", " ")}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium">Change Password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
