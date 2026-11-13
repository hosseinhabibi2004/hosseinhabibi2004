import type { TFunction } from "i18next";

/** The envelope an API error comes back in: `{success: false, message, result: {error_detail}}`. */
interface ErrorEnvelope {
  message?: string;
  result?: { error_detail?: Record<string, unknown> };
}

function envelope(error: unknown): ErrorEnvelope {
  return error && typeof error === "object" ? (error as ErrorEnvelope) : {};
}

/** The API's message code (`GENERIC_004`), or null when the error is not one of its envelopes. */
export function messageCode(error: unknown): string | null {
  const { message } = envelope(error);
  return typeof message === "string" ? message : null;
}

/** Field-level messages from a validation error: the first message per field. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  const detail = envelope(error).result?.error_detail ?? {};
  const found: Record<string, string> = {};
  for (const [field, value] of Object.entries(detail)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") found[field] = first;
  }
  return found;
}

/** A sentence for an error that could not be pinned to a field, in the interface language. */
export function errorText(error: unknown, t: TFunction<"common">): string {
  const code = messageCode(error);
  if (code === "AUTH_002") return t("errors.invalidCredentials");
  if (code === "AUTH_041" || code === "AUTH_042") return t("errors.notAllowed");
  return t("errors.generic");
}
