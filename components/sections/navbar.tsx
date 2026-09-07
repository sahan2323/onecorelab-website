"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowUpRight, Lock } from "lucide-react";
import { OneCoreLabLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <motion.div
        animate={{
          width: scrolled ? "min(880px, 100%)" : "100%",
          maxWidth: scrolled ? "880px" : "1440px",
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "flex w-full items-center justify-between rounded-full px-3 py-2 transition-colors duration-500 sm:px-4",
          scrolled
            ? // Same reasoning as the contact bar: this is fixed and on screen
              // the whole time, so a backdrop blur costs a full re-sample of
              // the page behind it every scroll frame. Solid on touch.
              "border border-border bg-background shadow-lg shadow-black/[0.03] md:bg-background/70 md:backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        )}
      >
        <Link href="/" className="flex items-center pl-2" aria-label="oneCoreLab home">
          <OneCoreLabLogo height={34} priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-foreground/[0.06]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 pr-1">
          <Link
            href="/admin/login"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <Lock className="h-3.5 w-3.5" /> Sign In
          </Link>
          <ThemeToggle className="hidden sm:flex" />
          <Button asChild size="sm" variant="primary" className="hidden sm:inline-flex">
            <Link href="/contact">
              Start a Project <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="absolute left-4 right-4 top-[72px] rounded-2xl border border-border bg-background p-4 shadow-2xl lg:hidden"
          >
            <nav className="flex flex-col">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/90 hover:bg-foreground/[0.05]"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin/login"
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <Lock className="h-4 w-4" /> Sign In
              </Link>
              <div className="mt-2 flex items-center justify-between px-3">
                <ThemeToggle />
                <Button asChild size="sm" variant="primary">
                  <Link href="/contact">Start a Project</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
