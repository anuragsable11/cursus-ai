"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Button, textLinkClasses } from "@/components/ui/button";
import { CheckboxBox } from "@/components/ui/checkbox";
import { fieldClasses } from "@/components/ui/field";
import { errorMessage } from "@/lib/api";
import { postAuthDestination, signIn, signUp } from "@/lib/auth";
import { cn } from "@/lib/cn";

type Mode = "login" | "signup";

const MIN_PASSWORD = 8;

const inputClasses = cn(fieldClasses, "h-10 w-full px-3");

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";
  const problem = isSignup
    ? !name.trim()
      ? "Enter your name."
      : !email.trim()
        ? "Enter your email."
        : password.length < MIN_PASSWORD
          ? `Use at least ${MIN_PASSWORD} characters.`
          : null
    : !email.trim() || !password
      ? "Enter your email and password."
      : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (problem || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      if (isSignup) await signUp(name, email, password);
      else await signIn(email, password, remember);
      router.replace(postAuthDestination(window.location.search));
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-rise">
      <h1 className="text-center text-[1.75rem] font-semibold leading-tight tracking-[-0.04em] text-ink">
        {isSignup ? "Create your account" : "Sign in to Cursus AI"}
      </h1>
      <p className="mt-2 text-center text-sm leading-6 text-ink-muted">
        {isSignup
          ? "Your profile, results and roadmap progress are saved to your account."
          : "Pick up your roadmap where you left off."}
      </p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-4">
        {isSignup && (
          <Field id={`${id}-name`} label="Name">
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              className={inputClasses}
              placeholder="Ada Lovelace"
            />
          </Field>
        )}

        <Field id={`${id}-email`} label="Email">
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus={!isSignup}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            className={inputClasses}
            placeholder="you@example.com"
          />
        </Field>

        <Field
          id={`${id}-password`}
          label="Password"
          hint={isSignup ? `At least ${MIN_PASSWORD} characters.` : undefined}
        >
          <div className="relative">
            <input
              id={`${id}-password`}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={128}
              className={cn(inputClasses, "pr-10")}
              placeholder={isSignup ? "Choose a strong password" : "Your password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
        </Field>

        {!isSignup && (
          <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm text-ink-muted">
            <CheckboxBox checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            Keep me signed in for 30 days
          </label>
        )}

        {error && (
          <Alert tone="error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        <div className="pt-2">
          <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={problem !== null}>
            {submitting ? (isSignup ? "Creating your account…" : "Signing in…") : isSignup ? "Create account" : "Sign in"}
          </Button>
          {problem && (email || password || name) && (
            <p className="mt-3 text-center text-[13px] text-ink-faint" aria-live="polite">
              {problem}
            </p>
          )}
        </div>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-center text-sm text-ink-muted">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          onClick={(event) => {
            // Carry ?next= across, read at click time so server and client agree.
            event.preventDefault();
            router.push(`${isSignup ? "/login" : "/signup"}${window.location.search}`);
          }}
          className={textLinkClasses}
        >
          {isSignup ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-muted">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[13px] text-ink-faint">{hint}</p>}
    </div>
  );
}
