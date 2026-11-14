import { getT } from "next-i18next/server";

import { getDir, type Locale } from "@/lib/locale";
import { assetPath } from "@/lib/site";

/** One language block of a 404 page: it carries its own `lang` and `dir`. */
export async function NotFoundBlock({ lng }: { lng: Locale }) {
  const { t } = await getT("common", { lng });
  return (
    <section lang={lng} dir={getDir(lng)} className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-3xl font-bold md:text-4xl">{t("notFound.title")}</h1>
      <p className="text-muted-foreground">{t("notFound.text")}</p>
      <a
        href={assetPath(`/${lng}/`)}
        className="rounded-sm border-2 border-foreground px-5 py-2 font-medium transition-colors hover:bg-foreground hover:text-background"
      >
        {t("notFound.home")}
      </a>
    </section>
  );
}
