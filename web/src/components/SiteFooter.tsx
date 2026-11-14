import { getT } from "next-i18next/server";

import type { PublicProfile } from "@/lib/content/types";

export async function SiteFooter({ lng, profile }: { lng: string; profile: PublicProfile | null }) {
  const { t } = await getT("common", { lng });
  const links = profile?.links ?? [];
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:px-8">
        {links.length > 0 ? (
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.url}>
                <a href={link.url} rel="me noopener" className="text-sm font-semibold capitalize hover:underline">
                  {link.kind}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-sm text-muted-foreground">{t("footer.attribution")}</p>
      </div>
    </footer>
  );
}
