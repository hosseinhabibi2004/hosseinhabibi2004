import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The interface is right-to-left . Two things go wrong in an RTL port:
 *
 * 1. A directional icon (`ChevronLeft`, `ArrowRight` …) keeps pointing the LTR way. Every
 *    use must mirror (`rtl:-scale-x-100`, `rtl:rotate-180`) or say why not with `data-no-mirror`.
 * 2. A physical utility (`left-2`, `ml-3`, `pr-4`, `text-left`) pins something to a side that
 *    should follow the reading direction. Use the logical ones (`start-`, `ms-`, `pe-`,
 *    `text-start`). A physical one stays only with an inline `// rtl-ok: <reason>`.
 */
const SRC = join(__dirname, "..", "..");
const ICONS = /\b(ChevronLeft|ChevronRight|ChevronsLeft|ChevronsRight|ArrowLeft|ArrowRight|CaretLeft|CaretRight|MoveLeft|MoveRight|Undo2?|Redo2?|CornerDownLeft|CornerDownRight|ArrowLeftRight|ArrowBigLeft|ArrowBigRight)\b/;
const PHYSICAL =
  /(?<![\w:-])(?:-?(?:left|right)-(?:\d|\[|px|full|1\/2)|(?:ml|mr|pl|pr|scroll-ml|scroll-mr|scroll-pl|scroll-pr|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br)(?:-[\w[\].]+)?|text-(?:left|right)|float-(?:left|right)|origin-(?:left|right))(?![\w-])/g;

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") return [];
      if (name === "generated" && path.includes(`${sep}sdk${sep}`)) return [];
      return sources(path);
    }
    return /\.tsx$/.test(name) ? [path] : [];
  });
}

const files = sources(SRC).map((file) => ({
  rel: relative(SRC, file).split(sep).join("/"),
  lines: readFileSync(file, "utf8").split("\n"),
}));

describe("right-to-left rules", () => {
  it("mirrors, or explains, every directional icon", () => {
    const offenders: string[] = [];
    for (const { rel, lines } of files) {
      lines.forEach((line, i) => {
        if (/^\s*import\b/.test(line) || /^\s*(?:\/\/|\*)/.test(line)) return;
        const icon = line.match(ICONS);
        if (!icon) return;
        // The element may span a few lines; look at the usage line and the next two.
        const window = lines.slice(i, i + 3).join(" ");
        if (/rtl:(?:-?scale-x|rotate)|data-no-mirror|rtl-ok:/.test(window)) return;
        // A bare reference in a table (`{ icon: ChevronLeft }`) is mirrored where it is rendered.
        if (!/<\w*/.test(line) && !/\bcreateElement\b/.test(line)) return;
        offenders.push(`${rel}:${i + 1} ${icon[1]}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("uses logical, not physical, side utilities unless the line says `rtl-ok:`", () => {
    const offenders: string[] = [];
    for (const { rel, lines } of files) {
      lines.forEach((line, i) => {
        if (/rtl-ok:/.test(line) || (i > 0 && /rtl-ok:/.test(lines[i - 1]))) return;
        for (const match of line.matchAll(PHYSICAL)) offenders.push(`${rel}:${i + 1} ${match[0]}`);
      });
    }
    expect(offenders).toEqual([]);
  });

  it("catches a physical utility and an unmirrored icon (a sample that must be reported)", () => {
    expect(["ml-3", "pr-4", "text-left", "left-2", "rounded-l-md"].every((c) => `${c}`.match(PHYSICAL))).toBe(true);
    expect(`<ChevronLeft className="size-4" />`.match(ICONS)).not.toBeNull();
    expect("ms-3 pe-4 text-start start-2 rounded-s-md".match(PHYSICAL)).toBeNull();
  });
});
