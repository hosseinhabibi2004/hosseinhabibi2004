import { env } from "@/env";

import type { CreateClientConfig } from "./generated/client.gen";

// The session cookie belongs to the API's origin, so every call carries it.
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});
