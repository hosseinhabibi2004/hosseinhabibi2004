"use client";

import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
  type UseQueryStatesKeysMap,
} from "nuqs";

const BASE_PARSERS = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(""),
};

/**
 * The URL-held view state of a list — page, search and whatever filters the
 * screen adds — so a reload, a pasted link or the back button restores the
 * same view (`sad-06`). Page is 1-based in the URL.
 *
 * Changing a filter or the search resets to page 1: page 4 of a different
 * result set is nowhere.
 */
export function useTableParams<TFilters extends UseQueryStatesKeysMap>(
  filters: TFilters,
) {
  const [base, setBase] = useQueryStates(BASE_PARSERS, { history: "replace" });
  const [filterValues, setFilterValues] = useQueryStates(filters, {
    history: "replace",
  });

  return {
    page: base.page,
    search: base.q,
    filters: filterValues,
    setPage: (page: number) => void setBase({ page }),
    setSearch: (q: string) => void setBase({ q, page: 1 }),
    setFilters: (next: Parameters<typeof setFilterValues>[0]) => {
      void setFilterValues(next);
      void setBase({ page: 1 });
    },
    reset: () => {
      void setBase(null);
      void setFilterValues(null);
    },
  };
}
