"use client";

import { Moon, Sun } from "lucide-react";

import { useT } from "@/i18n/client";

export function ThemeToggle() {
  const { t } = useT("common");
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage blocked: the choice just does not persist
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme.toggle")}
      className="inline-flex size-10 items-center justify-center rounded-md border border-border text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Sun aria-hidden className="hidden size-5 dark:block" />
      <Moon aria-hidden className="size-5 dark:hidden" />
    </button>
  );
}
