/**
 * The title block at the top of a screen: heading, one line of what it is for,
 * and the screen's primary action at the end. Wraps on a phone so a long
 * long title never pushes the action off-screen.
 */
export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="flex min-w-0 flex-col gap-1">
      <h2 className="text-xl font-black">{title}</h2>
      {description ? (
        <p className="max-w-prose text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
    {actions ? <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);
