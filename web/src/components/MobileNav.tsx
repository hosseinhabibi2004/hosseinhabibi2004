"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { NAV_ITEMS } from "@/components/nav";
import { useT } from "@/i18n/client";

/** Disclosure menu for small screens: a button that shows or hides the nav links. */
export function MobileNav({ lng }: { lng: string }) {
  const { t } = useT("common");
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? t("nav.close") : t("nav.open")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-md border border-border hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>
      {open ? (
        <nav
          id={id}
          aria-label={t("nav.mobile")}
          className="absolute inset-x-0 top-full border-b border-border bg-background px-4 py-4 shadow-md"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ key, path }) => (
              <li key={key}>
                <Link
                  href={`/${lng}${path}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-base font-semibold capitalize hover:bg-accent"
                >
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/${lng}/about/`}
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-md bg-band px-3 py-3 text-center text-base font-semibold text-band-foreground"
              >
                {t("nav.resume")}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
