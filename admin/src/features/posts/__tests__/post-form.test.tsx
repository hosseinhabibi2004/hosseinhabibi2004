import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PostForm } from "@/features/posts/PostForm";
import { errorResponse, okResponse, renderWithProviders } from "@/i18n/test-utils";
import { Author } from "@/sdk/generated";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push, refresh: vi.fn() }),
  usePathname: () => "/posts/new",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/sdk/generated", () => ({
  Author: {
    authorPostsCreate: vi.fn(),
    authorPostsPartialUpdate: vi.fn(),
    authorImagesCreate: vi.fn(),
    authorImagesPartialUpdate: vi.fn(),
  },
}));
// The real editor needs a browser's layout; the form only needs a text value.
vi.mock("@/components/rich-text/RichTextEditor", () => ({
  RichTextEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="Body" value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));

beforeEach(() => vi.clearAllMocks());

const EXISTING = {
  uuid: "u1",
  slug: "hello",
  cover_image: null,
  tags: [],
  translations: [
    { locale: "en", title: "Hello", summary: "", body: "x", status: "published", published_at: "2026-11-13T10:00:00Z" },
  ],
};

describe("the Post form", () => {
  it("shows each language's own status on its tab", () => {
    renderWithProviders(<PostForm post={EXISTING as never} />);

    expect(screen.getByRole("tab", { name: /English/ })).toContainElement(screen.getByLabelText("English: Published"));
    expect(screen.getByRole("tab", { name: /Persian/ })).toContainElement(screen.getByLabelText("Persian: Empty"));
  });

  it("refuses to publish a language without a title and a body", async () => {
    renderWithProviders(<PostForm />);

    await userEvent.type(screen.getByLabelText("Slug"), "hello");
    await userEvent.click(screen.getByRole("switch", { name: "Published" }));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("A published language needs a title and a body.")).toBeInTheDocument();
    expect(Author.authorPostsCreate).not.toHaveBeenCalled();
  });

  it("creates a post with the languages that were filled in, then goes back to the list", async () => {
    vi.mocked(Author.authorPostsCreate).mockResolvedValue(okResponse({ ...EXISTING }, 201) as never);
    renderWithProviders(<PostForm />);

    await userEvent.type(screen.getByLabelText("Slug"), "hello");
    await userEvent.type(screen.getByLabelText("Title"), "Hello");
    await userEvent.type(screen.getByLabelText("Body"), "Body text");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(Author.authorPostsCreate).toHaveBeenCalledTimes(1));
    const body = vi.mocked(Author.authorPostsCreate).mock.calls[0][0]?.body;
    expect(body).toMatchObject({
      slug: "hello",
      cover_image: null,
      translations: [{ locale: "en", title: "Hello", body: "Body text", status: "draft" }],
    });
    expect(push).toHaveBeenCalledWith("/posts");
  });

  it("shows an API validation error on its own field", async () => {
    vi.mocked(Author.authorPostsCreate).mockResolvedValue(
      errorResponse(400, { error_detail: { slug: ["This slug is already used."] } }) as never,
    );
    renderWithProviders(<PostForm />);

    await userEvent.type(screen.getByLabelText("Slug"), "hello");
    await userEvent.type(screen.getByLabelText("Title"), "Hello");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("This slug is already used.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("uploads the cover, then sets its alt text, then saves the post with the image uuid", async () => {
    vi.mocked(Author.authorImagesCreate).mockResolvedValue(
      okResponse({ uuid: "img-1", url: "http://x/a.png", width: 8, height: 6, translations: [] }, 201) as never,
    );
    vi.mocked(Author.authorImagesPartialUpdate).mockResolvedValue(okResponse({}) as never);
    vi.mocked(Author.authorPostsCreate).mockResolvedValue(okResponse({ ...EXISTING }, 201) as never);
    renderWithProviders(<PostForm />);

    await userEvent.type(screen.getByLabelText("Slug"), "hello");
    await userEvent.type(screen.getByLabelText("Title"), "Hello");
    await userEvent.upload(
      screen.getByLabelText("Cover image"),
      new File(["png"], "a.png", { type: "image/png" }),
    );
    await userEvent.type(screen.getByLabelText("Alt text (English)"), "A red box");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(Author.authorPostsCreate).toHaveBeenCalled());
    expect(Author.authorImagesPartialUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: "img-1" },
        body: { translations: [{ locale: "en", alt: "A red box" }] },
      }),
    );
    expect(vi.mocked(Author.authorPostsCreate).mock.calls[0][0]?.body).toMatchObject({ cover_image: "img-1" });
    const order = [
      vi.mocked(Author.authorImagesCreate).mock.invocationCallOrder[0],
      vi.mocked(Author.authorImagesPartialUpdate).mock.invocationCallOrder[0],
      vi.mocked(Author.authorPostsCreate).mock.invocationCallOrder[0],
    ];
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
