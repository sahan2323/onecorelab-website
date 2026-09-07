"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { submitContactForm, type ContactActionState } from "./actions";

const PROJECT_TYPES = [
  "Website Development",
  "E-Commerce Store",
  "Mobile App",
  "SaaS Platform",
  "Landing Page",
  "Automation",
  "Other",
];

const BUDGETS = [
  "Less than $5,000",
  "$5,000 - $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000+",
];

const initialState: ContactActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant="primary" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Sending…
        </>
      ) : (
        "Send Message"
      )}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContactForm, initialState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const error = (field: string) => state.fieldErrors?.[field];

  if (state.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-8 py-20 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <h3 className="mt-5 font-display font-semibold tracking-tight text-2xl">Message sent successfully</h3>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Thanks for reaching out — we&rsquo;ve received your message and will
          get back to you within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {/* Honeypot — hidden from real visitors, bots fill it in */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" required />
          {error("firstName") && <p className="text-xs text-destructive">{error("firstName")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" required />
          {error("lastName") && <p className="text-xs text-destructive">{error("lastName")}</p>}
        </div>
      </div>

      <div className="grid gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" required />
          {error("email") && <p className="text-xs text-destructive">{error("email")}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="company">Company (Optional)</Label>
        <Input id="company" name="company" />
      </div>

      <div className="grid gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="projectType">Project Type</Label>
          <Select id="projectType" name="projectType" defaultValue="" required>
            <option value="" disabled>
              Select project type
            </option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget Range</Label>
          <Select id="budget" name="budget" defaultValue="" required>
            <option value="" disabled>
              Select your budget
            </option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Tell Us About Your Project</Label>
        <Textarea id="message" name="message" required rows={5} />
        {error("message") && <p className="text-xs text-destructive">{error("message")}</p>}
      </div>

      <AnimatePresence>
        {state.status === "error" && state.message && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-destructive"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 pt-2">
        <SubmitButton />
        <p className="text-center text-xs text-muted-foreground">
          Your information is secure and will never be shared.
        </p>
      </div>
    </form>
  );
}
