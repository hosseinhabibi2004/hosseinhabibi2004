import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { markdownRoundTrip } from "@/components/rich-text/markdown";
import { RichTextEditor } from "@/components/rich-text/RichTextEditor";
import { renderWithProviders } from "@/i18n/test-utils";

// ProseMirror measures the DOM; jsdom has no layout, so give it empty answers.
beforeAll(() => {
  const empty = () => ({ item: () => null, length: 0, [Symbol.iterator]: [][Symbol.iterator] });
  Range.prototype.getClientRects = empty as never;
  Range.prototype.getBoundingClientRect = () => new DOMRect();
  document.elementFromPoint = () => null;
});

const DOCUMENT = [
  "# Title",
  "",
  "Some **bold** and *italic* text with a [link](https://example.com) and `code`.",
  "",
  "- one",
  "- two",
  "",
  "1. first",
  "2. second",
  "",
  "> a quote",
  "",
  "```",
  "const x = 1;",
  "```",
  "",
  "---",
].join("\n");

describe("markdownRoundTrip", () => {
  it("keeps every construct the editor supports", () => {
    const out = markdownRoundTrip(DOCUMENT);

    expect(out).toContain("# Title");
    expect(out).toContain("**bold**");
    expect(out).toMatch(/(\*italic\*|_italic_)/);
    expect(out).toContain("[link](https://example.com)");
    expect(out).toContain("`code`");
    expect(out).toMatch(/^[-*] one$/m);
    expect(out).toMatch(/^1\. first$/m);
    expect(out).toContain("> a quote");
    expect(out).toContain("const x = 1;");
    expect(out).toMatch(/^(---|\*\*\*|___)$/m);
  });

  it("is stable: a second pass changes nothing", () => {
    const once = markdownRoundTrip(DOCUMENT);

    expect(markdownRoundTrip(once)).toBe(once);
  });

  it("keeps Persian text and mixed Persian and English paragraphs", () => {
    const out = markdownRoundTrip("# عنوان\n\nمتن **پررنگ** فارسی با English در وسط.");

    expect(out).toContain("# عنوان");
    expect(out).toContain("**پررنگ**");
    expect(out).toContain("English");
  });
});

describe("RichTextEditor", () => {
  it("shows a paragraph that reads in its own direction", async () => {
    const { container } = renderWithProviders(<RichTextEditor value="سلام دنیا" onChange={vi.fn()} />, {
      language: "fa",
    });

    await waitFor(() => expect(container.querySelector(".ProseMirror p")).not.toBeNull());
    expect(container.querySelector(".ProseMirror p")).toHaveAttribute("dir", "auto");
  });

  it("swaps to the plain Markdown with the Source toggle, and edits there reach onChange", async () => {
    const onChange = vi.fn();
    renderWithProviders(<RichTextEditor value={"# Title\n\nHello"} onChange={onChange} />);

    await userEvent.click(await screen.findByRole("button", { name: "Source" }));
    const source = screen.getByRole("textbox", { name: "Markdown source" });
    expect(source).toHaveValue("# Title\n\nHello");

    await userEvent.type(source, "!");
    expect(onChange).toHaveBeenLastCalledWith("# Title\n\nHello!");
  });
});
