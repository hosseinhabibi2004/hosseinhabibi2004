"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a CSS media query currently matches. Server render and the first
 * client render use `fallback`, so hydration agrees; it then follows the
 * viewport. Prefer plain responsive classes — this is for choosing *which
 * markup* to render (a table or cards), where rendering both would duplicate
 * every cell in the DOM.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}
