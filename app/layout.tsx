import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.onecorelab.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "oneCoreLab — Intelligent, Scalable Software Engineering",
    template: "%s — oneCoreLab",
  },
  description:
    "oneCoreLab designs and engineers web platforms, automation, and internal tools for companies who've stopped tolerating flaky software.",
  keywords: [
    "oneCoreLab",
    "software agency",
    "web development",
    "automation",
    "dashboards",
    "Next.js development",
  ],
  openGraph: {
    title: "oneCoreLab — Intelligent, Scalable Software Engineering",
    description:
      "We build intelligent, scalable and beautifully engineered digital products.",
    url: SITE_URL,
    siteName: "oneCoreLab",
    type: "website",
    images: [{ url: "/onecorelabWhite.png", width: 1200, height: 300 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "oneCoreLab — Intelligent, Scalable Software Engineering",
    description:
      "We build intelligent, scalable and beautifully engineered digital products.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

/**
 * Root layout — deliberately minimal. It wraps EVERY route, including
 * /admin, so it only holds truly global concerns (html/body shell, theme,
 * toasts). The public chrome (Navbar, Footer, intro sequence, WhatsApp
 * button) lives in app/(site)/layout.tsx instead, so the admin dashboard
 * gets its own separate shell (see components/admin/shell.tsx) without the
 * marketing-site navigation bleeding into it.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
