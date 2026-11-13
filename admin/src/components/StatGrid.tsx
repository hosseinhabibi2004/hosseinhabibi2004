import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Figures side by side on one hairline grid — the money and count totals of
 * reports and accounts. One surface with 1px gaps rather than a card per
 * number, so a row of eight reads as a table, not a wall of boxes.
 */
const WIDE_COLUMNS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
};

/** Columns that fill every row for `count` tiles, so no grey gap is left over. */
function columnsFor(count: number): number {
  if (count <= 5) return Math.max(1, count);
  if (count % 4 === 0) return 4;
  if (count % 3 === 0) return 3;
  if (count % 5 === 0) return 5;
  return 4;
}

export function StatGrid({
  children,
  className,
  count,
}: {
  children: React.ReactNode;
  className?: string;
  /** How many tiles there are; when given the grid takes the column count that leaves no empty cell. */
  count?: number;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border max-md:[&>:last-child:nth-child(odd)]:col-span-2",
        count === undefined ? "md:grid-cols-4" : WIDE_COLUMNS[columnsFor(count)],
        className,
      )}
    >
      {children}
    </dl>
  );
}

/**
 * One figure in a `StatGrid`. `value` is already formatted for the interface language; `tone="negative"` colours only the number, for something that needs attention.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  emphasis = false,
  wrap = true,
  href,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "negative";
  /** The headline figure of the grid: larger, on the brand's ink. */
  emphasis?: boolean;
  /** Let the figure take its full width (wrapping the unit under the number) instead of eliding it. On by default: a clipped amount is a wrong amount. */
  wrap?: boolean;
  /** Makes the whole tile a link (the label is the link, stretched over the tile). */
  href?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col gap-1 bg-card p-4 sm:p-5",
        emphasis && "bg-primary text-primary-foreground",
        href && "transition-colors hover:bg-accent/50",
        href && emphasis && "hover:bg-primary/90",
      )}
    >
      <dt
        className={cn(
          "text-xs font-medium text-muted-foreground",
          emphasis && "text-primary-foreground/70",
        )}
      >
        {href ? (
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
          >
            {label}
          </Link>
        ) : (
          label
        )}
      </dt>
      <dd
        className={cn(
          "font-black tracking-tight",
          wrap ? "text-lg break-words sm:text-xl [&_.whitespace-nowrap]:whitespace-normal" : "truncate text-xl sm:text-2xl",
          tone === "negative" && "text-destructive",
        )}
      >
        {value}
      </dd>
      {hint ? (
        <dd
          className={cn(
            "text-xs text-muted-foreground",
            emphasis && "text-primary-foreground/70",
          )}
        >
          {hint}
        </dd>
      ) : null}
    </div>
  );
}
