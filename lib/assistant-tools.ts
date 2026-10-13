import "server-only";
import { Type, type FunctionDeclaration } from "@google/genai";
import { quickInquirySchema, QUICK_PROJECT_TYPES } from "@/lib/quick-inquiry";
import { getProjectBySlug, getPublishedProjects } from "@/services/projects.service";
import { createContactSubmission } from "@/services/contact.service";
import { trackEvent } from "@/services/analytics.service";
import { sendEmail } from "@/services/email.service";

/**
 * Tools Onycore can call. This is what turns the chat from a Q&A bot into an
 * agent: it can look up the live portfolio and file an enquiry on the
 * visitor's behalf instead of only pointing them at a form.
 *
 * Every tool only touches public data or does what the public quick-inquiry
 * form already allows — nothing here can read submissions, records or staff.
 */

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "list_projects",
    description:
      "List oneCoreLab's published portfolio projects. Use when the visitor asks about past work, examples, case studies or clients.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          description: "Optional category to filter by, e.g. 'E-Commerce'. Omit to list everything.",
        },
      },
    },
  },
  {
    name: "get_project",
    description: "Get the full write-up of one portfolio project by its slug (from list_projects).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        slug: { type: Type.STRING, description: "The project slug." },
      },
      required: ["slug"],
    },
  },
  {
    name: "open_page",
    description:
      "Take the visitor to a page on this website — their browser navigates there while the chat stays open. Use it whenever they want to see something: past work → /projects, one project → /projects/<slug>, services → /services, about → /about, contact form → /contact, home → /.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        path: {
          type: Type.STRING,
          description: "Site path, e.g. /projects or /projects/buwana-tours.",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "submit_inquiry",
    description:
      "Send the visitor's project enquiry to the oneCoreLab team and email them a confirmation. Only call this after the visitor has given their name and email AND explicitly confirmed they want it sent.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Visitor's full name." },
        email: { type: Type.STRING, description: "Visitor's email address." },
        projectType: {
          type: Type.STRING,
          enum: [...QUICK_PROJECT_TYPES],
          description: "Closest match to what they want built.",
        },
        message: {
          type: Type.STRING,
          description: "A short summary of what they need, written from the conversation.",
        },
      },
      required: ["name", "email", "projectType", "message"],
    },
  },
];

/**
 * Shown in the chat as a small "did something" chip. `navigate` tells the
 * widget to send the browser to that path.
 */
export type ToolAction = { label: string; navigate?: string };

/** Pages open_page may send visitors to, besides individual projects. */
const SITE_PAGES: Record<string, string> = {
  "/": "Home",
  "/projects": "Projects",
  "/services": "Services",
  "/about": "About",
  "/contact": "Contact",
};

export type ToolContext = {
  /** Used to rate-limit enquiries per visitor. */
  clientId: string;
};

export type ToolResult = {
  response: Record<string, unknown>;
  action?: ToolAction;
};

// Best-effort, per-instance limit so the chat can't be used to flood the
// inbox. Same idea as the forms' honeypot: cheap, not bulletproof.
const INQUIRY_LIMIT = 2;
const INQUIRY_WINDOW_MS = 60 * 60 * 1000;
const inquiryLog = new Map<string, number[]>();

function underInquiryLimit(clientId: string) {
  const now = Date.now();
  const recent = (inquiryLog.get(clientId) ?? []).filter((t) => now - t < INQUIRY_WINDOW_MS);
  inquiryLog.set(clientId, recent);
  return recent.length < INQUIRY_LIMIT;
}

export async function runTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  switch (name) {
    case "list_projects": {
      const category = typeof args.category === "string" ? args.category.toLowerCase() : "";
      const projects = (await getPublishedProjects()).filter(
        (p) => !category || p.category.toLowerCase().includes(category)
      );
      return {
        response: {
          projects: projects.map((p) => ({
            title: p.title,
            slug: p.slug,
            category: p.category,
            year: p.year,
            summary: p.shortDescription,
            technologies: p.technologies.map((t) => t.name),
            page: `/projects/${p.slug}`,
          })),
        },
      };
    }

    case "get_project": {
      const project = await getProjectBySlug(String(args.slug ?? ""));
      if (!project) return { response: { error: "No published project with that slug." } };
      return {
        response: {
          title: project.title,
          category: project.category,
          client: project.client,
          year: project.year,
          description: project.fullDescription,
          technologies: project.technologies.map((t) => t.name),
          liveUrl: project.projectUrl,
          page: `/projects/${project.slug}`,
        },
      };
    }

    case "open_page": {
      const path = String(args.path ?? "").trim().replace(/\/+$/, "") || "/";
      if (SITE_PAGES[path]) {
        return {
          response: { ok: true, opened: path },
          action: { label: `Opened ${SITE_PAGES[path]}`, navigate: path },
        };
      }
      // Only real, published projects — never an arbitrary URL.
      const slug = path.match(/^\/projects\/([a-z0-9-]+)$/)?.[1];
      const project = slug ? await getProjectBySlug(slug) : undefined;
      if (project) {
        return {
          response: { ok: true, opened: path },
          action: { label: `Opened ${project.title}`, navigate: path },
        };
      }
      return {
        response: { error: `Not a page on this site. Valid: ${Object.keys(SITE_PAGES).join(", ")} or /projects/<slug>.` },
      };
    }

    case "submit_inquiry": {
      const parsed = quickInquirySchema.safeParse(args);
      if (!parsed.success) {
        return {
          response: {
            error: "Invalid details",
            issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
          },
        };
      }
      if (!underInquiryLimit(ctx.clientId)) {
        return {
          response: {
            error: "An enquiry was already sent from this chat recently. Tell the visitor the team has it and will reply within 24 hours.",
          },
        };
      }

      const { name: fullName, email, projectType, message } = parsed.data;
      const [firstName, ...rest] = fullName.split(" ");
      await createContactSubmission({
        firstName,
        lastName: rest.join(" ") || "—",
        email,
        company: "",
        phone: "",
        projectType,
        budget: "Not specified",
        message: `[Via Onycore chat] ${message || "(no details)"}`,
      });
      inquiryLog.get(ctx.clientId)?.push(Date.now());
      await trackEvent("contact_submit", "/chat");

      // The submission is saved; email is a courtesy, so don't fail on it.
      try {
        await sendEmail({
          to: email,
          subject: "Thank You for Contacting oneCoreLab!",
          text: `Hi ${firstName},\n\nThanks for chatting with Onycore. We've received your enquiry and will get back to you within 24 hours.\n\nWhat you told us:\n${message}\n\nBest regards,\nThe oneCoreLab Team`,
        });
        await sendEmail({
          to: "onecorelabs7@gmail.com",
          subject: "New enquiry via Onycore chat",
          text: `New enquiry from the website chat:\n\nName: ${fullName}\nEmail: ${email}\nProject Type: ${projectType}\nMessage:\n${message}`,
        });
      } catch (err) {
        console.error("Onycore inquiry email failed", err);
      }

      return {
        response: { ok: true, note: "Saved. The team replies within 24 hours." },
        action: { label: "Enquiry sent to the team" },
      };
    }

    default:
      return { response: { error: `Unknown tool: ${name}` } };
  }
}
