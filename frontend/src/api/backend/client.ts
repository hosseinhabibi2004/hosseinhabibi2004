import { env } from "@/env";

import type { CreateClientConfig } from "./generated/client.gen";

// Server-side only: the site reads the API at build time, never in the browser.
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: env.BACKEND_API_URL,
});
