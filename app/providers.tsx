"use client";
import * as React from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import { SmoothScrollProvider } from "@/components/animations/smooth-scroll-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <SmoothScrollProvider>
        <ToastProvider>{children}</ToastProvider>
      </SmoothScrollProvider>
    </ThemeProvider>
  );
}
