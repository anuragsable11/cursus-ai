"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api";
import { postAuthDestination, signIn, signUp } from "@/lib/auth";
import { cn } from "@/lib/cn";

type Mode = "login" | "signup";

const MIN_PASSWORD = 8;

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
      <h1 className="font-display text-[2rem] font-medium leading-tight tracking-[-0.015em] text-ink">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        {isSignup
          ? "Your profile, results and roadmap progress are saved to your account."
          : "Sign in to pick up your roadmap where you left off."}
      </p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
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
              className={inputClass}
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
            className={inputClass}
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
              className={cn(inputClass, "pr-11")}
              placeholder={isSignup ? "Choose a strong password" : "Your password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-3 hover:text-ink"
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
        </Field>

        {!isSignup && (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="size-4 cursor-pointer rounded accent-brand"
            />
            Keep me signed in for 30 days
          </label>
        )}

        {error && (
          <Alert tone="error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={submitting}
          disabled={problem !== null}
          icon={<ArrowRight aria-hidden />}
        >
          {submitting ? (isSignup ? "Creating your account…" : "Signing in…") : isSignup ? "Create account" : "Sign in"}
        </Button>
        {problem && (email || password || name) && (
          <p className="text-center text-xs text-ink-faint" aria-live="polite">
            {problem}
          </p>
        )}
      </form>

      <p className="mt-8 text-center text-sm text-ink-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          onClick={(event) => {
            // Carry ?next= across, read at click time so server and client agree.
            event.preventDefault();
            router.push(`${isSignup ? "/login" : "/signup"}${window.location.search}`);
          }}
          className="font-semibold text-brand-ink hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl bg-surface-2/70 px-3.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-faint focus:shadow-[0_0_0_2px_var(--brand)]";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
