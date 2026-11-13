import { getT } from "next-i18next/server";

type Params = Promise<{ lng: string }>;

// A bare placeholder: the real pages are written later. It exists so the
// static export has a route per locale.
export default async function Home({ params }: { params: Params }) {
  const { lng } = await params;
  const { t } = await getT("common", { lng });

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">{t("siteName")}</h1>
    </main>
  );
}
