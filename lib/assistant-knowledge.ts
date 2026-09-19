/**
 * Everything the assistant is allowed to say about oneCoreLab.
 *
 * Used two ways:
 *  1. As the system prompt when an LLM key is configured.
 *  2. As a keyword-matched fallback when it isn't — so the widget is useful
 *     out of the box, with no API key, no cost and no external dependency.
 */

export const COMPANY_FACTS = `
oneCoreLab is a small software studio (note the lowercase "one").

WHAT WE BUILD
- Websites: fast, modern business sites that look right on every screen.
- Online stores: simple for customers to buy from, simple for the owner to run.
- Web apps & dashboards: custom internal tools that replace outgrown spreadsheets.
- Automation: connecting tools a business already pays for to remove repeat manual work.
- Mobile-ready builds: everything is built mobile-first.
- Ongoing support: updates, fixes and a real person to ask after launch.

PRICING (indicative — always confirm with a quote)
- Starter: $599 one-time setup, then $50-$100/month. 5-page site, responsive, basic SEO, monthly maintenance, email support.
- Professional: $999 one-time, then $75-$150/month. Unlimited pages, custom design, advanced SEO + CMS, priority support, basic automation, weekly analytics.
- Enterprise: custom pricing. Everything in Professional plus dedicated account manager, 24/7 priority support, custom integrations, advanced automation, SLA.

PROCESS
1. Discover & Plan - understand goals, define success, map a roadmap.
2. Design & Prototype - interactive prototypes before any code ships.
3. Build & Test - clean, typed, tested code built to be maintained.
4. Launch & Grow - smooth deployment, documentation, ongoing support.

TIMELINES
Most new projects start within 1-2 weeks of the initial consultation. Urgent work can often begin in 2-3 business days.

STACK
No fixed house stack; tools are chosen per project. Commonly: TypeScript, React, Next.js, Node.js, Tailwind CSS, PostgreSQL, MongoDB, Prisma, Supabase, Vercel, Docker, Stripe, Zapier, n8n, Figma, Git/GitHub.

CONTACT
- WhatsApp: +1 437 707 8022
- Email: onecorelabs7@gmail.com
- Hours: Mon-Fri, 9AM-6PM EST
- Remote, serving clients globally.
- Free consultation form on the site, and a full contact form at /contact.

COMMON QUESTIONS
- We work with in-house teams, other agencies and freelancers.
- All projects include post-launch support; monthly maintenance plans cover updates, security monitoring, backups and technical support.
- We reply to enquiries within 24 hours, usually sooner.
`.trim();

export const SYSTEM_PROMPT = `You are the assistant on oneCoreLab's website. You help visitors understand what the studio does and guide them toward getting in touch.

Rules:
- Answer only from the facts below. If you don't know, say so plainly and point them to WhatsApp or the contact form. Never invent prices, timelines, clients or capabilities.
- Keep replies short — two or three sentences is usually right. This is a chat bubble, not a document.
- Always write the company name as "oneCoreLab" with a lowercase "one".
- Treat prices as indicative and say a proper quote comes after a short conversation.
- Be warm and direct. No hard selling.
- If someone seems ready to start, point them at the free consultation form or WhatsApp.

FACTS:
${COMPANY_FACTS}`;

/** Suggested openers shown in the empty state. */
export const STARTER_PROMPTS = [
  "What do you build?",
  "How much does a website cost?",
  "How long does a project take?",
  "How do I get a quote?",
];

type Rule = { keywords: string[]; answer: string };

/**
 * Fallback answers for when no LLM key is set. Deliberately conservative —
 * it would rather hand off to a human than guess.
 */
const RULES: Rule[] = [
  {
    keywords: ["price", "pricing", "cost", "how much", "budget", "rate", "quote", "fee", "charge"],
    answer:
      "Pricing depends on scope, but as a guide: Starter is $599 setup + $50–$100/month, Professional is $999 setup + $75–$150/month, and Enterprise is custom. Those are indicative — we give you a firm quote after a short chat. Want to send a quick enquiry?",
  },
  {
    keywords: ["how long", "timeline", "how fast", "when can", "start", "duration", "deadline", "turnaround"],
    answer:
      "Most projects kick off within 1–2 weeks of the first consultation, and urgent work can often start in 2–3 business days. The build itself depends on scope — happy to give you a realistic estimate if you tell me what you need.",
  },
  {
    keywords: ["what do you", "services", "offer", "build", "do you make", "can you"],
    answer:
      "We build websites, online stores, web apps and dashboards, and automations that connect the tools you already use — plus ongoing support after launch. Which of those sounds closest to what you need?",
  },
  {
    keywords: ["contact", "reach", "talk", "call", "email", "whatsapp", "phone", "get in touch"],
    answer:
      "Easiest is WhatsApp on +1 437 707 8022, or email onecorelabs7@gmail.com. There's also a free consultation form on this page — four quick questions and we reply within 24 hours.",
  },
  {
    keywords: ["stack", "technology", "tech", "framework", "language", "react", "next", "wordpress", "shopify"],
    answer:
      "We don't have a fixed house stack — we pick per project. Commonly TypeScript, React/Next.js, Node, Tailwind, and PostgreSQL or Supabase, with Stripe, Zapier or n8n where automation is involved.",
  },
  {
    keywords: ["process", "how do you work", "steps", "workflow"],
    answer:
      "Four steps: discover and plan, design and prototype, build and test, then launch and support. You see interactive prototypes before any code ships, so there are no surprises.",
  },
  {
    keywords: ["support", "maintenance", "after launch", "updates", "fix", "ongoing"],
    answer:
      "Every project includes post-launch support, and monthly maintenance plans cover updates, security monitoring, backups and technical support. We don't disappear after launch.",
  },
  {
    keywords: ["automation", "automate", "zapier", "n8n", "integrate", "integration"],
    answer:
      "Automation is a big part of what we do — connecting the tools you already pay for so the same manual task doesn't get done twice a week. Tell me which tools you're using and I can say whether it's straightforward.",
  },
  {
    keywords: ["store", "ecommerce", "e-commerce", "shop", "sell online", "shopify"],
    answer:
      "Yes — we build online stores that are simple for your customers to buy from and simple for you to run day to day, including payments via Stripe or Shopify.",
  },
  {
    keywords: ["team", "who are you", "about", "agency", "company", "where are you"],
    answer:
      "oneCoreLab is a small software studio working remotely with clients globally, Mon–Fri 9AM–6PM EST. Small team, so you talk to the people actually building your project.",
  },
  {
    keywords: ["hello", "hi ", "hey", "good morning", "good afternoon"],
    answer:
      "Hi! I can help with what oneCoreLab builds, rough pricing, timelines, or getting you a quote. What are you after?",
  },
];

const FALLBACK =
  "I'm not sure about that one — I'd rather point you to a human than guess. Message us on WhatsApp (+1 437 707 8022) or email onecorelabs7@gmail.com and you'll get a real answer within 24 hours.";

/** Cheap keyword match. Scores by how many keywords hit, longest match wins. */
export function answerFromKnowledge(question: string): string {
  const q = question.toLowerCase();
  let best: { score: number; answer: string } | null = null;

  for (const rule of RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (q.includes(kw)) score += kw.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: rule.answer };
    }
  }

  return best ? best.answer : FALLBACK;
}