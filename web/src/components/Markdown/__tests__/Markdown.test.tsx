// Contract (plan B3)
// `@/components/Markdown/Markdown` exports the ASYNC SERVER component
//   Markdown({ source, copyLabel, copiedLabel }): Promise<ReactElement>
// Tests call it as a function, await it and render the result:
//   render(await Markdown({ source, copyLabel: "Copy", copiedLabel: "Copied" }))
// It needs no i18n hook: the labels of the code-block copy button come in as props.
// Code blocks render the language label and a client CopyButton that writes the raw code to
// navigator.clipboard.writeText. Block elements carry dir="auto"; external links get
// rel="noopener ...". Raw HTML is sanitised (script elements and on* attributes are dropped).
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Markdown } from "@/components/Markdown/Markdown";

const LABELS = { copyLabel: "Copy", copiedLabel: "Copied" };

async function renderMd(source: string) {
  return render(await Markdown({ source, ...LABELS }));
}

describe("Markdown", () => {
  it("drops script tags and event-handler attributes", async () => {
    const { container } = await renderMd(
      'Hello\n\n<script>window.__pwned = 1</script>\n\n<img src="x.png" alt="x" onerror="window.__pwned = 2">\n\n[a](javascript:alert(1))',
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("[onerror]")).toBeNull();
    expect(container.innerHTML).not.toMatch(/javascript:/i);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders a GFM table", async () => {
    const { container } = await renderMd("| a | b |\n| - | - |\n| 1 | 2 |\n");
    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(table?.querySelectorAll("th")).toHaveLength(2);
    expect(table?.querySelectorAll("td")).toHaveLength(2);
  });

  it("gives headings ids", async () => {
    const { container } = await renderMd("## Build step\n\n### مرحله ساخت\n");
    expect(container.querySelector("h2")?.id).toBe("build-step");
    expect(container.querySelector("h3")?.id).toBeTruthy();
  });

  it("sets dir=auto on block elements", async () => {
    const { container } = await renderMd(
      "# Title\n\nA paragraph.\n\n- one\n- two\n\n1. first\n\n> quoted\n",
    );
    for (const selector of ["h1", "p", "ul", "ol", "blockquote"]) {
      const element = container.querySelector(selector);
      expect(element, selector).not.toBeNull();
      expect(element?.getAttribute("dir"), selector).toBe("auto");
    }
  });

  it("marks external links noopener", async () => {
    await renderMd("[out](https://example.com/page) and [in](/en/about/)");
    const out = screen.getByRole("link", { name: "out" });
    expect(out.getAttribute("rel")).toContain("noopener");
    expect(screen.getByRole("link", { name: "in" })).toHaveAttribute("href", "/en/about/");
  });
});

describe("Markdown code blocks", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, "clipboard");
  });

  const SOURCE = "```python\nprint('hi')\nx = 1\n```\n";

  it("shows the language label and the code", async () => {
    const { container } = await renderMd(SOURCE);
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(container.querySelector("pre")?.textContent).toContain("print('hi')");
  });

  it("copies the raw code and confirms with the copied label", async () => {
    await renderMd(SOURCE);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(String(writeText.mock.calls[0][0]).trimEnd()).toBe("print('hi')\nx = 1");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("renders a block without a language", async () => {
    const { container } = await renderMd("```\nplain\n```\n");
    expect(container.querySelector("pre")?.textContent).toContain("plain");
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });
});
