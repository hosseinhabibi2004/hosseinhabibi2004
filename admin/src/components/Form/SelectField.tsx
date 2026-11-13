"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

import { OptionSelect, type Option } from "@/components/OptionSelect";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

interface SelectFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: Path<TValues>;
  label: string;
  options: readonly Option<string>[];
  description?: string;
  placeholder?: string;
  /** Runs after the field changes — for a choice that sets another field. */
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

/** A labelled single choice bound to a string react-hook-form field. */
export function SelectField<TValues extends FieldValues>({
  control,
  name,
  label,
  options,
  description,
  placeholder,
  onValueChange,
  disabled = false,
}: SelectFieldProps<TValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <OptionSelect
            id={field.name}
            value={typeof field.value === "string" ? field.value : ""}
            onChange={(next) => {
              field.onChange(next);
              onValueChange?.(next);
            }}
            options={options}
            placeholder={placeholder}
            className="w-full"
            aria-label={label}
            disabled={disabled}
          />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
