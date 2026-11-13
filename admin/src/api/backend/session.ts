import { applyCsrfHeader } from "@/lib/csrf";

import { Auth } from "./generated";
import { client } from "./generated/client.gen";

// The CSRF token for the current session. It lives in memory: a page reload
// asks the API for a fresh one (`loadCsrfToken`), and signing in rotates it.
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export async function loadCsrfToken(): Promise<void> {
  const { data } = await Auth.authCsrf();
  setCsrfToken(data?.result.csrf_token ?? null);
}

client.interceptors.request.use((options) => {
  applyCsrfHeader(options.method, options.headers as Headers, csrfToken);
});
