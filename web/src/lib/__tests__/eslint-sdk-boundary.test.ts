// @vitest-environment node
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({ cwd: process.cwd() });

async function rules(code: string, filePath: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map((m) => m.ruleId ?? "");
}

describe("SDK import boundary", () => {
  it("rejects the alias import in a page", async () => {
    const found = await rules(
      'import { PostsService } from "@/sdk/generated";\nexport default PostsService;\n',
      "src/app/[lng]/x.tsx",
    );
    expect(found).toContain("no-restricted-imports");
  });

  it("rejects a relative import in a page", async () => {
    const found = await rules(
      'import { PostsService } from "../../sdk/generated";\nexport default PostsService;\n',
      "src/app/[lng]/x.tsx",
    );
    expect(found).toContain("no-restricted-imports");
  });

  it("allows the import in scripts/", async () => {
    const found = await rules(
      'import { PostsService } from "@/sdk/generated";\nexport default PostsService;\n',
      "scripts/x.ts",
    );
    expect(found).not.toContain("no-restricted-imports");
  });
});
