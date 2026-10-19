import { useSyncExternalStore } from "react";

import { api, ApiError, setUnauthorizedHandler } from "./api";
// Imported for their side effect: every persisted store must be registered
// before signed-out data is claimed by an account.
import "./app-state";
import "./progress";
import { cancelRoadmap } from "./roadmap-job";
import { claimUnscopedData, setStorageScope } from "./store";
import { pushToast } from "./toasts";
import type { AuthUser } from "./types";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" }
  // The API couldn't be reached, so we can't tell whether a session exists.
  | { status: "offline"; message: string };

const LOADING: AuthState = { status: "loading" };
let state: AuthState = LOADING;
let started = false;
const listeners = new Set<() => void>();

function setState(next: AuthState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function enterAccount(user: AuthUser) {
  setStorageScope(`u${user.id}`);
  const claimed = claimUnscopedData();
  setState({ status: "authenticated", user });
  if (claimed) {
    pushToast({
      tone: "info",
      title: "Your saved progress is now in your account",
      description: "Skills, results and roadmap progress from this browser were moved into it.",
    });
  }
}

function leaveAccount() {
  cancelRoadmap();
  setStorageScope(null);
  setState({ status: "unauthenticated" });
}

export async function refreshSession(): Promise<void> {
  try {
    enterAccount(await api.me());
  } catch (error) {
    if (error instanceof ApiError && error.kind === "http" && error.status === 401) {
      leaveAccount();
    } else {
      setState({
        status: "offline",
        message: error instanceof Error ? error.message : "Can't reach the backend.",
      });
    }
  }
}

export async function signIn(email: string, password: string, remember: boolean): Promise<void> {
  enterAccount(await api.login({ email, password, remember }));
}

export async function signUp(name: string, email: string, password: string): Promise<void> {
  enterAccount(await api.register({ name, email, password }));
}

export async function signOut(): Promise<void> {
  try {
    await api.logout();
  } catch {
    // The cookie may already be gone or the API offline; sign out locally anyway.
  }
  leaveAccount();
}

// Any request that comes back 401 means the session ended elsewhere.
function handleUnauthorized() {
  if (state.status !== "authenticated") return;
  leaveAccount();
  pushToast({
    tone: "info",
    title: "You've been signed out",
    description: "Your session ended. Sign in again to continue.",
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    setUnauthorizedHandler(handleUnauthorized);
    void refreshSession();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => LOADING);
}

/** The signed-in user. Only call inside the authenticated app shell. */
export function useCurrentUser(): AuthUser | null {
  const auth = useAuth();
  return auth.status === "authenticated" ? auth.user : null;
}

export function firstName(user: AuthUser | null): string {
  return user?.name.split(" ")[0] ?? "";
}

export function initials(user: AuthUser | null): string {
  if (!user) return "";
  const parts = user.name.split(" ").filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : user.name.slice(0, 2);
  return letters.toUpperCase();
}

/** Where to go after signing in: a same-site path from ?next=, or the dashboard. */
export function postAuthDestination(search: string): string {
  const next = new URLSearchParams(search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") && !next.startsWith("/signup")) {
    return next;
  }
  return "/";
}
