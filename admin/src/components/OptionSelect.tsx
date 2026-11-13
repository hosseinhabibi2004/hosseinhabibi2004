"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Option<TValue extends string> {
  value: TValue;
  label: string;
}

/**
 * A single choice from a list, with the chosen option's *label* in the
 * trigger (the bare `Select` would print the raw value). `value` is a string;
 * map numeric ids at the call site.
 */
export function OptionSelect<TValue extends string>({
  value,
  onChange,
  options,
  placeholder,
  id,
  className,
  "aria-label": ariaLabel,
  disabled = false,
}: {
  value: TValue;
  onChange: (value: TValue) => void;
  options: readonly Option<TValue>[];
  placeholder?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  disabled?: boolean;
}) {
  const items = options.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  return (
    <Select
      items={items}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        const match = options.find((option) => option.value === next);
        if (match) onChange(match.value);
      }}
    >
      <SelectTrigger id={id} className={className} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
