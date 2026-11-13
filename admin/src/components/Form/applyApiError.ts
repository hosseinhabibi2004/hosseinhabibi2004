import type { TFunction } from "i18next";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { apiFieldErrors, errorText } from "@/lib/api-errors";

interface ApplyApiErrorOptions<TInput extends FieldValues> {
  /** API field name → form field (`first_name` → `firstName`). */
  fields?: Readonly<Record<string, Path<TInput>>>;
}

/**
 * Puts a failed request's validation messages under the inputs they belong to.
 *
 * Returns the sentence for whatever could *not* be pinned to a field, so the caller
 * can show it once (an alert above the form, or a toast); `null` means every message
 * found a field.
 */
export function applyApiError<TInput extends FieldValues, TOutput extends FieldValues>(
  form: UseFormReturn<TInput, unknown, TOutput>,
  error: unknown,
  t: TFunction<"common">,
  { fields = {} }: ApplyApiErrorOptions<TInput> = {},
): string | null {
  let pinned = 0;
  for (const [field, message] of Object.entries(apiFieldErrors(error))) {
    const name = fields[field];
    if (name === undefined) continue;
    form.setError(name, { type: "server", message });
    pinned += 1;
  }
  return pinned > 0 ? null : errorText(error, t);
}
