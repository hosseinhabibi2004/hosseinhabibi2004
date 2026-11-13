"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { ZodType } from "zod";

/**
 * The one way a form is built here (`pat-05`): React Hook Form bound to a Zod
 * schema, which stays the single source of truth for validation (`con-03`).
 *
 * A schema whose messages need translating is a `createXSchema(t)` factory the
 * caller memoises on `t` — this wrapper only pairs it with the resolver.
 *
 * Validation runs on submit, then again on every change: an error appears
 * when the person asks to save and clears as they fix it. It never appears
 * because a field lost focus, since an error line that pops in under a finger
 * moves the controls below it and swallows the tap that was aimed at one.
 *
 * The two type parameters are Zod's own: `TInput` is what the fields hold while
 * being edited, `TOutput` what the schema produces on a valid submit. They
 * differ whenever a field coerces — a numeric `Input` bound to a text box.
 */
export function useAppForm<TInput extends FieldValues, TOutput extends FieldValues>(
  schema: ZodType<TOutput, TInput>,
  options?: Omit<UseFormProps<TInput, unknown, TOutput>, "resolver">,
): UseFormReturn<TInput, unknown, TOutput> {
  return useForm<TInput, unknown, TOutput>({
    ...options,
    mode: options?.mode ?? "onSubmit",
    resolver: zodResolver(schema),
  });
}
