import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <p className="text-xl font-semibold">{title}</p>
      {children ? <div className="mt-2 text-muted-foreground">{children}</div> : null}
    </div>
  );
}
