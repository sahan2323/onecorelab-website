"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PasswordStrength } from "@/components/ui/password-strength";
import { STAFF_ROLES, type StaffMember } from "@/models";
import type { StaffActionState } from "@/app/admin/(dashboard)/staff/actions";

type Action = (prev: StaffActionState, formData: FormData) => Promise<StaffActionState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Saving…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

export function StaffForm({
  action,
  staff,
  currentUserId,
}: {
  action: Action;
  staff?: StaffMember;
  currentUserId: number;
}) {
  const [state, formAction] = useFormState<StaffActionState, FormData>(action, { status: "idle" });
  const [password, setPassword] = React.useState("");
  const { toast } = useToast();
  const router = useRouter();
  const isSelf = staff?.id === currentUserId;
  const error = (field: string) => state.fieldErrors?.[field];

  React.useEffect(() => {
    if (state.status === "idle" && staff) {
      toast({ title: "Staff account saved", variant: "success" });
      router.refresh();
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-6">
      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={staff?.name} required />
          {error("name") && <p className="text-xs text-destructive">{error("name")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={staff?.email} required />
          {error("email") && <p className="text-xs text-destructive">{error("email")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={staff?.title ?? ""} placeholder="e.g. Lead Engineer" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Select id="role" name="role" defaultValue={staff?.role ?? "STAFF"} disabled={isSelf} required>
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>{r.replace("_", " ")}</option>
            ))}
          </Select>
          {isSelf && <p className="text-xs text-muted-foreground">You can't change your own role.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <Label htmlFor="password">{staff ? "Reset Password (optional)" : "Password"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          className="mt-1.5"
          placeholder={staff ? "Leave blank to keep current password" : ""}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!staff}
          autoComplete="new-password"
        />
        {error("password") && <p className="mt-1 text-xs text-destructive">{error("password")}</p>}
        <PasswordStrength value={password} className="mt-4" />
      </section>

      <section className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6">
        <label className={`flex items-center gap-2 text-sm ${isSelf ? "opacity-50" : ""}`}>
          <Checkbox name="active" defaultChecked={staff?.active ?? true} disabled={isSelf} />
          Account active
        </label>
        {isSelf && <p className="text-xs text-muted-foreground">You can't disable your own account.</p>}
      </section>

      {state.status === "error" && state.message && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton label={staff ? "Save Changes" : "Create Staff Account"} />
    </form>
  );
}
