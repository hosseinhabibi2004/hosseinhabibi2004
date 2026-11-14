import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Regular-weight lead word(s), e.g. "My". */
  lead?: string;
  /** Extra-bold word(s), e.g. "Skills". */
  strong: string;
  id?: string;
  className?: string;
}

/** The template's two-weight centred heading: a regular lead and an extra-bold word. */
export function SectionHeading({ lead, strong, id, className }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={cn(
        "flex flex-wrap items-baseline justify-center gap-x-4 py-5 text-center text-4xl leading-tight tracking-tight md:text-5xl",
        className,
      )}
    >
      {lead ? <span className="font-normal">{lead}</span> : null}
      <span className="font-extrabold">{strong}</span>
    </h2>
  );
}
