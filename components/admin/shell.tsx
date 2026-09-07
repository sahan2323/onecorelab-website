"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Database,
  BarChart3,
  Settings,
  Mail,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { OneCoreLabLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth/session";
import { logoutAction } from "@/app/admin/login/actions";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  minRole?: "ADMIN" | "SUPER_ADMIN";
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/submissions", label: "Messages", icon: Mail },
  { href: "/admin/data", label: "Project Data", icon: Database, minRole: "ADMIN" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, minRole: "ADMIN" },
  { href: "/admin/staff", label: "Staff", icon: Users, minRole: "SUPER_ADMIN" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const RANK = { STAFF: 0, ADMIN: 1, SUPER_ADMIN: 2 };

export function AdminShell({
  session,
  children,
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const visibleNav = NAV.filter((item) => !item.minRole || RANK[session.role] >= RANK[item.minRole]);
  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const activeLabel = visibleNav.find((n) => n.href === pathname)?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-surface font-sans text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-24 items-center border-b border-border px-6">
          <OneCoreLabLogo height={40} />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-royal-600/10 text-royal-600 dark:text-royal-400"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View public site
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <div>
            <p className="text-xs text-muted-foreground">Admin / {activeLabel}</p>
            <p className="text-sm font-medium">{activeLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-royal-600 text-xs font-semibold text-white">
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {session.name}
                  <p className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                    {session.email} — {session.role.replace("_", " ")}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logoutAction}>
                  <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                    <LogOut className="h-3.5 w-3.5" /> Log out
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
