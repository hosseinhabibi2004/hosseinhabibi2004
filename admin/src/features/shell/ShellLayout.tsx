"use client";

import { ShellBottomNav } from "@/features/shell/ShellBottomNav";
import { ShellHeader } from "@/features/shell/ShellHeader";
import { ShellSidebar } from "@/features/shell/ShellSidebar";
import { useT } from "@/i18n/client";

/** The signed-in frame: a sidebar on wide screens, a bottom bar and sheet on phones. */
export function ShellLayout({ children }: { children: React.ReactNode }) {
  const { t } = useT("shell");

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-e border-border md:flex md:flex-col">
        <ShellSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <ShellHeader />
        <main id="main" className="flex flex-1 flex-col p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      <ShellBottomNav />
    </div>
  );
}
