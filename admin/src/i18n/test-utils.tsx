import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import { I18nProvider } from "next-i18next/client";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";

import type { Language } from "@/i18n/language";
import resources from "@/i18n/locales";

interface Options {
  language?: Language;
  /** The URL query the page starts with, for components that read it with nuqs. */
  searchParams?: string;
}

/** Renders `ui` inside the providers the app supplies: i18n, react-query and nuqs. */
export function renderWithProviders(
  ui: React.ReactElement,
  { language = "en", searchParams = "" }: Options = {},
): RenderResult {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrap = (node: React.ReactElement) => (
    <QueryClientProvider client={client}>
      <I18nProvider language={language} resources={resources}>
        <NuqsTestingAdapter searchParams={searchParams}>{node}</NuqsTestingAdapter>
      </I18nProvider>
    </QueryClientProvider>
  );
  const result = render(wrap(ui));
  return { ...result, rerender: (next: React.ReactNode) => result.rerender(wrap(next as React.ReactElement)) };
}

/** What an SDK list call answers: the API envelope around a page of rows. */
export function listResponse<T>(results: T[], count = results.length) {
  return {
    data: { success: true, message: "GENERIC_001", result: { count, next: null, previous: null, results } },
    response: { status: 200 },
  };
}

export function okResponse<T>(result: T, status = 200) {
  return { data: { success: true, message: "GENERIC_001", result }, response: { status } };
}

export function errorResponse(status: number, result: unknown = {}) {
  return { error: { success: false, message: "GENERIC_002", result }, response: { status } };
}
