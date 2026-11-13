import { defineConfig } from "@hey-api/openapi-ts";

// The SDK is generated from the Public API's OpenAPI document alone, so the public
// site never carries an Author operation. The document only exists while the
// backend runs with API_DOCS_ENABLED (default under DEBUG):
//   cd api && uv run python manage.py runserver
// then `pnpm generate:api` from here. Never hand-edit the generated folder.
export default defineConfig({
  input: process.env.BACKEND_SCHEMA_URL ?? "http://localhost:8000/api/schema/public/?format=json",
  output: {
    path: "src/sdk/generated",
    entryFile: true,
  },
  plugins: [
    {
      name: "@hey-api/sdk",
      operations: {
        strategy: "byTags",
      },
    },
    {
      enums: "typescript-const",
      name: "@hey-api/typescript",
    },
    {
      name: "@hey-api/client-next",
      exportFromIndex: true,
      runtimeConfigPath: "./src/sdk/client",
    },
  ],
});
