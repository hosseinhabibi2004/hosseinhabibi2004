const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

/** Django rejects an unsafe request from a signed-in session without the CSRF
 *  token in `X-CSRFToken`. Safe methods never carry it. */
export function applyCsrfHeader(
  method: string | undefined,
  headers: Headers,
  token: string | null,
): void {
  if (!token) return;
  if (SAFE_METHODS.has((method ?? "GET").toUpperCase())) return;
  headers.set("X-CSRFToken", token);
}
