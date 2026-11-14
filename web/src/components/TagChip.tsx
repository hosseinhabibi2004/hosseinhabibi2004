import Link from "next/link";

import type { PublicTag } from "@/lib/content/types";
import type { Locale } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TagChipProps {
  lng: Locale;
  tag: PublicTag;
  className?: string;
}

export function TagChip({ lng, tag, className }: TagChipProps) {
  return (
    <Link
      href={`/${lng}/tags/${tag.slug}/`}
      className={cn(
        "inline-flex items-center rounded-sm border-2 border-foreground px-2.5 py-0.5 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background",
        className,
      )}
    >
      {tag.name}
    </Link>
  );
}
