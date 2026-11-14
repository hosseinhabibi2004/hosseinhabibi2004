import type { Metadata } from "next";

import { NotFoundBlock } from "@/components/NotFoundContent";
import { ThemeScript } from "@/components/ThemeScript";

import "@fontsource-variable/sora";
import "@fontsource-variable/vazirmatn";

import "./globals.css";

export const metadata: Metadata = {
  title: "404 · Hossein Habibi",
  robots: { index: false, follow: false },
};

// The app has two root layouts, so the 404 for a URL outside any locale needs its own <html>.
// GitHub Pages serves the resulting out/404.html for every unknown path, where the locale is
// unknown, so the page is bilingual.
export default function GlobalNotFound() {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col items-center justify-center gap-12 bg-background px-4 py-16 font-sans text-foreground">
        <NotFoundBlock lng="en" />
        <hr className="w-24 border-border" />
        <NotFoundBlock lng="fa" />
      </body>
    </html>
  );
}
