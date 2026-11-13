import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Dashboard } from "@/features/dashboard/Dashboard";
import { listResponse, renderWithProviders } from "@/i18n/test-utils";
import { Author } from "@/sdk/generated";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/sdk/generated", () => ({
  Author: { authorPostsList: vi.fn(), authorProjectsList: vi.fn() },
}));

const post = (uuid: string, title: string, fa: "draft" | "published") => ({
  uuid,
  slug: uuid,
  cover_image: null,
  tags: [],
  translations: [
    { locale: "en", title, summary: "", body: "x", status: "published", published_at: "2026-11-13T10:00:00Z" },
    { locale: "fa", title: "ف", summary: "", body: "x", status: fa, published_at: "2026-11-13T10:00:00Z" },
  ],
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.mocked(Author.authorPostsList).mockResolvedValue(
    listResponse([post("u1", "First", "draft"), post("u2", "Second", "published")], 12) as never,
  );
  vi.mocked(Author.authorProjectsList).mockResolvedValue(listResponse([], 4) as never);
});

describe("the dashboard", () => {
  it("shows the counts of posts and projects", async () => {
    renderWithProviders(<Dashboard />);

    const posts = await screen.findByRole("link", { name: /Posts/ });
    expect(within(posts).getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Projects").closest("div")).toHaveTextContent("4");
  });

  it("shows the counts with Persian digits in Persian", async () => {
    renderWithProviders(<Dashboard />, { language: "fa" });

    expect(await screen.findByText("۱۲")).toBeInTheDocument();
    expect(screen.getByText("۴")).toBeInTheDocument();
  });

  it("lists the latest posts, each linking to its edit page", async () => {
    renderWithProviders(<Dashboard />);

    expect(await screen.findByRole("link", { name: "First" })).toHaveAttribute("href", "/posts/u1");
    expect(screen.getByRole("link", { name: "Second" })).toHaveAttribute("href", "/posts/u2");
    expect(vi.mocked(Author.authorPostsList).mock.calls[0][0]?.query).toMatchObject({ page_size: 5 });
  });
});
