import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // next-i18next's client entry imports `next/navigation` without a file extension,
    // which Node's ESM resolver rejects when the package is left external; inlining
    // lets Vite resolve it.
    server: { deps: { inline: ["next-i18next"] } },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
