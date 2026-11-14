"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIST_PAGES = new Set(["posts", "projects", "tags"]);
const NATIVE_NAME: Record<string, string> = { en: "English", fa: "فارسی" };

function otherLocale(lng: string): string {
  return lng === "fa" ? "en" : "fa";
}

/** Where the switch goes: the twin page, else the other locale's list page, else its home. */
function targetFor(lng: string, pathname: string, twinPaths: Record<string, string | null>): string {
  const other = otherLocale(lng);
  const twin = twinPaths[pathname];
  if (twin) return twin;
  if (twin === null) {
    const section = pathname.split("/").filter(Boolean)[1];
    if (section && LIST_PAGES.has(section)) return `/${other}/${section}/`;
  }
  return `/${other}/`;
}

export function LocaleSwitch({
  lng,
  twinPaths,
}: {
  lng: string;
  twinPaths: Record<string, string | null>;
}) {
  const pathname = usePathname() ?? `/${lng}/`;
  const other = otherLocale(lng);
  return (
    <Link
      href={targetFor(lng, pathname, twinPaths)}
      hrefLang={other}
      lang={other}
      className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-semibold hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
    >
      {NATIVE_NAME[other]}
    </Link>
  );
}
