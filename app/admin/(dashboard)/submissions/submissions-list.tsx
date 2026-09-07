"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Mail, MailOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { markSubmissionReadAction } from "./actions";
import type { ContactSubmission } from "@/models";

export function SubmissionsList({ submissions }: { submissions: ContactSubmission[] }) {
  const [expanded, setExpanded] = React.useState<number | null>(null);

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        No messages yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {submissions.map((s) => {
        const isOpen = expanded === s.id;
        return (
          <div key={s.id}>
            <button
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
              onClick={() => {
                setExpanded(isOpen ? null : s.id);
                if (s.status === "NEW") markSubmissionReadAction(s.id, "READ");
              }}
            >
              {s.status === "NEW" ? (
                <Mail className="h-4 w-4 shrink-0 text-royal-600" />
              ) : (
                <MailOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{s.firstName} {s.lastName}</p>
                  {s.status === "NEW" && <Badge variant="royal">New</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{s.projectType} — {s.budget}</p>
              </div>
              <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">{formatDate(s.createdAt)}</p>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Email:</span> {s.email}</p>
                      {s.phone && <p><span className="text-muted-foreground">Phone:</span> {s.phone}</p>}
                      {s.company && <p><span className="text-muted-foreground">Company:</span> {s.company}</p>}
                    </div>
                    <div className="rounded-lg bg-surface p-4 text-sm sm:col-span-2">{s.message}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
