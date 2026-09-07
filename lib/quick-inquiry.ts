import { z } from "zod";

/**
 * Deliberately short: name, contact, what they need, optional detail.
 * Anything longer belongs on /contact — this form exists to lower the
 * barrier to a first message, not to qualify a lead.
 */
export const quickInquirySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(200),
  projectType: z.enum([
    "Website",
    "Online Store",
    "Web App / Dashboard",
    "Automation",
    "Not sure yet",
  ]),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export type QuickInquiryInput = z.infer<typeof quickInquirySchema>;

export const QUICK_PROJECT_TYPES = [
  "Website",
  "Online Store",
  "Web App / Dashboard",
  "Automation",
  "Not sure yet",
] as const;
