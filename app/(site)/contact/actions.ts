"use server";
import { contactFormSchema } from "@/lib/validators";
import { createContactSubmission } from "@/services/contact.service";
import { trackEvent } from "@/services/analytics.service";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};
import { sendEmail } from "@/services/email.service";

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

    // Send thank you email to user
    await sendEmail({
      to: parsed.data.email,
      subject: "Thank You for Contacting OneCoreLabs!",
      text: `Hi ${parsed.data.firstName},\n\nThank you for reaching out to us. We have received your message and will get back to you soon.\n\nBest regards,\nThe OneCoreLabs Team`,
    });

    // Send notification email to admin
    await sendEmail({
      to: "onecorelabs7@gmail.com",
      subject: "New Contact Form Submission",
      text: `New contact form submission received:\n\nName: ${parsed.data.firstName} ${parsed.data.lastName}\nEmail: ${parsed.data.email}\nCompany: ${parsed.data.company || "N/A"}\nPhone: ${parsed.data.phone || "N/A"}\nProject Type: ${parsed.data.projectType}\nBudget: ${parsed.data.budget}\nMessage:\n${parsed.data.message}`,
    });

    return { status: "success" };
  } catch (err) {
    console.error("Failed to save contact submission", err);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email us directly.",
    };
  }
}
