// Guards for the design rules (plan §4): components and pages use logical (RTL-safe) Tailwind
// utilities and colour tokens only. Scans every non-test .ts/.tsx under src/components and src/app.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const SRC = path.resolve(import.meta.dirname, "../..");
const ROOTS = ["components", "app"].map((d) => path.join(SRC, d));

export const PHYSICAL =
  /\b(ml|mr|pl|pr)-\d|\btext-(left|right)\b|\b(left|right)-\d|\brounded-(l|r)-|\bborder-(l|r)\b/;
export const LITERAL_COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(bg|text)-(white|black)\b/;

/** Lines that build class names: where literal colours matter (an `href="#main"` does not). */
const CLASS_LINE = /className|\bclass=|\bcn\(|\bcva\(|\bclsx\(|\btwMerge\(/;

function isTest(file: string): boolean {
  return /\.test\.tsx?$/.test(file) || file.split(path.sep).includes("__tests__");
}

function sourceFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : sourceFiles(full);
    return /\.tsx?$/.test(name) && !isTest(full) ? [full] : [];
  });
}

export function findViolations(text: string): string[] {
  const found: string[] = [];
  text.split("\n").forEach((line, i) => {
    if (PHYSICAL.test(line)) found.push(`${i + 1}: physical direction: ${line.trim()}`);
    if (CLASS_LINE.test(line) && LITERAL_COLOUR.test(line)) {
      found.push(`${i + 1}: literal colour: ${line.trim()}`);
    }
  });
  return found;
}

describe("style guard (self-check)", () => {
  it("flags physical-direction utilities", () => {
    for (const bad of ["ml-2", "mr-4", "pl-1", "pr-8", "text-left", "text-right", "left-0", "right-4", "rounded-l-md", "rounded-r-lg", "border-l", "border-r"]) {
      expect(findViolations(`<div className="flex ${bad} p-2" />`), bad).not.toHaveLength(0);
    }
  });

  it("accepts logical utilities", () => {
    for (const ok of ["ms-2", "me-4", "ps-1", "pe-8", "text-start", "text-end", "start-0", "end-4", "rounded-s-md", "border-s", "text-foreground", "bg-band"]) {
      expect(findViolations(`<div className="flex ${ok} p-2" />`), ok).toHaveLength(0);
    }
  });

  it("flags literal colours in class names but not anchors", () => {
    for (const bad of ["bg-white", "bg-black", "text-white", "text-black", "bg-[#fff]", "text-[#1a2b3c]", "border-[#00000080]"]) {
      expect(findViolations(`<div className="${bad}" />`), bad).not.toHaveLength(0);
    }
    expect(findViolations('<a href="#main" className="bg-band">skip</a>')).toHaveLength(0);
  });
});

describe("style guard (source files)", () => {
  const files = ROOTS.flatMap(sourceFiles);

  it("actually scans files", () => {
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.includes(`${path.sep}app${path.sep}`))).toBe(true);
  });

  it("uses no physical-direction utilities or literal colours", () => {
    const report = files.flatMap((file) =>
      findViolations(readFileSync(file, "utf8")).map((v) => `${path.relative(SRC, file)}:${v}`),
    );
    expect(report).toEqual([]);
  });
});
