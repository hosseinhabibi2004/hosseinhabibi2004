"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/client";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * The strip above a list: a debounced search box, the screen's filters
 * (`children`), and a reset that shows only while something is filtered.
 * The search text is owned by the URL (`q`); this keeps the typing local and
 * writes it back once the user pauses.
 */
export const DataTableToolbar: React.FC<
  React.PropsWithChildren<{
    /** Omit both to show no search box (a list the API cannot search). */
    search?: string;
    onSearchChange?: (search: string) => void;
    searchPlaceholder?: string;
    isFiltered: boolean;
    onReset: () => void;
  }>
> = ({
  search = "",
  onSearchChange,
  searchPlaceholder,
  isFiltered,
  onReset,
  children,
}) => {
  const { t } = useT();
  const [draft, setDraft] = useState(search);
  const [seenSearch, setSeenSearch] = useState(search);
  const timer = useRef<number | undefined>(undefined);

  // The URL moved under us (reset, back button): adopt it. Adjusting state
  // while rendering is React's sanctioned way to follow a changing prop.
  if (search !== seenSearch) {
    setSeenSearch(search);
    setDraft(search);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleChange = (value: string) => {
    setDraft(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => onSearchChange?.(value),
      SEARCH_DEBOUNCE_MS,
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSearchChange ? (
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={draft}
            onChange={(event) => handleChange(event.target.value)}
            placeholder={searchPlaceholder ?? t("table.searchPlaceholder")}
            aria-label={searchPlaceholder ?? t("search")}
            className="ps-8"
          />
        </div>
      ) : null}
      {children}
      {isFiltered ? (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X aria-hidden />
          {t("table.resetFilters")}
        </Button>
      ) : null}
    </div>
  );
};
