import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const COMPONENTS = join(__dirname, "..");
const FOLDERS = ["ui", ".", "data-table", "rich-text"];

function componentFiles(folder: string): string[] {
  const dir = join(COMPONENTS, folder);
  return readdirSync(dir).filter(
    (name) => /\.tsx$/.test(name) && !/\.(stories|test)\.tsx$/.test(name),
  ).map((name) => join(dir, name));
}

describe("every UI and shared component has a story", () => {
  it("finds components to check", () => {
    expect(FOLDERS.flatMap(componentFiles).length).toBeGreaterThanOrEqual(30);
  });

  it.each(FOLDERS)("in components/%s", (folder) => {
    const missing = componentFiles(folder).filter((file) => !existsSync(file.replace(/\.tsx$/, ".stories.tsx")));

    expect(missing).toEqual([]);
  });
});
