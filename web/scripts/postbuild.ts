// Runs after `next build` (the `postbuild` script): removes the inert placeholder pages the build
// emits for a section with no items in any locale (see src/lib/static-params.ts), so no junk page
// ships. A no-op when every section has content.
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname, "../out");
const SECTIONS = ["posts", "projects", "tags"];
const EMPTY_SLUG = "_";

export function removePlaceholders(out: string): string[] {
  const removed: string[] = [];
  if (!existsSync(out)) return removed;
  const locales = readdirSync(out, { withFileTypes: true }).filter((e) => e.isDirectory() && /^[a-z]{2}$/.test(e.name));
  for (const { name: lng } of locales) {
    for (const section of SECTIONS) {
      const dir = path.join(out, lng, section);
      if (!existsSync(dir)) continue;
      for (const entry of readdirSync(dir)) {
        if (entry === EMPTY_SLUG || entry.startsWith(`${EMPTY_SLUG}.`) || entry.startsWith(`__next.${EMPTY_SLUG}.`)) {
          const target = path.join(dir, entry);
          rmSync(target, { recursive: true, force: true });
          removed.push(path.relative(out, target));
        }
      }
    }
  }
  return removed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  const removed = removePlaceholders(OUT);
  if (removed.length) console.log(`postbuild: removed ${removed.join(", ")}`);
  if (!existsSync(path.join(OUT, "404.html"))) {
    console.error("postbuild: out/404.html is missing");
    process.exit(1);
  }
}
