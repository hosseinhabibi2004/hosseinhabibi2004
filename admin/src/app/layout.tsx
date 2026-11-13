import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/vazirmatn";

import type { Metadata } from "next";
import { getResources, getT, initServerI18next } from "next-i18next/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/client";
import { i18nConfig } from "@/i18n/config";
import { getDir } from "@/i18n/language";
import { QueryProvider } from "@/lib/query-provider";

import "./globals.css";

initServerI18next(i18nConfig);

export const metadata: Metadata = {
  title: "Admin",
  // Local-only tool: nothing here is ever public.
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { i18n, lng } = await getT();
  const resources = getResources(i18n);

  return (
    <html lang={lng} dir={getDir(lng)} className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <I18nProvider language={lng} resources={resources}>
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster />
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
