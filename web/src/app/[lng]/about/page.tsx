import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";

import { EmptyState } from "@/components/EmptyState";
import { ExperienceItem } from "@/components/ExperienceItem";
import { Section } from "@/components/Section";
import { SectionHeading } from "@/components/SectionHeading";
import { SkillGroup } from "@/components/SkillGroup";
import {
  getEducation,
  getExperience,
  getProfile,
  getSkills,
  getTwinPaths,
} from "@/lib/content";
import { formatDate } from "@/lib/format";
import { isLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ lng: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("about", { lng });
  const profile = getProfile(lng);
  return buildMetadata({
    lng,
    path: `/${lng}/about/`,
    title: t("metaTitle"),
    description: profile?.summary || undefined,
    twinPath: getTwinPaths(lng)[`/${lng}/about/`] ?? null,
  });
}

export default async function AboutPage({ params }: { params: Params }) {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();
  const { t } = await getT("about", { lng });

  const profile = getProfile(lng);
  const experience = getExperience(lng);
  const education = getEducation(lng);
  const skills = getSkills(lng);
  const paragraphs = (profile?.summary ?? "").split(/\n+/).filter(Boolean);
  const nothing = !profile && experience.length + education.length + skills.length === 0;

  return (
    <>
      <Section className="pb-5">
        <h1 className="flex flex-wrap items-baseline justify-center gap-x-4 py-5 text-center text-4xl leading-tight tracking-tight md:text-5xl">
          <span className="font-normal">{t("title")}</span>
          <span className="font-extrabold">{t("titleStrong")}</span>
        </h1>
        {nothing ? <EmptyState title={t("empty")} /> : null}
        {profile ? (
          <div className="mx-auto mt-5 flex max-w-3xl flex-col gap-5 text-center">
            <p className="text-2xl font-semibold" dir="auto">
              {profile.name}
            </p>
            <p className="font-semibold" dir="auto">
              {profile.headline}
            </p>
            {paragraphs.map((p) => (
              <p key={p} className="text-muted-foreground" dir="auto">
                {p}
              </p>
            ))}
            <p>
              <Link href={`/${lng}/contact/`} className="font-semibold underline underline-offset-4">
                {t("contact")}
              </Link>
            </p>
          </div>
        ) : null}
      </Section>

      {experience.length > 0 ? (
        <Section id="experience" band>
          <SectionHeading lead={t("experience.lead")} strong={t("experience.strong")} />
          <ol className="mt-5 flex flex-col gap-8">
            {experience.map((item) => (
              <li key={`${item.company}-${item.start_date}`}>
                <ExperienceItem lng={lng} item={item} />
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {education.length > 0 ? (
        <Section id="education">
          <SectionHeading lead={t("education.lead")} strong={t("education.strong")} />
          <ol className="mx-auto mt-5 flex max-w-3xl flex-col gap-8 border-s-2 border-foreground ps-6">
            {education.map((item) => (
              <li key={`${item.institution}-${item.start_date}`}>
                <p className="text-sm font-semibold text-muted-foreground">
                  <time dateTime={item.start_date}>{formatDate(item.start_date, lng, "short")}</time>
                  <span aria-hidden> – </span>
                  {item.end_date ? (
                    <time dateTime={item.end_date}>{formatDate(item.end_date, lng, "short")}</time>
                  ) : (
                    <span>{t("education.present")}</span>
                  )}
                </p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight" dir="auto">
                  {item.institution}
                </h3>
                <p className="font-semibold" dir="auto">
                  {item.degree}
                </p>
                {item.description ? (
                  <p className="mt-2 text-muted-foreground" dir="auto">
                    {item.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {skills.length > 0 ? (
        <Section id="skills" className={education.length > 0 ? "pt-0" : undefined}>
          <SectionHeading lead={t("skills.lead")} strong={t("skills.strong")} />
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {skills.map((group) => (
              <SkillGroup key={group.title} group={group} />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
