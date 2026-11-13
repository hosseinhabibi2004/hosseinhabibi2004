import type { LucideIcon } from "lucide-react";

/** "Nothing here" — what a list or panel shows for a successful, empty answer. */
export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
    <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
      <Icon aria-hidden className="size-5" />
    </span>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-bold">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);
