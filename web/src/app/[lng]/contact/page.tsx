import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { EmptyState } from "@/components/EmptyState";
import { Section } from "@/components/Section";
import { SocialIcon } from "@/components/SocialIcon";
import { getProfile, getTwinPaths } from "@/lib/content";
import { isLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ lng: string }>;

const ICON_BUTTON =
  "inline-flex size-14 items-center justify-center rounded-sm border-2 border-foreground transition-colors hover:bg-foreground hover:text-background";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("contact", { lng });
  return buildMetadata({
    lng,
    path: `/${lng}/contact/`,
    title: t("metaTitle"),
    description: t("text"),
    twinPath: getTwinPaths(lng)[`/${lng}/contact/`] ?? null,
  });
}

export default async function ContactPage({ params }: { params: Params }) {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("contact", { lng });
  const profile = getProfile(lng);
  const links = profile?.links ?? [];

  return (
    <Section className="py-16 md:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <h1 className="flex flex-col gap-2 text-4xl leading-tight tracking-tight md:text-6xl">
          <span className="font-normal">{t("lead")}</span>
          <span className="font-extrabold">{t("strong")}</span>
        </h1>
        <p className="text-lg text-muted-foreground">{t("text")}</p>
        {!profile?.email && links.length === 0 ? <EmptyState title={t("missing")} /> : null}
        {profile?.email ? (
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex h-14 items-center gap-2 rounded-sm bg-foreground px-5 text-xl font-semibold text-background"
          >
            <Mail aria-hidden className="size-5" />
            <span dir="ltr">{profile.email}</span>
          </a>
        ) : null}
        {links.length > 0 ? (
          <ul className="flex flex-wrap items-center justify-center gap-4" aria-label={t("profiles")}>
            {links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  rel="me noopener noreferrer"
                  target="_blank"
                  aria-label={link.kind}
                  className={ICON_BUTTON}
                >
                  <SocialIcon kind={link.kind} className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  );
}
