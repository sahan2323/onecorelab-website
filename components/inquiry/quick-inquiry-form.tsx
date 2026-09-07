"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QUICK_PROJECT_TYPES } from "@/lib/quick-inquiry";
import { submitQuickInquiry, type QuickInquiryState } from "./actions";

const initialState: QuickInquiryState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant="primary" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Sending…
        </>
      ) : (
        <>
          {label} <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function QuickInquiryForm({
  submitLabel = "Request Free Consultation",
  compact = false,
}: {
  submitLabel?: string;
  compact?: boolean;
}) {
  const [state, formAction] = useFormState(submitQuickInquiry, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  const err = (f: string) => state.fieldErrors?.[f];

  if (state.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded px-6 py-12 text-center"
      >
        <CheckCircle2 className="h-9 w-9 text-primary" strokeWidth={1.5} />
        <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">Thanks — message received.</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          We&rsquo;ll get back to you within 24 hours. Need something faster?
          Message us on WhatsApp.
        </p>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={compact ? "space-y-4" : "space-y-5"}>
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="qi-website">Leave empty</label>
        <input id="qi-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="qi-name">Your name</Label>
        <Input id="qi-name" name="name" required placeholder="Jane Smith" />
        {err("name") && <p className="text-xs text-destructive">{err("name")}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="qi-email">Email</Label>
        <Input id="qi-email" name="email" type="email" required placeholder="jane@company.com" />
        {err("email") && <p className="text-xs text-destructive">{err("email")}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="qi-type">What do you need?</Label>
        <Select id="qi-type" name="projectType" defaultValue="" required>
          <option value="" disabled>
            Choose one
          </option>
          {QUICK_PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="qi-message">
          Anything else? <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="qi-message"
          name="message"
          rows={compact ? 3 : 4}
          placeholder="A sentence or two about your project is plenty."
        />
      </div>

      {state.status === "error" && state.message && (
        <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
      )}

      <SubmitButton label={submitLabel} />
      <p className="text-center text-xs text-muted-foreground">
        No obligation. We reply within 24 hours.
      </p>
    </form>
  );
}
