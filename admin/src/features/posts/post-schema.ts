import type { TFunction } from "i18next";
import { z } from "zod";

export const LOCALES = ["en", "fa"] as const;
export type Locale = (typeof LOCALES)[number];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const translation = z.object({
  title: z.string(),
  summary: z.string(),
  body: z.string(),
  published: z.boolean(),
});

/** What the Post form edits; a published language must have a title and a body. */
export function createPostSchema(t: TFunction<"posts">) {
  return z
    .object({
      slug: z.string().trim().min(1, t("form.slugRequired")).regex(SLUG, t("form.slugInvalid")),
      translations: z.object({ en: translation, fa: translation }),
      coverFile: z.custom<File | null>(),
      coverAlt: z.object({ en: z.string(), fa: z.string() }),
    })
    .superRefine((values, context) => {
      for (const locale of LOCALES) {
        const row = values.translations[locale];
        if (row.published && (!row.title.trim() || !row.body.trim())) {
          context.addIssue({
            code: "custom",
            path: ["translations", locale, "published"],
            message: t("form.publishError"),
          });
        }
      }
    });
}

export type PostFormValues = z.input<ReturnType<typeof createPostSchema>>;
export type PostFormOutput = z.output<ReturnType<typeof createPostSchema>>;

/** Whether a language row has anything in it; an untouched language is not sent. */
export function hasContent(row: PostFormValues["translations"][Locale]): boolean {
  return row.published || Boolean(row.title.trim() || row.summary.trim() || row.body.trim());
}

/** The status a language row is in: nothing written, a draft, or published. */
export function rowStatus(row: PostFormValues["translations"][Locale]) {
  if (row.published) return "published" as const;
  return hasContent(row) ? ("draft" as const) : ("empty" as const);
}
