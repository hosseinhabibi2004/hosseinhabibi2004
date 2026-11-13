import { defineConfig } from "@hey-api/openapi-ts";

// The SDK is generated from the Author API's OpenAPI document (sign-in and content
// writes), which only exists while the backend runs with API_DOCS_ENABLED (default under DEBUG):
//   cd backend && uv run python manage.py runserver
// then `pnpm generate:api` from here. Never hand-edit the generated folder.
export default defineConfig({
  input: process.env.BACKEND_SCHEMA_URL ?? "http://localhost:8000/api/schema/author/?format=json",
  output: {
    path: "src/api/backend/generated",
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
      runtimeConfigPath: "./src/api/backend/client",
    },
  ],
});
