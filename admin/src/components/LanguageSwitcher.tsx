"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";
import { applyLanguage, languages, type Language } from "@/i18n/language";
import { cn } from "@/lib/utils";

const LABELS: Record<Language, string> = { en: "English", fa: "فارسی" };

/** Switches the interface language; the choice sticks in a cookie and the page re-renders in it. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useT("shell");
  const router = useRouter();

  return (
    <div role="group" aria-label={t("language")} className={cn("inline-flex gap-1", className)}>
      {languages.map((language) => (
        <Button
          key={language}
          type="button"
          size="sm"
          variant={i18n.language === language ? "secondary" : "ghost"}
          aria-pressed={i18n.language === language}
          lang={language}
          onClick={() => {
            applyLanguage(language);
            router.refresh();
          }}
        >
          {LABELS[language]}
        </Button>
      ))}
    </div>
  );
}
