// Contract (plan B1)
// - `@/components/ThemeToggle` exports the client component `ThemeToggle` (no props): a button
//   with an accessible name (from i18n, so it renders inside an I18nProvider). Clicking it flips
//   the `dark` class on <html> and stores "light" | "dark" in localStorage under `theme`.
//   Its starting state is what the pre-paint script left on <html>.
// - `@/components/ThemeScript` exports `themeScript` (a string of plain JS statements, safe to run
//   with `new Function(themeScript)()`) and the `ThemeScript` component that inlines it.
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeScript, themeScript } from "@/components/ThemeScript";
import { ThemeToggle } from "@/components/ThemeToggle";
import { renderWithI18n } from "@/i18n/test-utils";

const root = document.documentElement;

function stubSystemDark(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-color-scheme: dark") ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  localStorage.clear();
  root.classList.remove("dark");
  stubSystemDark(false);
});
afterEach(() => {
  vi.unstubAllGlobals();
  root.classList.remove("dark");
  localStorage.clear();
});

describe("ThemeToggle", () => {
  it("is a button with an accessible name, in both languages", () => {
    const { unmount } = renderWithI18n(<ThemeToggle />, "en");
    expect(screen.getByRole("button", { name: /\S/ })).toBeInTheDocument();
    unmount();
    renderWithI18n(<ThemeToggle />, "fa");
    expect(screen.getByRole("button", { name: /\S/ })).toBeInTheDocument();
  });

  it("toggles the dark class and stores the choice", () => {
    renderWithI18n(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /\S/ });

    fireEvent.click(button);
    expect(root.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    fireEvent.click(button);
    expect(root.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("starts dark when dark is stored (the script has set the class) and switches to light", () => {
    localStorage.setItem("theme", "dark");
    root.classList.add("dark");
    renderWithI18n(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /\S/ }));
    expect(root.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });
});

describe("themeScript", () => {
  const run = () => new Function(themeScript)();

  it("is a non-empty string of JavaScript", () => {
    expect(typeof themeScript).toBe("string");
    expect(themeScript.length).toBeGreaterThan(0);
    expect(() => new Function(themeScript)).not.toThrow();
  });

  it("adds the dark class for a stored dark choice, even when the system is light", () => {
    localStorage.setItem("theme", "dark");
    run();
    expect(root.classList.contains("dark")).toBe(true);
  });

  it("removes the dark class for a stored light choice, even when the system is dark", () => {
    stubSystemDark(true);
    root.classList.add("dark");
    localStorage.setItem("theme", "light");
    run();
    expect(root.classList.contains("dark")).toBe(false);
  });

  it("follows prefers-color-scheme when nothing is stored", () => {
    stubSystemDark(true);
    run();
    expect(root.classList.contains("dark")).toBe(true);

    root.classList.remove("dark");
    stubSystemDark(false);
    run();
    expect(root.classList.contains("dark")).toBe(false);
  });

  it("does not throw when localStorage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(run).not.toThrow();
    vi.restoreAllMocks();
  });

  it("ThemeScript inlines the script in a <script> element", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    expect(script?.innerHTML).toContain(themeScript);
  });
});
