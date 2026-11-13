"use client";

import { usePathname } from "next/navigation";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Wordmark } from "@/components/Wordmark";
import { findNavItem } from "@/features/shell/nav";
import { ShellUserMenu } from "@/features/shell/ShellUserMenu";
import { useT } from "@/i18n/client";

/** The sticky top bar: the current screen's name, the language switcher and the user menu. */
export function ShellHeader() {
  const { t } = useT("shell");
  const current = findNavItem(usePathname());

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <Wordmark name={t("brand")} size="sm" className="md:hidden" />
      <h1 className="min-w-0 flex-1 truncate text-base font-black max-md:sr-only">
        {current ? t(current.labelKey) : t("brand")}
      </h1>
      <div className="flex shrink-0 items-center gap-1">
        <LanguageSwitcher />
        <ShellUserMenu />
      </div>
    </header>
  );
}
