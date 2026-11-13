import { cn } from "@/lib/utils";

interface WordmarkProps {
  name: string;
  /** A line under the name, e.g. what the product is. */
  tagline?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { sm: "text-base", md: "text-xl", lg: "text-3xl" } as const;

/** The product's name in the heaviest weight; it inherits the surrounding colour. */
export const Wordmark: React.FC<WordmarkProps> = ({ name, tagline, size = "md", className }) => (
  <span className={cn("inline-flex flex-col gap-1", className)}>
    <span className={cn("font-black leading-none tracking-tight", SIZES[size])}>{name}</span>
    {tagline ? (
      <span className="text-xs font-medium leading-none text-muted-foreground">{tagline}</span>
    ) : null}
  </span>
);
