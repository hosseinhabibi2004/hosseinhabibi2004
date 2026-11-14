import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  /** The black band variant of the template. */
  band?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({ id, band = false, className, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-15",
        band ? "bg-band text-band-foreground" : "bg-background text-foreground",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-5 md:px-20">{children}</div>
    </section>
  );
}
