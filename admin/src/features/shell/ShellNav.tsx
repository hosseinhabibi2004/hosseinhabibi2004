"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { findNavItem, navItems } from "@/features/shell/nav";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** The link list, shared by the wide sidebar and the phone sheet. */
export function ShellNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useT("shell");
  const active = findNavItem(usePathname());

  return (
    <nav aria-label={t("navLabel")} className="flex flex-1 flex-col gap-1 px-3 pt-2 pb-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === active?.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-accent text-foreground",
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            <span className="truncate">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
