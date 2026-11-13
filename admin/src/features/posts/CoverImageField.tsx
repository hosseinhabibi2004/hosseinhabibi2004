"use client";

import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LOCALES, type PostFormValues } from "@/features/posts/post-schema";
import { useT } from "@/i18n/client";

/** The cover: a file to upload on save, and its alt text in each language. */
export function CoverImageField({
  control,
  hasCover,
}: {
  control: Control<PostFormValues>;
  /** The post already has a cover; choosing a file replaces it. */
  hasCover: boolean;
}) {
  const { t } = useT("posts");
  const { t: tc } = useT("common");

  return (
    <div className="flex flex-col gap-3">
      <Controller
        control={control}
        name="coverFile"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="cover-image">{t("form.coverImage")}</FieldLabel>
            <Input
              id="cover-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
            />
            <FieldDescription>{hasCover ? t("form.coverCurrent") : t("form.coverHint")}</FieldDescription>
          </Field>
        )}
      />
      {LOCALES.map((locale) => (
        <Controller
          key={locale}
          control={control}
          name={`coverAlt.${locale}`}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t("form.altText", { language: tc(`languages.${locale}`) })}
              </FieldLabel>
              <Input {...field} id={field.name} dir="auto" />
            </Field>
          )}
        />
      ))}
    </div>
  );
}
