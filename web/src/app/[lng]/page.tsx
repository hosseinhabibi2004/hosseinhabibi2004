import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";
import { Suspense } from "react";

import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown/Markdown";
import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";
import { SocialIcon } from "@/components/SocialIcon";
import {
  getExperience,
  getProfile,
  getProjects,
  getSkills,
  getTwinPaths,
} from "@/lib/content";
import { formatDate } from "@/lib/format";
import { isLocale } from "@/lib/locale";
import { buildMetadata, personJsonLd } from "@/lib/seo";
import { assetPath } from "@/lib/site";

type Params = Promise<{ lng: string }>;

const ICON_BUTTON =
  "inline-flex size-14 items-center justify-center rounded-sm border-2 border-foreground transition-colors hover:bg-foreground hover:text-background";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("common", { lng });
  const profile = getProfile(lng);
  return buildMetadata({
    lng,
    path: `/${lng}/`,
    title: profile?.headline || undefined,
    description: profile?.summary || t("siteDescription"),
    twinPath: getTwinPaths(lng)[`/${lng}/`] ?? null,
  });
}

export default async function Home({ params }: { params: Params }) {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("home", { lng });
  const { t: tc } = await getT("common", { lng });

  const profile = getProfile(lng);
  const skills = getSkills(lng);
  const experience = getExperience(lng);
  const allProjects = getProjects(lng);
  const featured = allProjects.filter((p) => p.featured);
  const projects = (featured.length > 0 ? featured : allProjects).slice(0, featured.length > 0 ? undefined : 3);
  const links = profile?.links ?? [];
  const summaryParagraphs = (profile?.summary ?? "").split(/\n+/).filter(Boolean);

  return (
    <>
      {profile ? <JsonLd data={personJsonLd(profile, lng)} /> : null}

      <Section className="py-10 md:py-15">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 text-4xl leading-tight tracking-tight md:text-5xl">
              <h1 className="flex flex-wrap items-baseline gap-x-4">
                {profile ? (
                  <>
                    <span className="font-normal">{t("hero.greeting")}</span>
                    <span className="font-extrabold">{profile.name}</span>
                  </>
                ) : (
                  <span className="font-extrabold">{tc("siteName")}</span>
                )}
              </h1>
              {profile ? (
                <>
                  <p className="font-extrabold" dir="auto">
                    {profile.headline}
                  </p>
                  {profile.location ? (
                    <p className="flex flex-wrap items-baseline gap-x-4">
                      <span className="font-normal">{t("hero.basedIn")}</span>
                      <span className="font-extrabold" dir="auto">
                        {profile.location}
                      </span>
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-base font-normal text-muted-foreground">
                  {t("meta.missingProfile")}
                </p>
              )}
            </div>
            {profile?.summary ? (
              <p className="max-w-xl text-muted-foreground" dir="auto">
                {profile.summary}
              </p>
            ) : null}
            {links.length > 0 ? (
              <ul className="flex flex-wrap gap-4" aria-label={t("hero.links")}>
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
          <div className="overflow-hidden rounded-lg bg-paper p-4 text-paper-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export: images are not optimised */}
            <img
              src={assetPath("/illustrations/hero.svg")}
              alt={t("hero.illustrationAlt")}
              width={889}
              height={596}
              className="h-auto w-full"
            />
          </div>
        </div>
      </Section>

      {skills.length > 0 ? (
        <Section id="skills">
          <SectionHeading lead={t("skills.lead")} strong={t("skills.strong")} />
          <div className="mt-5 flex flex-col gap-10">
            {skills.map((group) => (
              <div key={group.title}>
                <h3 className="mb-5 text-center text-xl font-bold tracking-tight">{group.title}</h3>
                <ul className="flex flex-wrap justify-center gap-5">
                  {group.skills.map((skill) => (
                    <li
                      key={skill.name}
                      className="flex min-h-28 w-[calc(50%-0.625rem)] items-center sm:w-44 justify-center rounded-sm border-2 border-foreground p-6 text-center text-lg font-bold tracking-tight transition-colors hover:bg-foreground hover:text-background"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {experience.length > 0 ? (
        <Section id="experience" band>
          <SectionHeading lead={t("experience.lead")} strong={t("experience.strong")} />
          <div className="mt-5 flex flex-col gap-8">
            {experience.map((item) => (
              <article
                key={`${item.company}-${item.start_date}`}
                className="rounded-[10px] border border-band-foreground/30 px-6 py-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight" dir="auto">
                      {item.role}
                    </h3>
                    <p className="mt-1 text-band-foreground/80">
                      {item.company_url ? (
                        <a
                          href={item.company_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4"
                        >
                          {item.company}
                        </a>
                      ) : (
                        <span>{item.company}</span>
                      )}
                      {item.location ? <span aria-hidden> · </span> : null}
                      {item.location ? <span>{item.location}</span> : null}
                    </p>
                  </div>
                  <p className="font-semibold text-band-foreground/80">
                    <time dateTime={item.start_date}>{formatDate(item.start_date, lng, "short")}</time>
                    <span aria-hidden> – </span>
                    {item.end_date ? (
                      <time dateTime={item.end_date}>{formatDate(item.end_date, lng, "short")}</time>
                    ) : (
                      <span>{t("experience.present")}</span>
                    )}
                  </p>
                </div>
                {/* Light-on-dark tokens for the Markdown body, in both themes. */}
                <div className="dark mt-4 [--font-serif:var(--font-sans)] [&_.md]:text-base [&_.md]:leading-6">
                  <Suspense fallback={null}>
                    <Markdown
                      source={item.description}
                      copyLabel={t("markdown.copy")}
                      copiedLabel={t("markdown.copied")}
                    />
                  </Suspense>
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <Section id="about">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="rounded-lg border-2 border-paper-foreground bg-paper p-4 text-paper-foreground md:max-w-[34rem]">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export: images are not optimised */}
            <img
              src={assetPath("/illustrations/about.svg")}
              alt={t("about.illustrationAlt")}
              width={530}
              height={572}
              loading="lazy"
              className="mx-auto h-auto w-full"
            />
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="flex flex-wrap items-baseline gap-x-4 text-4xl leading-tight tracking-tight md:text-5xl">
              <span className="font-normal">{t("about.lead")}</span>
              <span className="font-extrabold">{t("about.strong")}</span>
            </h2>
            {summaryParagraphs.map((p) => (
              <p key={p} className="text-muted-foreground" dir="auto">
                {p}
              </p>
            ))}
            <Link href={`/${lng}/about/`} className="font-semibold underline underline-offset-4">
              {t("about.more")}
            </Link>
          </div>
        </div>
      </Section>

      {projects.length > 0 ? (
        <Section id="projects" band>
          <SectionHeading lead={t("projects.lead")} strong={t("projects.strong")} />
          {/* Light-on-dark tokens inside the band, in both themes. */}
          <div className="dark mt-5 flex flex-col gap-16 text-foreground md:[&>article:nth-child(even)>*:first-child]:order-2">
            {projects.map((project, index) => (
              <ProjectCard key={project.slug} lng={lng} project={project} index={index} />
            ))}
          </div>
          <p className="mt-10 text-center">
            <Link href={`/${lng}/projects/`} className="font-semibold underline underline-offset-4">
              {t("projects.all")}
            </Link>
          </p>
        </Section>
      ) : null}

      <Section id="contact">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="flex flex-col gap-2 text-4xl leading-tight tracking-tight md:text-5xl">
            <span className="font-normal">{t("contact.lead")}</span>
            <span className="font-extrabold">{t("contact.strong")}</span>
          </h2>
          <p className="text-muted-foreground">{t("contact.text")}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {profile?.email ? (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex h-14 items-center gap-2 rounded-sm bg-foreground px-5 text-xl font-semibold text-background"
              >
                <Mail aria-hidden className="size-5" />
                <span dir="ltr">{profile.email}</span>
              </a>
            ) : null}
            {links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                rel="me noopener noreferrer"
                target="_blank"
                aria-label={link.kind}
                className={ICON_BUTTON}
              >
                <SocialIcon kind={link.kind} className="size-5" />
              </a>
            ))}
          </div>
          <Link href={`/${lng}/contact/`} className="font-semibold underline underline-offset-4">
            {t("contact.button")}
          </Link>
        </div>
      </Section>
    </>
  );
}
