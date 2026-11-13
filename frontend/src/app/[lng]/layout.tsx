import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import { generateI18nStaticParams, getResources, getT, initServerI18next } from "next-i18next/server";

import { I18nProvider } from "@/i18n/client";
import { i18nConfig } from "@/i18n/config";
import { getDir, isLocale, locales } from "@/lib/locale";
import { absoluteUrl } from "@/lib/site";

import "../globals.css";

initServerI18next(i18nConfig);

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Persian script. Latin text keeps Geist; the fallback chain in globals.css
// picks Vazirmatn for Arabic-script glyphs.
const vazirmatn = Vazirmatn({ variable: "--font-vazirmatn", subsets: ["arabic"] });

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
      className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider language={lng} resources={resources}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
