"use client";

import { Monitor, Moon, SunMedium } from "lucide-react";
import type { ReactNode } from "react";

import { Segmented } from "@/components/ui/segmented";
import { setTheme, useTheme, type ThemeChoice } from "@/lib/theme";

const OPTIONS: { value: ThemeChoice; label: string; icon: ReactNode }[] = [
  { value: "system", label: "System theme", icon: <Monitor aria-hidden /> },
  { value: "light", label: "Light theme", icon: <SunMedium aria-hidden /> },
  { value: "dark", label: "Dark theme", icon: <Moon aria-hidden /> },
];

/** Three-way icon switch for system, light and dark. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  return (
    <div className={className ?? "w-24"}>
      <Segmented
        label="Theme"
        size="sm"
        value={theme}
        onChange={setTheme}
        options={OPTIONS.map((option) => ({ value: option.value, label: option.label, icon: option.icon, srLabel: option.label }))}
      />
    </div>
  );
}

/** Single button that cycles themes, for tight spaces. */
export function ThemeCycleButton() {
  const theme = useTheme();
  const next: ThemeChoice = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[0];
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`${current.label}. Switch theme`}
      title={current.label}
      className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink [&_svg]:size-4"
    >
      {current.icon}
    </button>
  );
}
