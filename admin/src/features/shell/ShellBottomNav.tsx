"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { findNavItem, navItems } from "@/features/shell/nav";
import { ShellSidebar } from "@/features/shell/ShellSidebar";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

const TAB =
  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs font-medium text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

/** The phone's bottom bar: one tab per screen plus a menu tab that opens the full navigation. */
export function ShellBottomNav() {
  const { t } = useT("shell");
  const { t: tc } = useT("common");
  const [open, setOpen] = useState(false);
  const active = findNavItem(usePathname());

  return (
    <nav
      aria-label={t("navLabel")}
      className="fixed inset-x-0 bottom-0 z-40 flex gap-1 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === active?.id;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(TAB, isActive && "text-foreground")}
          >
            <Icon aria-hidden className="size-5" />
            <span className="max-w-full truncate">{t(item.labelKey)}</span>
          </Link>
        );
      })}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<button type="button" className={TAB} />}>
          <Menu aria-hidden className="size-5" />
          <span>{t("menu")}</span>
        </SheetTrigger>
        <SheetContent side="right" closeLabel={tc("close")} className="w-72 gap-0 p-0">
          <SheetTitle className="sr-only">{t("navLabel")}</SheetTitle>
          <ShellSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </nav>
  );
}
