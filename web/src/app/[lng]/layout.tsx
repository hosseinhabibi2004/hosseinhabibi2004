import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateI18nStaticParams, getResources, getT, initServerI18next } from "next-i18next/server";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeScript } from "@/components/ThemeScript";
import { I18nProvider } from "@/i18n/client";
import { i18nConfig } from "@/i18n/config";
import { getProfile, getTwinPaths } from "@/lib/content";
import { getDir, isLocale, locales } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site";

import "@fontsource-variable/geist-mono";
import "@fontsource-variable/sora";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/vazirmatn";

import "../globals.css";

initServerI18next(i18nConfig);

type Params = Promise<{ lng: string }>;

export function generateStaticParams() {
  return generateI18nStaticParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await getT("common", { lng });

  return {
    title: { default: t("siteName"), template: `%s · ${t("siteName")}` },
    description: t("siteDescription"),
    metadataBase: new URL(absoluteUrl("/")),
    alternates: {
      canonical: absoluteUrl(`/${lng}/`),
      languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(`/${l}/`)])),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Params }>) {
  const { lng } = await params;
  if (!isLocale(lng)) notFound();

  const { i18n } = await getT("common", { lng });
  const resources = getResources(i18n);

  return (
    <html
      lang={lng}
      dir={getDir(lng)}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider language={lng} resources={resources}>
          <SiteHeader lng={lng} twinPaths={getTwinPaths(lng)} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter lng={lng} profile={getProfile(lng)} />
        </I18nProvider>
      </body>
    </html>
  );
}
