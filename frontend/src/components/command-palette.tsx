"use client";

import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  ClipboardPaste,
  CornerDownLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Route,
  Search,
  SunMedium,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";

import { jobDescriptionStore, useProfile, useSavedMatch, useSavedRoadmap } from "@/lib/app-state";
import { signOut, useCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { verdictForMatch } from "@/lib/match-verdict";
import { closePalette, togglePalette, usePaletteOpen } from "@/lib/command-palette";
import { SAMPLE_JOB_DESCRIPTION } from "@/lib/sample-job";
import { setTheme, useTheme } from "@/lib/theme";

type Command = {
  id: string;
  group: "Go to" | "Actions" | "Theme" | "Account";
  label: string;
  hint?: string;
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
};

export function CommandPalette() {
  const open = usePaletteOpen();

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return open ? <PaletteDialog /> : null;
}

function useCommands(): Command[] {
  const router = useRouter();
  const theme = useTheme();
  const { value: profile } = useProfile();
  const { value: match } = useSavedMatch();
  const { value: roadmap } = useSavedRoadmap();
  const user = useCurrentUser();

  return useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    const skills = profile?.skills.length ?? 0;
    return [
      { id: "dashboard", group: "Go to", label: "Dashboard", hint: "Overview and next step", icon: LayoutDashboard, keywords: "home overview", run: go("/") },
      {
        id: "resume",
        group: "Go to",
        label: "Resume Analyzer",
        hint: skills ? `${skills} skills in your profile` : "Upload a PDF resume",
        icon: FileText,
        keywords: "upload pdf skills profile",
        run: go("/resume-analyzer"),
      },
      {
        id: "match",
        group: "Go to",
        label: "Job Matcher",
        hint: match ? `Last result: ${verdictForMatch(match.result).short}` : "Compare with a job description",
        icon: BriefcaseBusiness,
        keywords: "compare coverage job description",
        run: go("/job-matcher"),
      },
      {
        id: "roadmap",
        group: "Go to",
        label: "Skill Gap Roadmap",
        hint: roadmap ? `${roadmap.result.target_weeks}-week plan` : "Build a learning plan",
        icon: Route,
        keywords: "plan weeks learning gaps ai",
        run: go("/skill-gap-analysis"),
      },
      {
        id: "sample",
        group: "Actions",
        label: "Try the sample job description",
        hint: "Fills in an AI Engineer posting",
        icon: ClipboardPaste,
        keywords: "example demo paste",
        run: () => {
          jobDescriptionStore.set(SAMPLE_JOB_DESCRIPTION);
          router.push("/job-matcher");
        },
      },
      { id: "theme-light", group: "Theme", label: "Light theme", hint: theme === "light" ? "Current" : undefined, icon: SunMedium, keywords: "appearance", run: () => setTheme("light") },
      { id: "theme-dark", group: "Theme", label: "Dark theme", hint: theme === "dark" ? "Current" : undefined, icon: Moon, keywords: "appearance night", run: () => setTheme("dark") },
      { id: "theme-system", group: "Theme", label: "Match system theme", hint: theme === "system" ? "Current" : undefined, icon: Monitor, keywords: "appearance auto", run: () => setTheme("system") },
      {
        id: "sign-out",
        group: "Account",
        label: "Sign out",
        hint: user?.email,
        icon: LogOut,
        keywords: "logout log out leave account",
        run: () => {
          void signOut().then(() => router.replace("/login"));
        },
      },
    ];
  }, [router, theme, profile, match, roadmap, user]);
}

function matches(command: Command, query: string): boolean {
  const haystack = `${command.label} ${command.keywords ?? ""} ${command.group}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

function PaletteDialog() {
  const listId = useId();
  const commands = useCommands();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = commands.filter((command) => matches(command, query));
  const index = results.length ? Math.min(active, results.length - 1) : -1;

  function run(command: Command | undefined) {
    if (!command) return;
    closePalette();
    command.run();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(results[index]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
    } else if (event.key === "Tab") {
      event.preventDefault();
    }
  }

  return (
    <div className="print-hidden fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command menu"
        tabIndex={-1}
        onClick={closePalette}
        className="absolute inset-0 cursor-default bg-black/30 animate-fade"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="relative w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-pop animate-pop"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-ink-faint" aria-hidden />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={index >= 0 ? `${listId}-${results[index].id}` : undefined}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages and actions…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none"
          />
          <kbd className="rounded border border-line bg-canvas px-1.5 font-mono text-[11px] leading-[18px] text-ink-muted">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label="Commands" className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-ink-muted">No matches for “{query}”.</li>
          )}
          {results.map((command, position) => {
            const showGroup = position === 0 || results[position - 1].group !== command.group;
            const selected = position === index;
            const Icon = command.icon;
            return (
              <li key={command.id} role="presentation">
                {showGroup && (
                  <p className="px-3 pt-3 pb-1.5 text-xs font-medium text-ink-faint">
                    {command.group}
                  </p>
                )}
                <div
                  id={`${listId}-${command.id}`}
                  role="option"
                  aria-selected={selected}
                  onMouseMove={() => setActive(position)}
                  onClick={() => run(command)}
                  className={cn(
                    "flex h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-sm",
                    selected ? "bg-surface-2 text-ink" : "text-ink-muted",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", selected ? "text-ink" : "text-ink-faint")} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-ink">{command.label}</span>
                  {command.hint && <span className="hidden max-w-[45%] truncate text-[13px] text-ink-faint sm:block">{command.hint}</span>}
                  {selected && <CornerDownLeft className="size-4 shrink-0 text-ink-faint" aria-hidden />}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-line bg-canvas px-4 py-2.5 text-xs text-ink-faint">
          <span>
            <kbd className="font-mono">↑↓</kbd> to move
          </span>
          <span>
            <kbd className="font-mono">Enter</kbd> to open
          </span>
        </div>
      </div>
    </div>
  );
}
