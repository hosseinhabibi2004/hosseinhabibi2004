import type { PublicExperience } from "@/lib/content/types";
import { formatDate, type Locale } from "@/lib/format";

interface ExperienceItemProps {
  lng: Locale;
  item: PublicExperience;
}

const PRESENT: Record<Locale, string> = { en: "Present", fa: "تا امروز" };

/** Lines starting with "- " become a list, other lines paragraphs. */
function Description({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const bullets = lines.filter((l) => l.startsWith("- "));
  const prose = lines.filter((l) => !l.startsWith("- "));
  return (
    <div className="mt-4 space-y-2 text-band-foreground/80" dir="auto">
      {prose.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {bullets.length > 0 ? (
        <ul className="list-disc ps-5">
          {bullets.map((line) => (
            <li key={line}>{line.slice(2)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** A card for the black experience band. */
export function ExperienceItem({ lng, item }: ExperienceItemProps) {
  return (
    <article className="rounded-[10px] border border-band-foreground/30 px-6 py-7">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight" dir="auto">
            {item.role}
          </h3>
          <p className="mt-1 text-band-foreground/80">
            {item.company_url ? (
              <a
                href={item.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {item.company}
              </a>
            ) : (
              <span>{item.company}</span>
            )}
            {item.location ? <span aria-hidden> · </span> : null}
            {item.location ? <span>{item.location}</span> : null}
          </p>
        </div>
        <p className="font-semibold text-band-foreground/80">
          <time dateTime={item.start_date}>{formatDate(item.start_date, lng, "short")}</time>
          <span aria-hidden> – </span>
          {item.end_date ? (
            <time dateTime={item.end_date}>{formatDate(item.end_date, lng, "short")}</time>
          ) : (
            <span>{PRESENT[lng]}</span>
          )}
        </p>
      </div>
      <Description text={item.description} />
    </article>
  );
}
