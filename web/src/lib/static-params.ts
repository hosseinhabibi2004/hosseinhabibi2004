import { locales } from "@/lib/locale";

export const EMPTY_SLUG = "_";

/**
 * `generateStaticParams` for a `[lng]/<section>/[slug]` route of the static export.
 *
 * Next passes each `[lng]` value to the child function and, when the child returns nothing for one
 * locale, keeps the bare `{ lng }` entry. Such an incomplete entry makes Next treat the whole
 * route as "missing generateStaticParams", so one locale without posts (or projects, or tags)
 * would fail the build for every locale.
 *
 * A locale without items therefore re-emits the `{ lng, slug }` pairs of a locale that has some.
 * Next merges them into the routes it already generates and removes the duplicates, so the
 * locale gets no page, no placeholder and nothing for the sitemap or the links to point at.
 * Only a site with no item in any locale still returns an empty list.
 */
export function staticSlugParams(
  lng: string,
  slugsOf: (lng: string) => string[],
): { lng?: string; slug: string }[] {
  const own = slugsOf(lng);
  if (own.length > 0) return own.map((slug) => ({ slug }));
  const donor = locales.find((l) => slugsOf(l).length > 0);
  return donor ? slugsOf(donor).map((slug) => ({ lng: donor, slug })) : [{ lng: locales[0], slug: EMPTY_SLUG }];
}
