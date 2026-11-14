import path from "node:path";

import { defineConfig } from "vitest/config";

// Runs only `scripts/verify-export.ts` (`pnpm verify:export`). The default config (`pnpm test`)
// never picks it up: its name does not match the `*.test.*` pattern.
export default defineConfig({
  test: {
    environment: "node",
    include: ["scripts/verify-export.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
