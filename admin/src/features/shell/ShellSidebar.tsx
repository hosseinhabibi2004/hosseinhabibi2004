"use client";

import { Wordmark } from "@/components/Wordmark";
import { ShellNav } from "@/features/shell/ShellNav";
import { useT } from "@/i18n/client";

/** The wordmark and the navigation; the wide sidebar and the phone sheet both wear it. */
export function ShellSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useT("shell");

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 bg-background">
      <div className="flex h-14 shrink-0 items-center border-b border-border px-6">
        <Wordmark name={t("brand")} />
      </div>
      <ShellNav onNavigate={onNavigate} />
    </div>
  );
}
