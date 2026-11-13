"use client";

import { CircleCheck, CircleDashed, PencilLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n/client";

export type ContentLocale = "en" | "fa";
export type LanguageStatus = "empty" | "draft" | "published";

const ICONS = { empty: CircleDashed, draft: PencilLine, published: CircleCheck } as const;
const VARIANTS = { empty: "outline", draft: "secondary", published: "default" } as const;

/**
 * Where one content language of an item stands: empty (no text yet), a draft, or published.
 * Each state differs in its icon and its label, never in colour alone; the accessible name
 * reads "English: Published".
 */
export function StatusBadge({ locale, status }: { locale: ContentLocale; status: LanguageStatus }) {
  const { t } = useT();
  const Icon = ICONS[status];
  return (
    <Badge variant={VARIANTS[status]} aria-label={`${t(`languages.${locale}`)}: ${t(`status.${status}`)}`}>
      <Icon aria-hidden />
      <span aria-hidden>{locale.toUpperCase()}</span>
    </Badge>
  );
}
