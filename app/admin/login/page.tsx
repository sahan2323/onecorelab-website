"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { OneCoreLabLogo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BoxReveal } from "@/components/ui/box-reveal";
import { Ripple } from "@/components/ui/ripple";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
        </>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}

function LoginFormInner() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const [showPassword, setShowPassword] = React.useState(false);
  const params = useSearchParams();
  const from = params.get("from") ?? "/admin";

  return (
    <form action={formAction} className="mt-8 w-full space-y-5">
      <input type="hidden" name="from" value={from} />

      <BoxReveal width="100%" duration={0.4}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@onecorelab.com" />
        </div>
      </BoxReveal>

      <BoxReveal width="100%" duration={0.4}>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </BoxReveal>

      {state.status === "error" && (
        <BoxReveal width="100%" duration={0.3}>
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
        </BoxReveal>
      )}

      <BoxReveal width="100%" duration={0.4} overflow="visible">
        <SubmitButton />
      </BoxReveal>

      <BoxReveal width="100%" duration={0.4}>
        <p className="text-center text-xs text-muted-foreground">
          Forgotten your password? Ask a Super Admin to reset it from Staff settings.
        </p>
      </BoxReveal>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left: brand panel with ambient ripple — hidden below lg to keep the
          form full-width and unobstructed on tablet/mobile. */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#050505] lg:flex">
        <Ripple mainCircleSize={180} numCircles={7} />
        <div className="relative z-10 flex max-w-sm flex-col items-center px-8 text-center">
          <OneCoreLabLogo height={72} />
          <p className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
            <ShieldCheck className="h-3.5 w-3.5" /> Internal Access Only
          </p>
          <p className="mt-4 text-white/60">
            Tools for the oneCoreLab team to manage projects, staff, and client
            data. Not for client or customer accounts.
          </p>
        </div>
      </div>

      {/* Right: sign-in form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-16 lg:w-1/2">
        <div className="flex w-full max-w-sm flex-col items-center">
          <div className="lg:hidden">
            <OneCoreLabLogo height={48} />
          </div>
          <BoxReveal duration={0.4} className="mt-6 lg:mt-0">
            <h1 className="font-display font-semibold tracking-tight text-2xl">Sign In</h1>
          </BoxReveal>
          <BoxReveal duration={0.4}>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sign in to the oneCoreLab admin dashboard.
            </p>
          </BoxReveal>

          <React.Suspense fallback={<div className="mt-8 h-64 w-full" />}>
            <LoginFormInner />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
