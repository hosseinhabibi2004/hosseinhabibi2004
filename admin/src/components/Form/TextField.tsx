"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TextFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  description?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "decimal";
  /** Latin-script values (a slug, a code) read left-to-right inside an RTL form. */
  ltr?: boolean;
  multiline?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

/** A labelled text input (or textarea) bound to a react-hook-form field, with its error. */
export function TextField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  inputMode,
  ltr = false,
  multiline = false,
  autoComplete,
  disabled,
}: TextFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {multiline ? (
            <Textarea
              {...field}
              id={field.name}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />
          ) : (
            <Input
              {...field}
              id={field.name}
              placeholder={placeholder}
              inputMode={inputMode}
              autoComplete={autoComplete}
              disabled={disabled}
              dir={ltr ? "ltr" : undefined}
              className={ltr ? "text-start" : undefined}
              aria-invalid={fieldState.invalid}
            />
          )}
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
