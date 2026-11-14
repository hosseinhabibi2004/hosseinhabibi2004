import Link from "next/link";
import { getT } from "next-i18next/server";

import { LocaleSwitch } from "@/components/LocaleSwitch";
import { MobileNav } from "@/components/MobileNav";
import { NAV_ITEMS } from "@/components/nav";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function SiteHeader({
  lng,
  twinPaths,
}: {
  lng: string;
  twinPaths: Record<string, string | null>;
}) {
  const { t } = await getT("common", { lng });
  return (
    <header className="relative border-b border-border bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-band focus:px-4 focus:py-2 focus:text-band-foreground"
      >
        {t("nav.skip")}
      </a>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href={`/${lng}/`} className="text-lg font-bold" aria-label={t("siteName")}>
          {t("siteName")}
        </Link>
        <nav aria-label={t("nav.main")} className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map(({ key, path }) => (
              <li key={key}>
                <Link href={`/${lng}${path}`} className="text-base font-semibold hover:underline">
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`/${lng}/about/`}
            className="hidden h-10 items-center rounded bg-band px-5 text-base font-semibold text-band-foreground md:inline-flex"
          >
            {t("nav.resume")}
          </Link>
          <LocaleSwitch lng={lng} twinPaths={twinPaths} />
          <ThemeToggle />
          <MobileNav lng={lng} />
        </div>
      </div>
    </header>
  );
}
