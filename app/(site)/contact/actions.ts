"use server";
import { contactFormSchema } from "@/lib/validators";
import { createContactSubmission } from "@/services/contact.service";
import { trackEvent } from "@/services/analytics.service";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function submitContactForm(
  _prev: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  // Honeypot — bots fill every field, including ones hidden from real users.
  if (parsed.data.website) {
    return { status: "success" };
  }

  try {
    await createContactSubmission(parsed.data);
    await trackEvent("contact_submit", "/contact");
    return { status: "success" };
  } catch (err) {
    console.error("Failed to save contact submission", err);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email us directly.",
    };
  }
}
