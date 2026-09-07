"use server";
import { quickInquirySchema } from "@/lib/quick-inquiry";
import { createContactSubmission } from "@/services/contact.service";
import { trackEvent } from "@/services/analytics.service";

export type QuickInquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function submitQuickInquiry(
  _prev: QuickInquiryState,
  formData: FormData
): Promise<QuickInquiryState> {
  const parsed = quickInquirySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  if (parsed.data.website) return { status: "success" }; // bot

  try {
    // Quick inquiries land in the same admin inbox as full contact
    // submissions, with the fields the short form doesn't ask for filled
    // in as "Not specified" so the admin table stays consistent.
    const [firstName, ...rest] = parsed.data.name.split(" ");
    await createContactSubmission({
      firstName,
      lastName: rest.join(" ") || "—",
      email: parsed.data.email,
      company: "",
      phone: "",
      projectType: parsed.data.projectType,
      budget: "Not specified",
      message: parsed.data.message || "(Quick inquiry — no details provided)",
    });
    await trackEvent("contact_submit", "/quick-inquiry");
    return { status: "success" };
  } catch (err) {
    console.error("Quick inquiry failed", err);
    return { status: "error", message: "Something went wrong. Please email or WhatsApp us instead." };
  }
}
