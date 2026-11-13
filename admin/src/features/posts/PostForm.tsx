"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";

import { FormErrorAlert } from "@/components/FormErrorAlert";
import { applyApiError } from "@/components/Form/applyApiError";
import { SwitchField } from "@/components/Form/SwitchField";
import { TextField } from "@/components/Form/TextField";
import { useAppForm } from "@/components/Form/useAppForm";
import { PageHeader } from "@/components/PageHeader";
import { RichTextEditor } from "@/components/rich-text/RichTextEditor";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoverImageField } from "@/features/posts/CoverImageField";
import {
  createPostSchema,
  hasContent,
  LOCALES,
  rowStatus,
  type Locale,
  type PostFormOutput,
  type PostFormValues,
} from "@/features/posts/post-schema";
import { useT } from "@/i18n/client";
import { Author } from "@/sdk/generated";
import type { LocaleEnum, Post, StatusEnum } from "@/sdk/generated";

const EMPTY_ROW = { title: "", summary: "", body: "", published: false };

function defaultsFor(post?: Post): PostFormValues {
  const row = (locale: Locale) => {
    const found = post?.translations.find((entry) => entry.locale === locale);
    return found
      ? {
          title: found.title,
          summary: found.summary ?? "",
          body: found.body ?? "",
          published: found.status === "published",
        }
      : EMPTY_ROW;
  };
  return {
    slug: post?.slug ?? "",
    translations: { en: row("en"), fa: row("fa") },
    coverFile: null,
    coverAlt: { en: "", fa: "" },
  };
}

/** Creates a post, or edits `post`: a slug, a cover, and one tab of text per language. */
export function PostForm({ post }: { post?: Post }) {
  const { t } = useT("posts");
  const { t: tc } = useT("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const schema = useMemo(() => createPostSchema(t), [t]);
  const form = useAppForm<PostFormValues, PostFormOutput>(schema, { defaultValues: defaultsFor(post) });
  const [tab, setTab] = useState<Locale>("en");
  const [formError, setFormError] = useState<string | null>(null);
  const watched = form.watch("translations");

  async function save(values: PostFormOutput) {
    setFormError(null);
    let cover: string | null = post?.cover_image ?? null;

    if (values.coverFile) {
      const upload = await Author.authorImagesCreate({ body: { file: values.coverFile } });
      if (upload.error || !upload.data) return setFormError(t("form.coverFailed"));
      cover = upload.data.result.uuid;
      const alts = LOCALES.filter((locale) => values.coverAlt[locale].trim()).map((locale) => ({
        locale: locale as LocaleEnum,
        alt: values.coverAlt[locale].trim(),
      }));
      if (alts.length > 0) {
        const patch = await Author.authorImagesPartialUpdate({
          path: { uuid: cover },
          body: { translations: alts },
        });
        if (patch.error) return setFormError(t("form.coverFailed"));
      }
    }

    const body = {
      slug: values.slug,
      cover_image: cover,
      translations: LOCALES.filter((locale) => hasContent(values.translations[locale])).map((locale) => ({
        locale: locale as LocaleEnum,
        title: values.translations[locale].title,
        summary: values.translations[locale].summary,
        body: values.translations[locale].body,
        status: (values.translations[locale].published ? "published" : "draft") as StatusEnum,
      })),
    };
    const result = post
      ? await Author.authorPostsPartialUpdate({ path: { uuid: post.uuid }, body })
      : await Author.authorPostsCreate({ body });
    if (result.error) {
      return setFormError(applyApiError(form, result.error, tc, { fields: { slug: "slug" } }));
    }
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    toast.success(t("form.saved"));
    router.push("/posts");
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(save, (errors) => {
        // Open the first language tab that holds an error, so the message is in view.
        const bad = LOCALES.find((locale) => errors.translations?.[locale]);
        if (bad) setTab(bad);
      })}
      className="flex max-w-3xl flex-col gap-6"
    >
      <PageHeader title={post ? t("form.editTitle") : t("form.newTitle")} />
      {formError ? <FormErrorAlert message={formError} /> : null}
      <TextField control={form.control} name="slug" label={t("form.slug")} description={t("form.slugHint")} ltr />
      <CoverImageField control={form.control} hasCover={Boolean(post?.cover_image)} />

      <Tabs value={tab} onValueChange={(next) => setTab(next as Locale)}>
        <TabsList aria-label={t("form.tabs")}>
          {LOCALES.map((locale) => (
            <TabsTrigger key={locale} value={locale} className="gap-2 data-active:[&_[data-slot=badge]]:border-border data-active:[&_[data-slot=badge]]:bg-background data-active:[&_[data-slot=badge]]:text-foreground">
              {tc(`languages.${locale}`)}
              <StatusBadge locale={locale} status={rowStatus(watched[locale])} />
            </TabsTrigger>
          ))}
        </TabsList>
        {LOCALES.map((locale) => (
          <TabsContent key={locale} value={locale} className="flex flex-col gap-4 pt-2">
            <TextField control={form.control} name={`translations.${locale}.title`} label={t("form.title")} />
            <TextField
              control={form.control}
              name={`translations.${locale}.summary`}
              label={t("form.summary")}
              multiline
            />
            <Controller
              control={form.control}
              name={`translations.${locale}.body`}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("form.body")}</FieldLabel>
                  <RichTextEditor value={field.value} onChange={field.onChange} label={t("form.body")} />
                </Field>
              )}
            />
            <SwitchField control={form.control} name={`translations.${locale}.published`} label={t("form.published")} />
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? t("form.saving") : t("form.save")}
        </Button>
      </div>
    </form>
  );
}
