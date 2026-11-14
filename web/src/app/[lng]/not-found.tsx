import { lng as rootLng } from "next/root-params";

import { NotFoundBlock } from "@/components/NotFoundContent";
import { Section } from "@/components/Section";
import { defaultLocale, isLocale } from "@/lib/locale";

// Shown when a page under a locale calls notFound(); the layout around it supplies lang/dir.
export default async function LocaleNotFound() {
  const value = await rootLng();
  const lng = value && isLocale(value) ? value : defaultLocale;
  return (
    <Section className="py-24">
      <NotFoundBlock lng={lng} />
    </Section>
  );
}
