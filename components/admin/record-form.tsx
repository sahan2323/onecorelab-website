"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PROJECT_STATUSES, type StaffMember } from "@/models";
import type { RecordActionState } from "@/app/admin/(dashboard)/data/actions";

type Action = (prev: RecordActionState, formData: FormData) => Promise<RecordActionState>;

type RecordWithStaff = {
  id: number;
  name: string;
  client: string;
  category: string;
  status: (typeof PROJECT_STATUSES)[number];
  startDate: Date | null;
  completionDate: Date | null;
  quotedAmount: string;
  totalIncome: string;
  deposit: string;
  remainingAmount: string;
  expenses: string;
  technologies: string | null;
  assignedStaffId: number | null;
  clientContactName: string | null;
  clientContactEmail: string | null;
  clientContactPhone: string | null;
  notes: string | null;
  internalNotes: string | null;
};

function toInputDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

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

export function RecordForm({
  action,
  record,
  staff,
}: {
  action: Action;
  record?: RecordWithStaff;
  staff: StaffMember[];
}) {
  const [state, formAction] = useFormState<RecordActionState, FormData>(action, { status: "idle" });
  const { toast } = useToast();
  const router = useRouter();
  const error = (field: string) => state.fieldErrors?.[field];

  React.useEffect(() => {
    if (state.status === "idle" && record) {
      toast({ title: "Record saved", variant: "success" });
      router.refresh();
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form action={formAction} className="space-y-6">
      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Project Name</Label>
          <Input id="name" name="name" defaultValue={record?.name} required />
          {error("name") && <p className="text-xs text-destructive">{error("name")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client">Client</Label>
          <Input id="client" name="client" defaultValue={record?.client} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue={record?.category} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={record?.status ?? "PLANNING"} required>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assignedStaffId">Assigned Staff</Label>
          <Select id="assignedStaffId" name="assignedStaffId" defaultValue={record?.assignedStaffId ?? ""}>
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={toInputDate(record?.startDate ?? null)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="completionDate">Completion Date</Label>
          <Input id="completionDate" name="completionDate" type="date" defaultValue={toInputDate(record?.completionDate ?? null)} />
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="quotedAmount">Quoted Amount ($)</Label>
          <Input id="quotedAmount" name="quotedAmount" type="number" step="0.01" defaultValue={record?.quotedAmount ?? "0"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deposit">Deposit ($)</Label>
          <Input id="deposit" name="deposit" type="number" step="0.01" defaultValue={record?.deposit ?? "0"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="remainingAmount">Remaining ($)</Label>
          <Input id="remainingAmount" name="remainingAmount" type="number" step="0.01" defaultValue={record?.remainingAmount ?? "0"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="totalIncome">Total Income ($)</Label>
          <Input id="totalIncome" name="totalIncome" type="number" step="0.01" defaultValue={record?.totalIncome ?? "0"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expenses">Expenses ($)</Label>
          <Input id="expenses" name="expenses" type="number" step="0.01" defaultValue={record?.expenses ?? "0"} />
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="clientContactName">Client Contact Name</Label>
          <Input id="clientContactName" name="clientContactName" defaultValue={record?.clientContactName ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientContactEmail">Client Contact Email</Label>
          <Input id="clientContactEmail" name="clientContactEmail" type="email" defaultValue={record?.clientContactEmail ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientContactPhone">Client Contact Phone</Label>
          <Input id="clientContactPhone" name="clientContactPhone" defaultValue={record?.clientContactPhone ?? ""} />
        </div>
        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor="technologies">Technologies</Label>
          <Input id="technologies" name="technologies" defaultValue={record?.technologies ?? ""} />
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={4} defaultValue={record?.notes ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="internalNotes">Internal Notes</Label>
          <Textarea id="internalNotes" name="internalNotes" rows={4} defaultValue={record?.internalNotes ?? ""} />
        </div>
      </section>

      {state.status === "error" && state.message && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton label={record ? "Save Changes" : "Create Record"} />
    </form>
  );
}
