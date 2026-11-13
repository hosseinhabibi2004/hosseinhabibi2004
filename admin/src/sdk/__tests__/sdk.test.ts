import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const types = readFileSync(join(__dirname, "..", "generated", "types.gen.ts"), "utf8");

function queryOf(typeName: string): string {
  const start = types.indexOf(`export type ${typeName} = {`);
  return types.slice(start, types.indexOf("\n};", start));
}

describe("the generated SDK documents the Author lists' deleted filter", () => {
  it.each([
    "AuthorPostsListData",
    "AuthorProjectsListData",
    "AuthorTagsListData",
    "AuthorSkillGroupsListData",
    "AuthorExperienceListData",
    "AuthorEducationListData",
    "AuthorImagesListData",
  ])("%s has an optional boolean `deleted` query parameter", (name) => {
    expect(queryOf(name)).toMatch(/deleted\?: boolean/);
  });
});
