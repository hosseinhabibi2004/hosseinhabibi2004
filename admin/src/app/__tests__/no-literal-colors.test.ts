import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * No colour is written anywhere but the token file . Components use the
 * semantic classes (`bg-primary`, `text-muted-foreground`), never a hex, `rgb()`,
 * `hsl()`, `oklch()` or a Tailwind palette class (`bg-red-500`, `text-gray-600`).
 *
 * Skipped on purpose: the generated SDK, the tests, and `globals.css` (the tokens live there).
 */
const SRC = join(__dirname, "..", "..");
const ALLOWED_FILES = new Set(["app/globals.css"]);

const LITERALS: [string, RegExp][] = [
  ["hex colour", /(?<![\w&/#-])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/g],
  ["rgb()/hsl()/oklch()/lab()", /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/g],
  [
    "Tailwind palette class",
    /(?<![\w-])(?:bg|text|border|ring|fill|stroke|from|via|to|outline|divide|decoration|shadow|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{2,3})?(?![\w-])/g,
  ],
  ["arbitrary colour value", /(?<![\w-])(?:bg|text|border|ring|fill|stroke)-\[#/g],
];

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") return [];
      if (name === "generated" && path.includes(`${sep}sdk${sep}`)) return [];
      return sources(path);
    }
    return /\.(ts|tsx|css)$/.test(name) ? [path] : [];
  });
}

/** What the scan finds in one text; exported shape for the self-test below. */
function scan(text: string): string[] {
  const hits: string[] = [];
  text.split("\n").forEach((line, index) => {
    const code = line.replace(/\/\/.*$/, "");
    for (const [label, pattern] of LITERALS) {
      for (const match of code.matchAll(pattern)) hits.push(`${index + 1}: ${label} ${match[0]}`);
    }
  });
  return hits;
}

describe("no literal colours outside the token file", () => {
  it("catches each kind of literal (a sample that must be reported)", () => {
    const sample = [
      'const a = "#ff0000";',
      'const b = "rgb(0 0 0)";',
      'const c = "hsl(10 10% 10%)";',
      'const d = "oklch(0.5 0.1 100)";',
      '<div className="bg-red-500 text-gray-600" />',
      '<div className="bg-[#123456]" />',
    ].join("\n");
    expect(scan(sample).length).toBeGreaterThanOrEqual(6);
  });

  it("does not report the semantic classes", () => {
    expect(scan('<div className="bg-primary text-muted-foreground border-border ring-ring bg-black/10" />')).toEqual([
      expect.stringContaining("bg-black"),
    ]);
  });

  it("finds none in the source tree", () => {
    const offenders: string[] = [];
    for (const file of sources(SRC)) {
      const rel = relative(SRC, file).split(sep).join("/");
      if (ALLOWED_FILES.has(rel)) continue;
      for (const hit of scan(readFileSync(file, "utf8"))) offenders.push(`${rel}:${hit}`);
    }
    expect(offenders).toEqual([]);
  });
});
