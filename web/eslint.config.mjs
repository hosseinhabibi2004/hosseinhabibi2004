import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Never hand-edited or lint-worthy — codegen output (api-services.md, api-04).
    "**/generated/**",
  ]),
  // The generated SDK is for the snapshot script only; pages read src/lib/content.
  {
    files: ["**/*.{ts,tsx,mts}"],
    ignores: ["scripts/**", "src/sdk/**", "src/lib/content/types.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/sdk", "@/sdk/**", "**/sdk/generated", "**/sdk/generated/**"],
              message:
                "The generated SDK runs only in scripts/ (pnpm sync). Read content through @/lib/content.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
