import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PostsList } from "@/features/posts/PostsList";
import { errorResponse, listResponse, okResponse, renderWithProviders } from "@/i18n/test-utils";
import { Author } from "@/sdk/generated";

vi.mock("next/navigation", () => ({
  // next-i18next's provider reads the route params.
  useParams: () => ({}),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/posts",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/sdk/generated", () => ({
  Author: {
    authorPostsList: vi.fn(),
    authorPostsDestroy: vi.fn(),
    authorPostsRestoreCreate: vi.fn(),
  },
}));

const POST = {
  uuid: "u1",
  slug: "hello",
  cover_image: null,
  tags: [],
  translations: [
    { locale: "en", title: "Hello", summary: "", body: "x", status: "published", published_at: "2026-11-13T10:00:00Z" },
    { locale: "fa", title: "سلام", summary: "", body: "x", status: "draft", published_at: "2026-11-13T10:00:00Z" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.mocked(Author.authorPostsList).mockResolvedValue(listResponse([POST], 45) as never);
});
afterEach(() => vi.unstubAllGlobals());

const lastQuery = () => vi.mocked(Author.authorPostsList).mock.calls.at(-1)?.[0]?.query;

describe("the Posts list", () => {
  it("shows the title, the slug and each language's status", async () => {
    renderWithProviders(<PostsList />);

    expect(await screen.findByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByLabelText("English: Published")).toBeInTheDocument();
    expect(screen.getByLabelText("Persian: Draft")).toBeInTheDocument();
  });

  it("asks for the page in the URL", async () => {
    renderWithProviders(<PostsList />, { searchParams: "?page=2" });

    await screen.findByText("Hello");
    expect(lastQuery()).toMatchObject({ page: 2 });
    expect(lastQuery()).not.toMatchObject({ deleted: true });
  });

  it("lists the trash from the Trash tab and restores from there", async () => {
    vi.mocked(Author.authorPostsRestoreCreate).mockResolvedValue(okResponse({}) as never);
    renderWithProviders(<PostsList />);
    await screen.findByText("Hello");

    await userEvent.click(screen.getByRole("tab", { name: "Trash" }));
    await waitFor(() => expect(lastQuery()).toMatchObject({ deleted: true }));
    await userEvent.click(await screen.findByRole("button", { name: "Restore post" }));

    expect(Author.authorPostsRestoreCreate).toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: "u1" } }),
    );
  });

  it("asks before it deletes", async () => {
    vi.mocked(Author.authorPostsDestroy).mockResolvedValue(okResponse({}) as never);
    renderWithProviders(<PostsList />);

    await userEvent.click(await screen.findByRole("button", { name: "Delete post" }));
    expect(Author.authorPostsDestroy).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog", { name: "Delete this post?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(Author.authorPostsDestroy).toHaveBeenCalledWith(expect.objectContaining({ path: { uuid: "u1" } }));
  });

  it("shows the empty state and the error state with a retry", async () => {
    vi.mocked(Author.authorPostsList).mockResolvedValueOnce(listResponse([], 0) as never);
    const { unmount } = renderWithProviders(<PostsList />);
    expect(await screen.findByText("Nothing found.")).toBeInTheDocument();
    unmount();

    vi.mocked(Author.authorPostsList).mockResolvedValueOnce(errorResponse(500) as never);
    renderWithProviders(<PostsList />);
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
