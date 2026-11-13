import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..", "..");
const css = readFileSync(join(__dirname, "..", "globals.css"), "utf8");

/** Spacing utilities with a fractional step or an arbitrary `[...]` value. */
const OFF_SCALE =
  /(?<![\w-])-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end|scroll-[mp][xytrblse]?)-(\d+\.\d+|\[[^\]\s]*\])(?![\w.-])/g;
const SAFE_AREA = /^\[env\(safe-area-inset-(top|right|bottom|left)\)\]$/;

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") return [];
      if (name === "generated" && path.includes(`${sep}sdk${sep}`)) return [];
      return sources(path);
    }
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe("the spacing scale (4 px base)", () => {
  it("declares a 4px base", () => {
    expect(css).toMatch(/--spacing:\s*0\.25rem;/);
  });

  it("uses only whole steps: no half-steps and no arbitrary spacing values", () => {
    const offenders: string[] = [];
    for (const file of sources(SRC)) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          for (const match of line.matchAll(OFF_SCALE)) {
            if (SAFE_AREA.test(match[1])) continue;
            offenders.push(`${relative(SRC, file)}:${index + 1} ${match[0]}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });

  /**
   * Plan 6, C2: size utilities and inline styles. Arbitrary sizes are allowed only when
   * they are built from the scale's own tokens (`var(--spacing-quarter-hour)`, `var(--spacing)`),
   * a viewport/container unit, a percentage or `env(safe-area-inset-*)`.
   */
  it("keeps arbitrary sizes (h-[…], w-[…], min-h-[…], size-[…]) on tokens or relative units", () => {
    const SIZE = /(?<![\w-])(?:min-|max-)?(?:h|w|size)-\[([^\]\s]*)\]/g;
    const ALLOWED =
      /var\(--[\w-]*spacing[\w-]*\)|env\(safe-area-inset-[a-z]+\)|^\d+(?:\.\d+)?(?:%|vh|vw|dvh|svh|lvh|cqw|cqh|ch|em|rem)$|^calc\(.*(?:var\(--|%|dvh|vh|vw).*\)$|^var\(--[\w-]+\)$|^--[\w-]+/;
    const offenders: string[] = [];
    for (const file of sources(SRC)) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          for (const match of line.matchAll(SIZE)) {
            if (ALLOWED.test(match[1])) continue;
            offenders.push(`${relative(SRC, file)}:${index + 1} ${match[0]}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });

  it("keeps inline spacing styles (padding, margin, gap, top, left…) on the 4px scale", () => {
    const STYLE = /\b(padding|margin|gap|rowGap|columnGap|top|right|bottom|left)(Top|Right|Bottom|Left|Inline|Block)?\s*:\s*(-?\d+(?:\.\d+)?)\s*[,}\n]/g;
    const offenders: string[] = [];
    for (const file of sources(SRC)) {
      if (!file.endsWith(".tsx")) continue;
      const text = readFileSync(file, "utf8");
      for (const block of text.matchAll(/style=\{\{([^}]*)\}\}/g)) {
        for (const m of `${block[1]}\n`.matchAll(STYLE)) {
          const value = Number(m[3]);
          if (value === 0 || value % 4 === 0) continue;
          offenders.push(`${relative(SRC, file)} ${m[0].trim()}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
